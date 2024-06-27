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
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return None

def extract_relevant_data(item):
    coordinates = item["metadata"].get("coordinate", "").split(',')
    x, y = coordinates if len(coordinates) == 2 else (None, None)
    return {
        "token_id": item.get("token_id"),
        "name": item.get("name"),
        "image_url": item.get("image_url"),
        "user": item.get("user"),
        "region": item["metadata"].get("region"),
        "x_coordinate": x,
        "y_coordinate": y,
        "landmark": item['metadata'].get("landmark"),
        "tier": item['metadata'].get("tier"),
        "fuels": item['metadata'].get("fuels"),
        "solon": item['metadata'].get("solon"),
        "carbon": item['metadata'].get("carbon"),
        "crypton": item['metadata'].get("crypton"),
        "silicon": item['metadata'].get("silicon"),
        "elements": item['metadata'].get("elements"),
        "hydrogen": item['metadata'].get("hydrogen"),
        "hyperion": item['metadata'].get("hyperion"),
    }

def create_csv(filepath):
    cursor = None
    
    with open(filepath, 'w', newline='') as file:
        fieldnames = ['token_id', 'name', 'image_url', 'user', 'region', 'x_coordinate', 'y_coordinate', 'landmark', 'tier', 'fuels', 'solon', 'carbon', 'crypton', 'silicon', 'elements', 'hydrogen', 'hyperion']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
    
        for _ in range(100):
            data = fetch_data(cursor)
            if not data:
                break
            
            items = data.get("result", [])
            for item in items:
                extracted_data = extract_relevant_data(item)
                writer.writerow(extracted_data)
            
            cursor = data.get("cursor")
            if not cursor:
                break
            
            time.sleep(0.2)  # To avoid hitting rate limits
    

if __name__ == "__main__":
    create_csv("./data/imx/lands.csv")
