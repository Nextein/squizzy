import time
import requests
import csv
import json

def fetch_imx_data_csv():
    user_address = '0xb73e758ecfec06f16a22802b6bed827731e2a078'
    collection_address = '0xa732097446130b699bea80475ca571e73f9a7b17'
    api_base_url = f"https://api.sandbox.x.immutable.com/v1/assets?page_size=200&order_by=updated_at&user={user_address}&collection={collection_address}"
    rate_limit_pause = 0.2  # seconds to pause for rate limiting

    csv_file_path = './data/testnet/output_data.csv'
    cursor = ''
    points_table = {
        # Define your points table here
    }

    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Write headers
        writer.writerow(['Token Address', 'Token ID', 'ID', 'User', 'Status', 'URI', 'Name', 'Image URL', 'Metadata', 'Collection Name', 'Collection Icon URL', 'Created At', 'Updated At', 'Captured By', 'Tier', 'Stage', 'Finish', 'Points'])

        while True:
            time.sleep(rate_limit_pause)
            api_url = f"{api_base_url}&cursor={cursor}"
            response = requests.get(api_url)
            json_data = response.json()
            results = json_data.get('result', [])
            
            print(json_data)
            if not results:
                break
            
            for item in results:
                metadata = item.get('metadata', {})
                tier = metadata.get("Tier", "")
                stage = metadata.get("Stage", "")
                finish = metadata.get("Finish", "")
                tier_stage = f"T{tier}S{stage}"
                
                points = points_table.get(finish, {}).get(tier_stage, 0)
                
                data_row = [
                    item.get('token_address'),
                    item.get('token_id'),
                    item.get('id'),
                    item.get('user'),
                    item.get('status'),
                    item.get('uri'),
                    item.get('name'),
                    item.get('image_url'),
                    json.dumps(metadata),
                    item['collection'].get('name'),
                    item['collection'].get('icon_url'),
                    item.get('created_at'),
                    item.get('updated_at'),
                    metadata.get("Captured By", ""),
                    tier,
                    stage,
                    finish,
                    points
                ]
                writer.writerow(data_row)
            
            cursor = json_data.get('cursor', '')
            if not cursor:
                break

fetch_imx_data_csv()