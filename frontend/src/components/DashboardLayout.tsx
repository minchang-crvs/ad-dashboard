"use client";

import { AppShell, Burger, Group, NavLink, Title, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartLine, IconFilter, IconBook, IconUpload } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
    { label: '캠페인 ROAS', icon: <IconChartLine size="1rem" stroke={1.5} />, path: '/' },
    { label: 'Funnel 분석', icon: <IconFilter size="1rem" stroke={1.5} />, path: '/funnel' },
    { label: '용어 사전', icon: <IconBook size="1rem" stroke={1.5} />, path: '/dictionary' },
    { label: '데이터 업로드', icon: <IconUpload size="1rem" stroke={1.5} />, path: '/admin/upload' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Title order={3}>Inspire/d Ad Dashboard</Title>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Text fw={500} size="sm" c="dimmed" mb="sm">Menu</Text>
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        label={item.label}
                        leftSection={item.icon}
                        active={pathname === item.path}
                        onClick={() => {
                            router.push(item.path);
                            if (opened) toggle(); // close on mobile after navigation
                        }}
                        variant="light"
                        mb={4}
                        style={{ borderRadius: 8 }}
                    />
                ))}
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
