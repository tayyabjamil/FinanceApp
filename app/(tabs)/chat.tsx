import { useMemo, useState } from 'react';
import { Button, H2, Input, Paragraph, ScrollView, YStack } from 'tamagui';

import { Screen } from '@/components/screen';

type Msg = { role: 'user' | 'ai'; text: string };

export default function ChatScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Ask me about your spending (MVP placeholder).' },
  ]);

  const suggestions = useMemo(
    () => ['Why am I overspending?', 'Can I save £300 this month?', 'Where did my money go?'],
    []
  );

  function send(msg: string) {
    const clean = msg.trim();
    if (!clean) return;
    setMessages((m) => [...m, { role: 'user', text: clean }, { role: 'ai', text: 'Coming next: real AI insights.' }]);
    setText('');
  }

  return (
    <Screen>
      <H2>AI Chat</H2>
      <Paragraph opacity={0.7}>MVP: UI + suggested prompts (no backend yet).</Paragraph>

      <ScrollView flex={1}>
        <YStack gap="$2">
          {messages.map((m, idx) => (
            <YStack
              key={idx}
              alignSelf={m.role === 'user' ? 'flex-end' : 'flex-start'}
              maxWidth="85%"
              padding="$3"
              borderRadius="$4"
              backgroundColor={m.role === 'user' ? '$blue6' : '$gray4'}
            >
              <Paragraph>{m.text}</Paragraph>
            </YStack>
          ))}
        </YStack>
      </ScrollView>

      <YStack gap="$2">
        <YStack gap="$2">
          {suggestions.map((s) => (
            <Button key={s} size="$3" onPress={() => send(s)}>
              {s}
            </Button>
          ))}
        </YStack>
        <Input placeholder="Ask a question…" value={text} onChangeText={setText} />
        <Button onPress={() => send(text)}>Send</Button>
      </YStack>
    </Screen>
  );
}

