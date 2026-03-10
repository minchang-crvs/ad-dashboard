export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function buildParams(startMonth?: string, endMonth?: string, campaigns?: string[]) {
    const params = new URLSearchParams();
    if (startMonth) params.append('start_month', startMonth);
    if (endMonth) params.append('end_month', endMonth);
    if (campaigns && campaigns.length > 0) params.append('campaigns', campaigns.join(","));
    const query = params.toString();
    return query ? `?${query}` : "";
}

export async function fetchOverview(startMonth?: string, endMonth?: string, campaigns?: string[]) {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview${buildParams(startMonth, endMonth, campaigns)}`);
    if (!res.ok) throw new Error("Failed to fetch overview metrics");
    return res.json();
}

export async function fetchTrend(startMonth?: string, endMonth?: string, campaigns?: string[]) {
    const res = await fetch(`${API_BASE_URL}/dashboard/trend${buildParams(startMonth, endMonth, campaigns)}`);
    if (!res.ok) throw new Error("Failed to fetch trend data");
    return res.json();
}

export async function fetchCampaigns(startMonth?: string, endMonth?: string, campaigns?: string[]) {
    const res = await fetch(`${API_BASE_URL}/dashboard/campaigns${buildParams(startMonth, endMonth, campaigns)}`);
    if (!res.ok) throw new Error("Failed to fetch campaigns data");
    return res.json();
}

export async function fetchFunnel(startMonth?: string, endMonth?: string, campaigns?: string[]) {
    const res = await fetch(`${API_BASE_URL}/funnel${buildParams(startMonth, endMonth, campaigns)}`);
    if (!res.ok) throw new Error("Failed to fetch funnel data");
    return res.json();
}
