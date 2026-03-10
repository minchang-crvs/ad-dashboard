import pandas as pd
from datetime import datetime

# Create a sample excel file for testing upload
data = [
    {"Amount Spent": 15000.5, "Impressions": 300000, "Clicks": 2500, "Landing Page Views": 1000, "pledge_start": 200, "pledge_complete": 50, "revenue": 100000.0, "campaign": "Campaign A", "date": datetime(2026, 3, 1)}
]
df = pd.DataFrame(data)
df.to_excel("meta_test_upload.xlsx", index=False)
print("Created meta_test_upload.xlsx")
