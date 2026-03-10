import os
import gspread
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "google_credentials.json")
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")

def get_google_sheet():
    """Authenticates and returns the Google Sheet object."""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"Warning: Credentials file {CREDENTIALS_FILE} not found. Operating in MOCK mode.")
        return None
    try:
        client = gspread.service_account(filename=CREDENTIALS_FILE)
        sheet = client.open_by_key(SHEET_ID).sheet1
        return sheet
    except Exception as e:
        print(f"Error connecting to Google Sheets: {e}")
        return None
