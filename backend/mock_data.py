import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_mock_dataframe() -> pd.DataFrame:
    """Generate mock Ad Performance dataframe to mimic Google Sheets raw data."""
    start_date = datetime(2025, 9, 1)
    dates = [start_date + timedelta(days=x) for x in range(181)] # Sep 2025 to Feb 2026
    campaigns = ['캠페인 A', '캠페인 A', '캠페인 A', '캠페인 B', '캠페인 B']
    media_platforms = ['Meta', 'Google', 'Naver', 'Kakao', 'Toss']
    
    data = []
    for x, d in enumerate(dates):
        day_progression = x / len(dates) # 0.0 to 1.0 representing time passage
        for c in ['캠페인 A', '캠페인 B', '캠페인 C']:
            for m in media_platforms:
                # Scale spend up to average ~225k per row so total spend hits > 500 million KRW
                spend = np.random.uniform(150000, 300000)
                
                # Campaign Base ROAS Logic
                if c == '캠페인 A':
                    # Starts high (~7.0) and decreases
                    base_roas = np.random.uniform(6.5, 7.5) - (day_progression * 4.5)
                    
                    # Media Distinction
                    if m in ['Meta', 'Google']:
                        roas_mult = base_roas * np.random.uniform(1.1, 1.4)
                    elif m in ['Kakao', 'Toss']:
                        roas_mult = base_roas * np.random.uniform(0.4, 0.7)
                    else:
                        roas_mult = base_roas

                elif c == '캠페인 B':
                    if d.year == 2025 and d.month == 11:
                        # 2025-11 종합 ROAS가 6%대
                        base_roas = np.random.uniform(6.0, 6.9)
                    elif d.year == 2025 and d.month == 12:
                        # 2025-12 종합 ROAS 2% 미만
                        base_roas = np.random.uniform(0.5, 1.9)
                    else:
                        # High volatility
                        base_roas = np.random.uniform(2.0, 8.0)
                    
                    # Media Distinction
                    if m == 'Naver':
                        roas_mult = base_roas * np.random.uniform(1.3, 1.6)
                    elif m == 'Meta':
                        roas_mult = base_roas * np.random.uniform(0.3, 0.6)
                    else:
                        roas_mult = base_roas

                else: # 캠페인 C
                    # Steady 2.0 to 3.0
                    base_roas = np.random.uniform(2.0, 3.0)
                    
                    # Media Distinction
                    if m == 'Kakao':
                        roas_mult = base_roas * np.random.uniform(1.2, 1.5)
                    elif m in ['Google', 'Toss']:
                        roas_mult = base_roas * np.random.uniform(0.6, 0.8)
                    else:
                        roas_mult = base_roas
                        
                revenue = spend * roas_mult
                impressions = int(spend / np.random.uniform(10, 20)) # Higher CPC/CPM
                clicks = int(impressions * np.random.uniform(0.01, 0.03)) # Lower CTR
                landing_visits = int(clicks * np.random.uniform(0.1, 0.3)) # Lower visit rate
                landing_scroll = int(landing_visits * np.random.uniform(0.3, 0.5))
                pledge_start = int(landing_scroll * np.random.uniform(0.3, 0.6))
                pledge_complete = int(pledge_start * np.random.uniform(0.6, 0.9))
                
                data.append({
                    'date': d.strftime('%Y-%m-%d'),
                    'campaign': c,
                    'media': m,
                    'spend': round(spend),
                    'impressions': impressions,
                    'clicks': clicks,
                    'landing_visits': landing_visits,
                    'landing_scroll': landing_scroll,
                    'pledge_start': pledge_start,
                    'pledge_complete': pledge_complete,
                    'revenue': round(revenue)
                })
    return pd.DataFrame(data)

# Load mock data once
MOCK_DF = get_mock_dataframe()
