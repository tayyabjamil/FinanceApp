import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, H2, Input, Paragraph, RadioGroup, XStack, YStack, Label } from 'tamagui';

import type { AppGoal } from '@/lib/session';
import { saveProfile } from '@/lib/session';

const GOALS: { id: AppGoal; label: string }[] = [
  { id: 'save', label: 'Save more' },
  { id: 'budget', label: 'Stick to a budget' },
  { id: 'reduce_spending', label: 'Reduce spending' },
  { id: 'track_money', label: 'Track my money' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [goal, setGoal] = useState<AppGoal>('save');
  const [loading, setLoading] = useState(false);

  const monthlyIncome = useMemo(() => Number(income.replace(/[^0-9.]/g, '')), [income]);

  async function onContinue() {
    if (!name.trim()) {
      Alert.alert('Your name', 'Please enter your name.');
      return;
    }
    if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
      Alert.alert('Monthly income', 'Please enter a valid monthly income.');
      return;
    }

    setLoading(true);
    try {
      await saveProfile({
        name: name.trim(),
        monthlyIncome,
        goal,
        currency: 'GBP',
      });
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$3" justifyContent="center" backgroundColor="$background">
      <H2>Let’s personalize</H2>
      <Paragraph>Just a few details to tailor your dashboard.</Paragraph>

      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input placeholder="Monthly income (e.g. 2500)" keyboardType="decimal-pad" value={income} onChangeText={setIncome} />

      <YStack gap="$2" paddingTop="$2">
        <Paragraph>Main goal</Paragraph>
        <RadioGroup value={goal} onValueChange={(v) => setGoal(v as AppGoal)}>
          {GOALS.map((g) => (
            <XStack key={g.id} alignItems="center" gap="$2" paddingVertical="$1">
              <RadioGroup.Item value={g.id} id={g.id}>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <Label htmlFor={g.id}>{g.label}</Label>
            </XStack>
          ))}
        </RadioGroup>
      </YStack>

      <Button disabled={loading} onPress={onContinue}>
        {loading ? 'Saving…' : 'Continue'}
      </Button>
    </YStack>
  );
}

