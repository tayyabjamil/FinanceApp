import { Button, Card, H2, Paragraph, Progress, YStack } from 'tamagui';

import { Screen } from '@/components/screen';

export default function InsightsScreen() {
  return (
    <Screen>
      <H2>Insights</H2>
      <Paragraph opacity={0.7}>MVP: breakdown + recommendations placeholders.</Paragraph>

      <Card padded>
        <YStack gap="$2">
          <Paragraph>Category breakdown</Paragraph>
          <Progress value={60}>
            <Progress.Indicator />
          </Progress>
          <Paragraph opacity={0.7}>Food: 32% • Bills: 25% • Shopping: 18%</Paragraph>
        </YStack>
      </Card>

      <Card padded>
        <YStack gap="$2">
          <Paragraph>Monthly comparison</Paragraph>
          <Paragraph opacity={0.7}>You spent 8% more than last month.</Paragraph>
          <Button size="$3">See recommendations</Button>
        </YStack>
      </Card>

      <Card padded>
        <YStack gap="$2">
          <Paragraph>Spending warnings</Paragraph>
          <Paragraph opacity={0.7}>You’re close to your Shopping budget.</Paragraph>
        </YStack>
      </Card>
    </Screen>
  );
}

