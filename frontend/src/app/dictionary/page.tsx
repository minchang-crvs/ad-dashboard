"use client";

import { Container, Title, Text, Card, Grid, ThemeIcon, Flex } from "@mantine/core";
import {
    IconBook2,
    IconTrendingUp,
    IconHandClick,
    IconEye,
    IconTarget,
    IconFilter
} from '@tabler/icons-react';

const dictionaryEntries = [
    {
        term: "ROAS (Return on Ad Spend)",
        korean: "광고 대비 수익률",
        description: "지출한 광고비 대비 발생한 매출의 비율을 나타냅니다. 마케팅 캠페인의 수익성을 평가하는 가장 핵심적인 지표입니다. (공식: 광고 매출 ÷ 광고 타겟팅 비용 × 100)",
        icon: IconTrendingUp,
        color: "blue"
    },
    {
        term: "Impressions",
        korean: "노출수",
        description: "광고가 사용자 화면에 표시된 총 횟수입니다. 사용자가 광고를 클릭하지 않더라도 화면에 랜더링될 때마다 카운트되며, 캠페인의 도달 범위와 인지도를 파악하는 기본 지표입니다.",
        icon: IconEye,
        color: "violet"
    },
    {
        term: "Clicks",
        korean: "클릭수",
        description: "사용자가 광고를 실제로 클릭한 총 횟수입니다. 단순한 노출을 넘어 광고에 대한 사용자의 직접적인 관심도와 참여도를 나타내는 중요한 척도입니다.",
        icon: IconHandClick,
        color: "grape"
    },
    {
        term: "랜딩페이지 (Landing Page)",
        korean: "도착 페이지",
        description: "사용자가 광고를 클릭한 직후 가장 먼저 도달하게 되는 첫 웹페이지를 의미합니다. 랜딩페이지의 첫인상과 사용자 경험이 실제 최종 전환(Pledge)으로 이어지는 핵심 관문 역할을 합니다.",
        icon: IconTarget,
        color: "teal"
    },
    {
        term: "Funnel 분석",
        korean: "퍼널(깔때기) 분석",
        description: "고객이 서비스에 처음 유입되는 시점(Impressions)부터 최종 목표(약정 완료)에 도달하기까지의 과정을 여러 단계로 나누어 분석하는 방법론입니다. 단계별 전환율과 이탈률(Drop-off)을 시각화하여 마케팅의 어느 구간에서 병목 현상이 발생하는지 진단하고 개선합니다.",
        icon: IconFilter,
        color: "orange"
    }
];

export default function DictionaryPage() {
    return (
        <Container size="xl" py="xl">
            <Flex align="center" gap="sm" mb="xl">
                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                    <IconBook2 size={28} />
                </ThemeIcon>
                <Title order={1}>광고 지표 용어 사전</Title>
            </Flex>

            <Grid>
                {dictionaryEntries.map((entry) => (
                    <Grid.Col span={{ base: 12, md: 6, lg: 6 }} key={entry.term}>
                        <Card shadow="sm" padding="xl" radius="md" withBorder h="100%">
                            <Flex align="center" gap="md" mb="md">
                                <ThemeIcon size={48} radius="md" color={entry.color} variant="light">
                                    <entry.icon size={26} stroke={2} />
                                </ThemeIcon>
                                <div>
                                    <Title order={3} size="h4" mb={4}>{entry.term}</Title>
                                    <Text size="sm" c="dimmed" fw={600}>{entry.korean}</Text>
                                </div>
                            </Flex>
                            <Text size="md" lh={1.6} mt="md">
                                {entry.description}
                            </Text>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </Container>
    );
}
