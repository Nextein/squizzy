import requests
import json
import time

# URL of the Immutable X API endpoint for fetching orders
API_URL = "https://api.sandbox.x.immutable.com/v3/orders"

def fetch_all_active_orders():
    all_orders = []
    params = {
        "status": "active",  # Only fetch orders that are currently active. Set to "filled" to fetch past orders.
        "page_size": 200  # Request the maximum number of items per page
    }
    
    while True:
        print(f"{time.time()} Fetching next batch...")
        response = requests.get(API_URL, params=params)
        if response.status_code != 200:
            print("Failed to fetch data: HTTP Status Code", response.status_code)
            break

        data = response.json()
        # Filter to ensure orders are not filled (amount_sold is None)
        active_orders = [order for order in data["result"] if order.get("amount_sold") is None]
        all_orders.extend(active_orders)
        
        # Check if a cursor is provided to fetch the next page
        cursor = data.get("cursor")
        if cursor:
            params["cursor"] = cursor
        else:
            break

    return all_orders

def save_to_file(data, filename):
    # Save the collected data to a JSON file
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

def main():
    # Fetch all active, non-filled orders across all pages
    all_active_orders = fetch_all_active_orders()
    # Create a set to store unique collection names
    unique_collections = set()

    # Iterate through each order to extract the collection name
    for order in all_active_orders:
        collection_name = order['sell']['data']['properties']['collection']['name']
        unique_collections.add(collection_name)

    # Print all unique collection names
    print("Unique collection names:")
    print(unique_collections)
    # Save the orders to a file
    save_to_file(all_active_orders, 'data/imx/active_orders.json')
    print(f"Saved {len(all_active_orders)} active orders to 'active_orders.json'")

if __name__ == "__main__":
    main()
