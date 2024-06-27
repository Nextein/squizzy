import requests
import json
import time
import lands
import functools

import pandas as pd

def separator():
    print('-'*20 + '*'*7 + '-'*20)
    
def timed(func):
    """Print the runtime of the decorated function"""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        tic = time.perf_counter()    # 1
        value = func(*args, **kwargs)
        toc = time.perf_counter()      # 2
        run_time = toc - tic    # 3
        print(f"Finished {func.__name__!r} in {run_time:.4f} secs")
        return value
    return wrapper_timer


# URL of the Immutable X API endpoint for fetching orders
API_URL = "https://api.x.immutable.com/v3/orders"

def fetch_orders(user):
    all_orders = []
    params = {
        "status": "active",  # Only fetch orders that are currently active
        "user": user,  # Land owner address
        "page_size": 200,  # Request the maximum number of items per page
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

@timed
def main():
    # Fetch land owners
    filepath = "./data/imx/lands.csv"
    # lands.create_csv(filepath)

    lands = pd.read_csv(filepath)
    lands.sort_values(by='name', inplace=True)
    users = lands['user'].unique()

    all_orders = []
    i = 0
    for user in users:
        separator()
        print(i)
        i+=1
        orders = fetch_orders(user)
        print(orders)
        all_orders.extend(orders)
        
    separator()
    separator()
    separator()

    # Save the orders to a file
    save_to_file(all_orders, 'data/imx/lands_orders.json')
    print(f"Saved {len(all_orders)} active orders to 'lands_orders.json'")

if __name__ == "__main__":
    main()
