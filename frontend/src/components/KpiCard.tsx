import { Card, Text, Group } from '@mantine/core';

interface KpiCardProps {
    title: string;
    value: string | number;
    description?: string;
}

export function KpiCard({ title, value, description }: KpiCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text fw={500} c="dimmed">{title}</Text>
            </Group>

            <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>
                {value}
            </Text>

            {description && (
                <Text size="sm" c="dimmed" mt="sm">
                    {description}
                </Text>
            )}
        </Card>
    );
}
