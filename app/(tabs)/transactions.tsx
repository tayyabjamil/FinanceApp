import { useEffect, useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { Button, H2, Input, Paragraph, Separator, XStack, YStack } from 'tamagui';

import { Screen } from '@/components/screen';
import type { Transaction, TransactionCategory, TransactionType } from '@/lib/transactions';
import { listTransactions } from '@/lib/transactions';

export default function TransactionsScreen() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [category, setCategory] = useState<TransactionCategory | 'all'>('all');
  const [items, setItems] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const list = await listTransactions();
      if (cancelled) return;
      setItems(list);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [items, query, type, category]);

  return (
    <Screen>
      <XStack justifyContent="space-between" alignItems="center">
        <H2>Transactions</H2>
        <Link href="/add-transaction" asChild>
          <Button size="$3">Add</Button>
        </Link>
      </XStack>

      <Input placeholder="Search merchant, category, notes…" value={query} onChangeText={setQuery} />

      <XStack gap="$2" flexWrap="wrap">
        <Button size="$3" theme={type === 'all' ? 'active' : undefined} onPress={() => setType('all')}>
          All
        </Button>
        <Button size="$3" theme={type === 'expense' ? 'active' : undefined} onPress={() => setType('expense')}>
          Expenses
        </Button>
        <Button size="$3" theme={type === 'income' ? 'active' : undefined} onPress={() => setType('income')}>
          Income
        </Button>
      </XStack>

      <XStack gap="$2" flexWrap="wrap">
        {(['all', 'food', 'transport', 'shopping', 'bills', 'rent', 'salary', 'other'] as const).map((c) => (
          <Button
            key={c}
            size="$3"
            theme={category === c ? 'active' : undefined}
            onPress={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </XStack>

      <Separator />

      <YStack gap="$2">
        {filtered.length === 0 ? (
          <Paragraph opacity={0.7}>No transactions yet.</Paragraph>
        ) : (
          filtered.map((t) => (
            <XStack key={t.id} justifyContent="space-between" alignItems="center" paddingVertical="$2">
              <YStack>
                <Paragraph>{t.merchant}</Paragraph>
                <Paragraph opacity={0.6}>
                  {t.category} • {new Date(t.date).toLocaleDateString()}
                </Paragraph>
              </YStack>
              <Paragraph>
                {t.type === 'expense' ? '-' : '+'}£{t.amount.toFixed(2)}
              </Paragraph>
            </XStack>
          ))
        )}
      </YStack>
    </Screen>
  );
}

