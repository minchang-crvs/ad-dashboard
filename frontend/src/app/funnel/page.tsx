"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Title, Skeleton, Box, Card, Text, Group, MultiSelect } from "@mantine/core";
import { MonthPickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconArrowRight } from '@tabler/icons-react';
import { fetchFunnel, fetchCampaigns } from "@/services/api";

const STAGE_COLORS = ['#339af0', '#51cf66', '#fcc419', '#ff922b', '#ff6b6b'];
const STAGE_LABELS = ['광고 클릭', '랜딩페이지 방문', '랜딩페이지 50%', '약정 시작', '약정 완료'];
const STAGE_KEYS = ['clicks', 'landing_visits', 'landing_scroll', 'pledge_start', 'pledge_complete'];

function HorizontalFunnel({ data }: { data: { name: string, value: number, fill: string }[] }) {
    const maxVal = Math.max(...data.map(d => d.value), 1);

    return (
        <Group wrap="nowrap" align="center" gap="md" style={{ overflowX: "auto", padding: "10px 0" }}>
            {data.map((step, index) => {
                const nextStep = data[index + 1];
                const conversionRate = nextStep && step.value > 0 ? ((nextStep.value / step.value) * 100).toFixed(1) : "0.0";

                // Visual scale 
                const heightPercent = Math.max((step.value / maxVal) * 100, 5); // min 5% height

                // Highlight specific conversion rates
                let rateColor = "blue";
                if (step.name === "랜딩페이지 방문") rateColor = "red";
                if (step.name === "랜딩페이지 50%") rateColor = "orange";
                if (step.name === "약정 시작") rateColor = "teal";

                return (
                    <Group wrap="nowrap" gap="md" key={step.name}>
                        <Card shadow="xs" radius="md" withBorder p={0} style={{ minWidth: 160, height: 140, display: 'flex', flexDirection: 'column' }}>
                            <Box p="md" style={{ flex: 1, zIndex: 2 }}>
                                <Text size="sm" c="dimmed" fw={600}>{step.name}</Text>
                                <Text size="xl" fw={700}>{Math.round(step.value).toLocaleString()}</Text>
                            </Box>
                            {/* Visual Background Bar */}
                            <Box style={{
                                height: `${heightPercent}%`,
                                backgroundColor: step.fill,
                                opacity: 0.2,
                                width: '100%',
                                marginTop: 'auto',
                                borderTop: `4px solid ${step.fill}`
                            }} />
                        </Card>
                        {nextStep && (
                            <Box ta="center" miw={50}>
                                <Text size="sm" c={rateColor} fw={800} mb={4}>{conversionRate}%</Text>
                                <IconArrowRight size={24} color="#adb5bd" stroke={1.5} />
                            </Box>
                        )}
                    </Group>
                );
            })}
        </Group>
    );
}

export default function FunnelPage() {
    const [funnelData, setFunnelData] = useState<any>(null);

    // Filter states
    const [loading, setLoading] = useState(true);
    const [monthRange, setMonthRange] = useState<[Date | null, Date | null]>([null, null]);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

    // Meta data states
    const [allCampaignsList, setAllCampaignsList] = useState<string[]>([]);

    useEffect(() => {
        // Prevent fetching if only the start date is selected
        if (monthRange[0] !== null && monthRange[1] === null) return;

        async function loadData() {
            setLoading(true);
            try {
                let start = undefined;
                let end = undefined;
                if (monthRange[0]) start = dayjs(monthRange[0]).format('YYYY-MM');
                if (monthRange[1]) end = dayjs(monthRange[1]).format('YYYY-MM');

                const [funnelRes, campRes] = await Promise.all([
                    fetchFunnel(start, end, selectedCampaigns),
                    fetchCampaigns(start, end) // fetch all without campaign filter just for dropdown
                ]);

                setFunnelData(funnelRes);

                if (allCampaignsList.length === 0 && campRes.length > 0) {
                    setAllCampaignsList(campRes.map((c: any) => c.campaign));
                }
            } catch (e) {
                console.error("Error loading funnel data:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [monthRange, selectedCampaigns]);

    if (loading && !funnelData) {
        return (
            <Container size="xl" py="xl">
                <Skeleton height={50} mb="xl" />
                <Skeleton height={400} />
            </Container>
        );
    }

    const formatFunnelData = (dataObj: any) => {
        if (!dataObj) return [];
        return STAGE_KEYS.map((key, index) => ({
            name: STAGE_LABELS[index],
            value: dataObj[key] || 0,
            fill: STAGE_COLORS[index]
        }));
    };

    const aggData = formatFunnelData(funnelData?.aggregated);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={1}>Funnel 분석</Title>
                <Group>
                    <MultiSelect
                        placeholder="All Campaigns"
                        data={allCampaignsList}
                        value={selectedCampaigns}
                        onChange={setSelectedCampaigns}
                        clearable
                        searchable
                        w={250}
                    />
                    <MonthPickerInput
                        type="range"
                        placeholder="Select month range"
                        value={monthRange}
                        onChange={(val: any) => setMonthRange(val)}
                        clearable
                        w={280}
                    />
                </Group>
            </Group>

            {/* Aggregated Funnel */}
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
                <Text size="lg" fw={600} mb="md">전체 매체 통합 Funnel</Text>
                <Box>
                    <HorizontalFunnel data={aggData} />
                </Box>
            </Card>

            <Title order={3} mb="md">매체별 Funnel 비교</Title>

            <Grid>
                {funnelData?.by_media.map((mediaObj: any) => {
                    const mediaData = formatFunnelData(mediaObj);
                    return (
                        <Grid.Col span={12} key={mediaObj.media}>
                            <Card shadow="sm" padding="md" radius="md" withBorder>
                                <Text fw={600} size="md" mb="sm">{mediaObj.media}</Text>
                                <Box>
                                    <HorizontalFunnel data={mediaData} />
                                </Box>
                            </Card>
                        </Grid.Col>
                    );
                })}
            </Grid>

        </Container>
    );
}
