import requests
import time
import json
import csv
from pprint import pprint

def fetch_data(cursor=None):
    base_url = "https://api.x.immutable.com/v1/assets"
    params = {
        "page_size": 200,
        "order_by": "updated_at", 
        "collection": "0x9e0d99b864e1ac12565125c5a82b59adea5a09cd",
        "cursor": cursor
    }
    response = requests.get(base_url, params=params)

    # pprint(response.json())
    # exit()
    
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return None

def extract_relevant_data(item):
    # Extract and return relevant details from the item
    return {
        "token_id": item.get("token_id"),
        "name": item.get("name"),
        "image_url": item.get("image_url"),
        "user": item.get("user"),
        "region": item["metadata"].get("region"),
        "coordinates": item["metadata"].get("coordinate"),
        "landmark": item['metadata'].get("landmark"),
    }

def main():
    cursor = None
    
    with open("./data/imx/lands.csv", 'w', newline='') as file:
        fieldnames = ['token_id', 'name', 'image_url', 'user', 'region', 'coordinates', 'landmark']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
    
        for _ in range(100):
            data = fetch_data(cursor)
            if not data:
                break
            
            items = data.get("result", [])
            for item in items:
                extracted_data = extract_relevant_data(item)
                writer.writerow(extracted_data)  # Write to CSV file
            
            cursor = data.get("cursor")
            if not cursor:
                break
            
            time.sleep(0.2)  # To avoid hitting rate limits
    

if __name__ == "__main__":
    main()
