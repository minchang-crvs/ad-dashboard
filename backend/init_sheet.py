import os
from dotenv import load_dotenv
import gspread
from mock_data import MOCK_DF

load_dotenv()

def init_google_sheet():
    credentials_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "google_credentials.json")
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    
    if not sheet_id:
        print("Error: GOOGLE_SHEET_ID not found in .env")
        return
        
    try:
        gc = gspread.service_account(filename=credentials_file)
        sh = gc.open_by_key(sheet_id)
        worksheet = sh.get_worksheet(0)
    except Exception as e:
        print(f"Error connecting to Google Sheets: {e}")
        return
        
    print(f"Connected to sheet. Clearing existing data...")
    worksheet.clear()
    
    # 1. Prepare Columns (First Row)
    columns = list(MOCK_DF.columns)
    
    # 2. Prepare Data Rows (Convert NaN to None and dates to strings)
    import numpy as np
    df = MOCK_DF.replace({np.nan: None})
    if 'date' in df.columns:
        df['date'] = df['date'].astype(str)
        
    rows = df.values.tolist()
    
    # Combine headers + data
    data_to_insert = [columns] + rows
    
    print(f"Inserting {len(data_to_insert)} rows (including header)...")
    
    try:
        # We can update the entire range at once for efficiency
        worksheet.update(data_to_insert)
        print("Successfully initialized Google Sheet with Mock Data!")
    except Exception as e:
        print(f"Error inserting data: {e}")

if __name__ == "__main__":
    init_google_sheet()
