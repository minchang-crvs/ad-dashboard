import sys
import os
import pandas as pd

# Ensure backend module can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_google_sheet
from mock_data import MOCK_DF

def seed():
    sheet = get_google_sheet()
    if not sheet:
        print("Error: Could not connect to Google Sheet.")
        return
        
    print("Connected to Google Sheet. Clearing existing data...")
    sheet.clear()
    
    print("Preparing mock data for upload...")
    # Convert all to strings/python native types to avoid JSON serialization errors with gspread
    df = MOCK_DF.copy()
    df = df.astype(str)
    
    headers = df.columns.tolist()
    rows = df.values.tolist()
    
    print(f"Uploading {len(rows)} rows to Google Sheet...")
    sheet.update([headers] + rows)
    print("Successfully seeded Google Sheet!")

if __name__ == "__main__":
    seed()
