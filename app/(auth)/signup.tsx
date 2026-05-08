import { useState } from 'react';
import { Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, H2, Input, Paragraph, YStack } from 'tamagui';

import { signUp } from '@/lib/session';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSignup() {
    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      Alert.alert('Check your details', 'Enter an email and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp(cleanEmail, password);
      router.replace('/(onboarding)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$3" justifyContent="center" backgroundColor="$background">
      <H2>Create account</H2>
      <Paragraph>Email + password (local MVP).</Paragraph>
      <Input
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Password (min 6 chars)" secureTextEntry value={password} onChangeText={setPassword} />
      <Button disabled={loading} onPress={onSignup}>
        {loading ? 'Creating…' : 'Sign up'}
      </Button>
      <Link href="/(auth)/login" asChild>
        <Button chromeless>Already have an account? Login</Button>
      </Link>
    </YStack>
  );
}

