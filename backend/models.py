from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AdPerformanceRecord(BaseModel):
    date: str  # YYYY-MM-DD format
    campaign: str
    media: str
    spend: float
    impressions: int
    clicks: int
    landing_visits: int
    pledge_start: int
    pledge_complete: int
    revenue: float

class DashboardOverviewResponse(BaseModel):
    total_spend: float
    total_revenue: float
    overall_roas: float
    total_pledge_count: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
