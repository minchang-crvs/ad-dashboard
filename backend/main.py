from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import math
import gspread

from mock_data import MOCK_DF
from database import get_google_sheet

app = FastAPI(title="ROAS Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ROAS Dashboard MVP API"}

@app.post("/api/upload")
async def upload_excel(file: UploadFile = File(...), media: str = "Meta"):
    """Accepts an Excel or CSV file, standardized with pandas, and appends to Google Sheet."""
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx or .csv files are supported.")
    
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Very basic column mapping strategy for MVP
        # In a real app we would have strict dictionaries.
        
        # Rename columns to lowercase and map known variants to our standard names
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        rename_map = {
            'amount spent': 'spend',
            'cost': 'spend',
            'landing page views': 'landing_visits',
            'landing page visits': 'landing_visits'
        }
        df.rename(columns=rename_map, inplace=True)
        
        # Ensure our target columns exist (fill missing with 0 or defaults)
        target_cols = ['date', 'campaign', 'media', 'spend', 'impressions', 'clicks', 'landing_visits', 'landing_scroll', 'pledge_start', 'pledge_complete', 'revenue']
        
        # Create missing columns
        for col in target_cols:
            if col not in df.columns:
                if col == 'media':
                    df[col] = media
                elif col in ['spend', 'impressions', 'clicks', 'landing_visits', 'landing_scroll', 'pledge_start', 'pledge_complete', 'revenue']:
                    df[col] = 0
                else:
                    df[col] = 'Unknown'
                    
        # Select only the target columns
        df = df[target_cols]
        
        # Write to Google Sheets
        sheet = get_google_sheet()
        if sheet:
            # We append the rows. Data must be standard scalar Python types.
            import numpy as np
            df = df.replace({np.nan: None})
            
            # Convert any datetime objects to strings
            if 'date' in df.columns:
                df['date'] = df['date'].astype(str)
                
            rows_to_insert = df.values.tolist()
            sheet.append_rows(rows_to_insert)
            return {"message": f"Successfully processed and appended {len(df)} rows to Google Sheets", "rows": len(df)}
        else:
            return {"message": "Google sheet not connected. Parsed successfully but fell back to mock mode (data not saved).", "rows": len(df)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def sanitize_nan(val):
    if isinstance(val, (float, int)) and math.isnan(val):
        return 0
    return val

def get_base_dataframe() -> pd.DataFrame:
    """Fetch from Google Sheets or fallback to mock data."""
    try:
        sheet = get_google_sheet()
        if sheet:
            records = sheet.get_all_records()
            if records:
                df = pd.DataFrame(records)
                # Ensure correct types
                numeric_cols = ['spend', 'impressions', 'clicks', 'landing_visits', 'landing_scroll', 'pledge_start', 'pledge_complete', 'revenue']
                for col in numeric_cols:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                return df
    except Exception as e:
        print(f"Error fetching real data: {e}. Falling back to mock data.")
    return MOCK_DF.copy()

def get_filtered_dataframe(start_month: str = None, end_month: str = None, campaigns: str = None) -> pd.DataFrame:
    """Fetch base dataframe and apply optional month filtering (format YYYY-MM) and campaign filtering."""
    df = get_base_dataframe()
    if df.empty:
        return df
        
    df['date_dt'] = pd.to_datetime(df['date'])
    
    if start_month:
        start_dt = pd.to_datetime(start_month + "-01")
        df = df[df['date_dt'] >= start_dt]
    
    if end_month:
        # Add a month offset and subtract a day to get the end of the month
        end_dt = pd.to_datetime(end_month + "-01") + pd.DateOffset(months=1) - pd.Timedelta(days=1)
        df = df[df['date_dt'] <= end_dt]
        
    if campaigns:
        # Expect campaigns as comma-separated string
        campaign_list = [c.strip() for c in campaigns.split(",")]
        df = df[df['campaign'].isin(campaign_list)]
        
    return df

@app.get("/api/dashboard/overview")
def get_dashboard_overview(start_month: str = None, end_month: str = None, campaigns: str = None):
    """Returns aggregated KPIs."""
    df = get_filtered_dataframe(start_month, end_month, campaigns)
    total_spend = sanitize_nan(df['spend'].sum())
    total_revenue = sanitize_nan(df['revenue'].sum())
    overall_roas = total_revenue / total_spend if total_spend > 0 else 0
    total_pledge_count = sanitize_nan(df['pledge_complete'].sum())
    
    return {
        "total_spend": float(total_spend),
        "total_revenue": float(total_revenue),
        "overall_roas": float(round(overall_roas, 2)),
        "total_pledge_count": int(total_pledge_count)
    }

@app.get("/api/dashboard/trend")
def get_dashboard_trend(start_month: str = None, end_month: str = None, campaigns: str = None):
    """Returns monthly grouped data for ROAS trend, pivoted by campaign."""
    df = get_filtered_dataframe(start_month, end_month, campaigns)
    if df.empty:
        return []
        
    df['month'] = df['date_dt'].dt.to_period('M').astype(str)
    
    grouped = df.groupby(['month', 'campaign']).agg({'spend': 'sum', 'revenue': 'sum'}).reset_index()
    grouped['roas'] = (grouped['revenue'] / grouped['spend']).fillna(0).round(2)
    
    pivot = grouped.pivot(index='month', columns='campaign', values='roas').reset_index()
    pivot = pivot.fillna(0)
    
    return pivot.to_dict(orient='records')

@app.get("/api/dashboard/campaigns")
def get_campaigns_comparison(start_month: str = None, end_month: str = None, campaigns: str = None):
    """Returns grouped aggregate data per campaign per media for comparison."""
    df = get_filtered_dataframe(start_month, end_month, campaigns)
    if df.empty:
        return []
    
    # Calculate overall campaign performance
    camp_overall = df.groupby('campaign').agg({'spend': 'sum', 'revenue': 'sum'}).reset_index()
    camp_overall['avg_roas'] = (camp_overall['revenue'] / camp_overall['spend']).fillna(0).round(2)
    
    # Calculate media specific ROAS per campaign
    media_perf = df.groupby(['campaign', 'media']).agg({'spend': 'sum', 'revenue': 'sum'}).reset_index()
    media_perf['roas'] = (media_perf['revenue'] / media_perf['spend']).fillna(0).round(2)
    
    results = []
    for _, camp_row in camp_overall.iterrows():
        camp = camp_row['campaign']
        media_data = media_perf[media_perf['campaign'] == camp]
        media_roas_dict = dict(zip(media_data['media'], media_data['roas']))
        media_details = media_data[['media', 'spend', 'revenue', 'roas']].to_dict(orient='records')
        
        results.append({
            "campaign": camp,
            "avg_roas": camp_row['avg_roas'],
            "metrics": media_roas_dict,
            "details": media_details
        })
        
    return results

@app.get("/api/funnel")
def get_funnel_analysis(start_month: str = None, end_month: str = None, campaigns: str = None):
    """Returns aggregated and media-specific 5-stage funnel data."""
    df = get_filtered_dataframe(start_month, end_month, campaigns)
    
    stages = ['clicks', 'landing_visits', 'landing_scroll', 'pledge_start', 'pledge_complete']
    
    if df.empty:
        empty_stages = {s: 0 for s in stages}
        return {
            "aggregated": empty_stages,
            "by_media": []
        }
        
    # 1. Aggregated Funnel
    agg_funnel = {s: int(sanitize_nan(df[s].sum())) for s in stages}
    
    # 2. By Media Funnel
    media_perf = df.groupby('media').agg({s: 'sum' for s in stages}).reset_index()
    by_media = []
    for _, row in media_perf.iterrows():
        media_data = {"media": row['media']}
        for s in stages:
            media_data[s] = int(sanitize_nan(row[s]))
        by_media.append(media_data)
        
    return {
        "aggregated": agg_funnel,
        "by_media": by_media
    }

