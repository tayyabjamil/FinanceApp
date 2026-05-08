import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, H2, Input, Paragraph, XStack, YStack } from 'tamagui';

import type { TransactionCategory, TransactionType } from '@/lib/transactions';
import { addTransaction } from '@/lib/transactions';

const CATEGORIES: TransactionCategory[] = ['food', 'transport', 'shopping', 'bills', 'rent', 'salary', 'other'];

export default function AddTransactionScreen() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = useMemo(() => Number(amount.replace(/[^0-9.]/g, '')), [amount]);

  const autoCategoryHint = useMemo(() => {
    const m = merchant.toLowerCase();
    if (m.includes('uber') || m.includes('bolt')) return 'transport';
    if (m.includes('tesco') || m.includes('aldi') || m.includes('lidl')) return 'food';
    if (m.includes('amazon')) return 'shopping';
    return null;
  }, [merchant]);

  async function onSave() {
    if (!merchant.trim()) {
      Alert.alert('Merchant', 'Please enter a merchant.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const chosenCategory = category === 'other' && autoCategoryHint ? autoCategoryHint : category;
      await addTransaction({
        type,
        amount: numericAmount,
        merchant: merchant.trim(),
        category: chosenCategory,
        date: new Date(date).toISOString(),
        notes: notes.trim() ? notes.trim() : undefined,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H2>Add transaction</H2>
      <Paragraph opacity={0.7}>MVP: basic form + simple AI auto-categorise hint.</Paragraph>

      <XStack gap="$2">
        <Button flex={1} theme={type === 'expense' ? 'active' : undefined} onPress={() => setType('expense')}>
          Expense
        </Button>
        <Button flex={1} theme={type === 'income' ? 'active' : undefined} onPress={() => setType('income')}>
          Income
        </Button>
      </XStack>

      <Input placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <Input placeholder="Merchant" value={merchant} onChangeText={setMerchant} />

      {autoCategoryHint ? (
        <Paragraph opacity={0.7}>AI suggestion: {autoCategoryHint}</Paragraph>
      ) : (
        <Paragraph opacity={0.7}>AI suggestion: (type a merchant)</Paragraph>
      )}

      <XStack gap="$2" flexWrap="wrap">
        {CATEGORIES.map((c) => (
          <Button key={c} size="$3" theme={category === c ? 'active' : undefined} onPress={() => setCategory(c)}>
            {c}
          </Button>
        ))}
      </XStack>

      <Input placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <Input placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />

      <Button disabled={loading} onPress={onSave}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
      <Button chromeless onPress={() => router.back()}>
        Cancel
      </Button>
    </YStack>
  );
}

