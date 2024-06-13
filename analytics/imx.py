import requests
import json

# URL of the Immutable X API endpoint for fetching orders
API_URL = "https://api.sandbox.x.immutable.com/v3/orders"

def fetch_all_active_orders():
    all_orders = []
    params = {
        "status": "active",  # Only fetch orders that are currently active
        "page_size": 200  # Request the maximum number of items per page
    }
    
    while True:
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
    # Save the orders to a file
    save_to_file(all_active_orders, 'data/imx/active_orders.json')
    print(f"Saved {len(all_active_orders)} active orders to 'active_orders.json'")

if __name__ == "__main__":
    main()
