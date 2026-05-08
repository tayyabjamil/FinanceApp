import { Button, Card, H2, Paragraph, Progress, XStack, YStack } from 'tamagui';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'expo-router';

import { Screen } from '@/components/screen';
import { getItem } from '@/lib/storage';
import type { Transaction } from '@/lib/transactions';
import { getSession } from '@/lib/session';

export default function DashboardScreen() {
  const [name, setName] = useState<string>('—');
  const [income, setIncome] = useState<number>(0);
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const session = await getSession();
      const list = (await getItem<Transaction[]>('financeai.transactions')) ?? [];
      if (cancelled) return;
      setName(session.profile?.name ?? '—');
      setIncome(session.profile?.monthlyIncome ?? 0);
      setTxns(list);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const expenses = txns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const extraIncome = txns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income + extraIncome;
    const balance = totalIncome - expenses;
    return { expenses, totalIncome, balance };
  }, [income, txns]);

  const savingsTarget = Math.max(1, totals.totalIncome * 0.2);
  const savingsProgress = Math.max(0, Math.min(1, totals.balance / savingsTarget));

  return (
    <Screen>
      <H2>Hi {name}</H2>
      <Paragraph>Here’s your month at a glance.</Paragraph>

      <XStack gap="$3" flexWrap="wrap">
        <Card padded width="48%">
          <Paragraph>Income</Paragraph>
          <H2>£{Math.round(totals.totalIncome)}</H2>
        </Card>
        <Card padded width="48%">
          <Paragraph>Expenses</Paragraph>
          <H2>£{Math.round(totals.expenses)}</H2>
        </Card>
        <Card padded width="100%">
          <Paragraph>Balance</Paragraph>
          <H2>£{Math.round(totals.balance)}</H2>
        </Card>
      </XStack>

      <Card padded>
        <YStack gap="$2">
          <Paragraph>Savings progress (goal: 20%)</Paragraph>
          <Progress value={savingsProgress * 100}>
            <Progress.Indicator />
          </Progress>
          <Paragraph opacity={0.7}>
            Quick AI insight: try reducing discretionary spend by £{Math.round(totals.expenses * 0.05)} this week.
          </Paragraph>
        </YStack>
      </Card>

      <Link href="/add-transaction" asChild>
        <Button>Add transaction</Button>
      </Link>
    </Screen>
  );
}

