"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Title, Skeleton, Box, Table, Card, Text, Group, MultiSelect } from "@mantine/core";
import { MonthPickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis, LabelList, Label } from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { fetchOverview, fetchTrend, fetchCampaigns } from "@/services/api";

export default function Home() {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [campaignsData, setCampaignsData] = useState<any[]>([]);

  // Filter states
  const [loading, setLoading] = useState(true);
  const [monthRange, setMonthRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // ScatterChart Legend Toggle
  const [hiddenScatterSeries, setHiddenScatterSeries] = useState<string[]>([]);

  // Meta data states
  const [allCampaignsList, setAllCampaignsList] = useState<string[]>([]);

  useEffect(() => {
    // Prevent fetching if only the start date is selected (user is still picking the end date)
    if (monthRange[0] !== null && monthRange[1] === null) {
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        let start = undefined;
        let end = undefined;
        if (monthRange[0]) start = dayjs(monthRange[0]).format('YYYY-MM');
        if (monthRange[1]) end = dayjs(monthRange[1]).format('YYYY-MM');

        const [overviewData, trendData, campData] = await Promise.all([
          fetchOverview(start, end, selectedCampaigns),
          fetchTrend(start, end, selectedCampaigns),
          fetchCampaigns(start, end, selectedCampaigns)
        ]);

        setOverview(overviewData);
        setTrend(trendData);
        setCampaignsData(campData);

        // Setup initial campaigns list for dropdown if first load
        if (allCampaignsList.length === 0 && campData.length > 0) {
          setAllCampaignsList(campData.map((c: any) => c.campaign));
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [monthRange, selectedCampaigns]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Skeleton height={50} mb="xl" />
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}><Skeleton height={120} /></Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}><Skeleton height={120} /></Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}><Skeleton height={120} /></Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}><Skeleton height={120} /></Grid.Col>
        </Grid>
      </Container>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  const campaignKeys = trend.length > 0 ? Object.keys(trend[0]).filter(k => k !== 'month') : [];
  const lineColors = ["#228be6", "#fab005", "#fa5252", "#40c057", "#be4bdb", "#fd7e14"];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>캠페인 ROAS</Title>
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

      {/* KPI Section */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KpiCard title="총 광고비" value={formatCurrency(overview?.total_spend || 0)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KpiCard title="총 후원액" value={formatCurrency(overview?.total_revenue || 0)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KpiCard title="전체 ROAS" value={`${overview?.overall_roas || 0}x`} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KpiCard title="총 후원수" value={(overview?.total_pledge_count || 0).toLocaleString()} />
        </Grid.Col>
      </Grid>

      {/* Trend Section */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Text size="lg" fw={600} mb="md">월간 ROAS Trend</Text>
        <Box h={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value}x`, 'ROAS']} />
              <Legend />
              {campaignKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={lineColors[i % lineColors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Campaigns Section */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">캠페인별 ROAS</Text>

        <Box h={400} mb="xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={campaignsData.map(c => ({
                name: c.campaign,
                Meta: c.metrics['Meta'] || 0,
                Google: c.metrics['Google'] || 0,
                Naver: c.metrics['Naver'] || 0,
                Kakao: c.metrics['Kakao'] || 0,
                Toss: c.metrics['Toss'] || 0,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value}x`, 'ROAS']} />
              <Legend />
              <Bar dataKey="Meta" fill="#1877F2" name="Meta" />
              <Bar dataKey="Google" fill="#DB4437" name="Google" />
              <Bar dataKey="Naver" fill="#03C75A" name="Naver" />
              <Bar dataKey="Kakao" fill="#FEE500" name="Kakao" />
              <Bar dataKey="Toss" fill="#0050FF" name="Toss" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>캠페인명</Table.Th>
              <Table.Th>Avg ROAS</Table.Th>
              <Table.Th>Meta</Table.Th>
              <Table.Th>Google</Table.Th>
              <Table.Th>Naver</Table.Th>
              <Table.Th>Kakao</Table.Th>
              <Table.Th>Toss</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {campaignsData.map((c) => (
              <Table.Tr key={c.campaign}>
                <Table.Td fw={500}>{c.campaign}</Table.Td>
                <Table.Td>{c.avg_roas}x</Table.Td>
                <Table.Td>{c.metrics['Meta'] || '-'}x</Table.Td>
                <Table.Td>{c.metrics['Google'] || '-'}x</Table.Td>
                <Table.Td>{c.metrics['Naver'] || '-'}x</Table.Td>
                <Table.Td>{c.metrics['Kakao'] || '-'}x</Table.Td>
                <Table.Td>{c.metrics['Toss'] || '-'}x</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Spend vs Revenue Scatter Chart Section */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Text size="lg" fw={600} mb="md">캠페인 매체별 ROAS</Text>
        <Box h={400}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 80, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="revenue"
                name="후원액"
                tickFormatter={(val: number) => `${val.toLocaleString()}원`}
                domain={['auto', 'auto']}
                tick={{ fill: 'var(--mantine-color-dimmed)' }}
              >
                <Label value="후원액" offset={-25} position="insideBottom" fill="var(--mantine-color-dimmed)" />
              </XAxis>
              <YAxis
                type="number"
                dataKey="spend"
                name="광고비"
                tickFormatter={(val: number) => `${val.toLocaleString()}원`}
                domain={['auto', 'auto']}
                tick={{ fill: 'var(--mantine-color-dimmed)' }}
              >
                <Label value="광고비" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} offset={-60} fill="var(--mantine-color-dimmed)" />
              </YAxis>
              <ZAxis dataKey="roas" range={[100, 400]} name="ROAS" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val: any, name: any) => [name === 'ROAS' ? `${val}x` : `${val.toLocaleString()}원`, name]} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => {
                  const isHidden = hiddenScatterSeries.includes(value);
                  return (
                    <span style={{ color: isHidden ? "#adb5bd" : "inherit", textDecoration: isHidden ? "line-through" : "none" }}>
                      {value}
                    </span>
                  );
                }}
                onClick={(e) => {
                  if (!e.value) return;
                  const seriesName = String(e.value);
                  setHiddenScatterSeries(prev =>
                    prev.includes(seriesName)
                      ? prev.filter(name => name !== seriesName)
                      : [...prev, seriesName]
                  );
                }}
              />
              {campaignsData.map((c: any, i: number) => {
                const scatterData = c.details?.map((d: any) => ({
                  name: `${c.campaign} - ${d.media}`,
                  media: d.media,
                  spend: d.spend,
                  revenue: d.revenue,
                  roas: d.roas
                })) || [];

                const isHidden = hiddenScatterSeries.includes(c.campaign);

                return (
                  <Scatter
                    key={c.campaign}
                    name={c.campaign}
                    data={isHidden ? [] : scatterData}
                    fill={lineColors[i % lineColors.length]}
                  >
                    {!isHidden && (
                      <LabelList dataKey="media" position="top" fontSize={11} fill="var(--mantine-color-text)" />
                    )}
                  </Scatter>
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </Card>

    </Container>
  );
}
