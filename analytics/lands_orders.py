import requests
import json
import time
import functools
import pandas as pd
import csv

def separator():
    print('-'*20 + '*'*7 + '-'*20)

def timed(func):
    """Print the runtime of the decorated function"""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        tic = time.perf_counter()
        value = func(*args, **kwargs)
        toc = time.perf_counter()
        run_time = toc - tic
        print(f"Finished {func.__name__!r} in {run_time:.4f} secs")
        return value
    return wrapper_timer

API_URL = "https://api.x.immutable.com/v3/orders"
csv_file_path = './data/imx/lands_orders.csv'

def fetch_orders(user, writer):
    params = {
        "status": "active",
        "user": user,
        "page_size": 200,
    }

    while True:
        print(f"{time.time()} Fetching next batch for user {user}...")
        response = requests.get(API_URL, params=params)
        if response.status_code != 200:
            print("Failed to fetch data: HTTP Status Code", response.status_code)
            break

        data = response.json()
        active_orders = [order for order in data["result"] if order.get("amount_sold") is None]

        for order in active_orders:
            writer.writerow([
                order.get('order_id'),
                order.get('status'),
                order.get('user'),
                order.get('sell'),
                order.get('buy'),
                order.get('created_at'),
                order.get('updated_at'),
                json.dumps(order.get('metadata'))
            ])

        cursor = data.get("cursor")
        if cursor:
            params["cursor"] = cursor
        else:
            break

@timed
def main():
    filepath = "./data/imx/lands.csv"
    lands_df = pd.read_csv(filepath)
    lands_df.sort_values(by='name', inplace=True)
    users = lands_df['user'].unique()
    n_users = users.shape[0]

    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Order ID', 'Status', 'User', 'Sell', 'Buy', 'Created At', 'Updated At', 'Metadata'])

        for i, user in enumerate(users):
            print(f"{i}/{n_users}", end='-')
            fetch_orders(user, writer)

    print(f"Data has been written to '{csv_file_path}'")

if __name__ == "__main__":
    main()
