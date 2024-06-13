import requests
import json
from pprint import pprint
def fetch_nfts(address):
    # Immutable X API endpoint to get NFTs by owner address
    url = f"https://api.x.immutable.com/v1/balances/{address}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        nfts = response.json()
        print(nfts)
        
        if 'result' in nfts:
            for nft in nfts['result']:
                print(f"Token ID: {nft['token_id']}, Contract Address: {nft['token_address']}, Balance: {nft['balance']}")
        else:
            print("No NFTs found or invalid response structure.")
    
    except requests.RequestException as e:
        print(f"An error occurred: {e}")




def fetch_all_balances(address):
    all_balances = []
    
    params = {}
    API_URL = f"https://api.x.immutable.com/v1/balances/{address}"

    
    while True:
        response = requests.get(API_URL, params=params)
        if response.status_code != 200:
            print("Failed to fetch data: HTTP Status Code", response.status_code)
            print(response.text)
            break

        data = response.json()
        print('-'*80)
        print(response.json())
        print(data)
        print('-'*80)
        # Filter to ensure orders are not filled (amount_sold is None)
        active_orders = [order for order in data["result"]]
        all_balances.extend(active_orders)
        
        # Check if a cursor is provided to fetch the next page
        cursor = data.get("cursor")
        if cursor:
            params["cursor"] = cursor
        else:
            break

    return all_balances

def save_to_file(data, filename):
    # Save the collected data to a JSON file
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)




# Example usage
ethereum_address = '0xdfe9445af00412ded1439fefa8ec76577c9d41bf'
# fetch_nfts(ethereum_address)
# fetch_all_balances(ethereum_address)

def fetch_nfts():
    url = "https://api.x.immutable.com/v2/balances/0xDfe9445af00412DEd1439FeFA8ec76577c9D41Bf"
    response = requests.get(url)
    nfts = response.json()['result']
    pprint(nfts)
    return nfts

fetch_nfts()

