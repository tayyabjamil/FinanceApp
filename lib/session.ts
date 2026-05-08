import { getItem, removeItem, setItem } from './storage';

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

const KEYS = {
  auth: 'financeai.auth',
  profile: 'financeai.profile',
};

type StoredAuth = {
  email: string;
  password: string;
};

export async function getSession(): Promise<Session> {
  const auth = await getItem<StoredAuth>(KEYS.auth);
  const profile = await getItem<Profile>(KEYS.profile);

  return {
    isLoggedIn: Boolean(auth?.email),
    hasOnboarded: Boolean(profile?.name),
    email: auth?.email,
    profile: profile ?? undefined,
  };
}

export async function signUp(email: string, password: string): Promise<void> {
  await setItem(KEYS.auth, { email, password } satisfies StoredAuth);
}

export async function signIn(email: string, password: string): Promise<boolean> {
  const auth = await getItem<StoredAuth>(KEYS.auth);
  if (!auth) return false;
  if (auth.email !== email) return false;
  if (auth.password !== password) return false;
  // auth already persisted; treat as logged in
  return true;
}

export async function signOut(): Promise<void> {
  await removeItem(KEYS.auth);
}

export async function saveProfile(profile: Profile): Promise<void> {
  await setItem(KEYS.profile, profile);
}

