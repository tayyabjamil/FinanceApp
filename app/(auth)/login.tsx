import { useState } from 'react';
import { Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, H2, Input, Paragraph, YStack } from 'tamagui';

import { getSession, signIn } from '@/lib/session';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    try {
      const ok = await signIn(email.trim(), password);
      if (!ok) {
        Alert.alert('Login failed', 'Invalid email or password.');
        return;
      }
      const session = await getSession();
      router.replace(session.hasOnboarded ? '/(tabs)/dashboard' : '/(onboarding)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$3" justifyContent="center" backgroundColor="$background">
      <H2>Welcome back</H2>
      <Paragraph>Log in to continue.</Paragraph>
      <Input
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button disabled={loading} onPress={onLogin}>
        {loading ? 'Logging in…' : 'Login'}
      </Button>
      <Link href="/(auth)/signup" asChild>
        <Button chromeless>Don’t have an account? Sign up</Button>
      </Link>
    </YStack>
  );
}

