import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, H2, Paragraph, Separator, YStack } from 'tamagui';

import { Screen } from '@/components/screen';
import { getSession, signOut } from '@/lib/session';

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState<string>('—');
  const [income, setIncome] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('GBP');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const s = await getSession();
      if (cancelled) return;
      setName(s.profile?.name ?? '—');
      setIncome(s.profile?.monthlyIncome ?? 0);
      setCurrency(s.profile?.currency ?? 'GBP');
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Screen>
      <H2>Profile</H2>
      <Paragraph opacity={0.7}>Settings (MVP).</Paragraph>

      <YStack gap="$1">
        <Paragraph>Name: {name}</Paragraph>
        <Paragraph>Income: {currency} {Math.round(income)}</Paragraph>
        <Paragraph>AI preferences: coming soon</Paragraph>
      </YStack>

      <Separator />

      <Button onPress={() => router.push('/(onboarding)')}>Edit onboarding</Button>
      <Button theme="red" onPress={onLogout}>
        Logout
      </Button>
    </Screen>
  );
}

