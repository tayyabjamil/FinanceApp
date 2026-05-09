import { supabase } from './supabase';

export type AppGoal = 'save' | 'budget' | 'reduce_spending' | 'track_money';

export type Profile = {
  name: string;
  monthlyIncome: number;
  goal: AppGoal;
  currency: string; // e.g. GBP
};

export type Session = {
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  email?: string;
  profile?: Profile;
};

export async function getSession(): Promise<Session> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { isLoggedIn: false, hasOnboarded: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, monthly_income, goal, currency')
    .eq('id', session.user.id)
    .single();

  const mappedProfile: Profile | undefined = profile
    ? {
        name: profile.name,
        monthlyIncome: profile.monthly_income,
        goal: profile.goal as AppGoal,
        currency: profile.currency,
      }
    : undefined;

  return {
    isLoggedIn: true,
    hasOnboarded: Boolean(mappedProfile?.name),
    email: session.user.email,
    profile: mappedProfile,
  };
}

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Sign in immediately so we have a live session regardless of email confirmation settings
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
}

export async function signIn(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return false;
  return true;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function saveProfile(profile: Profile): Promise<void> {
  // getUser() does a live network check — more reliable than getSession() right after signUp
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: profile.name,
    monthly_income: profile.monthlyIncome,
    goal: profile.goal,
    currency: profile.currency,
  });

  if (error) throw error;
}
