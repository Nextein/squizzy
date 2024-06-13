import os
import re
import json
from bs4 import BeautifulSoup
from illuvials import illuvials
from pprint import pprint

def extract_illuvial_stats(html_file_path):
    with open(html_file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')
    
    stats_section = soup.find('div', class_='stats_section')
    stats = {}

    if stats_section:
        for stat in stats_section.find_all('div', class_='stats_val'):
            stat_name = stat.find('span').text.strip()
            stat_value = re.search(r'\d+/\d+', stat.text)
            if stat_value:
                stat_value = stat_value.group()
            stats[stat_name] = stat_value

    # Extract Tier
    tier_section = soup.find('div', class_='illuvial_info_tier')
    if tier_section:
        tier = tier_section.text.strip().split()[-1]  # Assuming format "Tier 5"
        stats['Tier'] = tier

    # Extract Stage
    stage_section = soup.find('div', class_='illuvial_info_stage')
    if stage_section:
        stage_image = stage_section.find('img')['src']
        stage = re.search(r'stage(\d)\.png', stage_image)
        if stage:
            stats['Stage'] = stage.group(1)

    # Extract Affinities
    affinity_section = soup.find('div', class_='affinity_banner')
    if affinity_section:
        affinities = affinity_section.get_text(strip=True)
        stats['Affinities'] = affinities

    # Extract Classes
    class_section = soup.find('div', class_='class_banner')
    if class_section:
        classes = class_section.get_text(strip=True)
        stats['Classes'] = classes


    return stats

def save_stats_as_json(stats, output_folder, illuvial_name):
    os.makedirs(output_folder, exist_ok=True)
    with open(f'{output_folder}/{illuvial_name}.json', 'w', encoding='utf-8') as json_file:
        json.dump(stats, json_file, indent=4)

    print(f"Stats for {illuvial_name} have been saved to {output_folder}/{illuvial_name}.json")

    
    


for ilv in illuvials:
    html_path = f'./data/illuvials/{ilv}.html'
    output_path = './stats'
    illuvial_name = ilv

    stats = extract_illuvial_stats(html_path)
    save_stats_as_json(stats, output_path, illuvial_name)


import os
import json

def read_and_refactor_json_files(directory):
    # List to store all the refactored stats
    aggregated_data = []

    # Iterate over each file in the specified directory
    for filename in os.listdir(directory):
        # Check if the current file is a JSON file
        if filename.endswith(".json"):
            # Construct the full path to the file
            file_path = os.path.join(directory, filename)
            
            # Open and read the JSON file
            with open(file_path, 'r') as file:
                try:
                    data = json.load(file)
                    # Add the 'name' key with the filename without the '.json' extension
                    data['name'] = filename[:-5]
                    # Append the modified data to the list
                    aggregated_data.append(data)
                except json.JSONDecodeError:
                    print(f"Error decoding JSON from the file {filename}")

    return aggregated_data

# Specify the directory containing the JSON files
directory_path = './stats'
# Call the function and store the result
all_stats = read_and_refactor_json_files(directory_path)

# Optionally, print the result to verify
pprint(all_stats)

import os
import json

def read_and_refactor_json_files(directory):
    # List to store all the refactored stats
    aggregated_data = []

    # Iterate over each file in the specified directory
    for filename in os.listdir(directory):
        # Check if the current file is a JSON file
        if filename.endswith(".json"):
            # Construct the full path to the file
            file_path = os.path.join(directory, filename)
            
            # Open and read the JSON file
            with open(file_path, 'r') as file:
                try:
                    data = json.load(file)
                    # Add the 'name' key with the filename without the '.json' extension
                    data['name'] = filename[:-5]
                    # Append the modified data to the list
                    aggregated_data.append(data)
                except json.JSONDecodeError:
                    print(f"Error decoding JSON from the file {filename}")

    return aggregated_data

def save_aggregated_data_to_json(data, output_file):
    # Write the data to a JSON file
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)

# Specify the directory containing the JSON files
directory_path = './stats'
# Call the function and store the result
all_stats = read_and_refactor_json_files(directory_path)

# Specify the path for the output JSON file
output_path = './data/illuvials_aggregated_stats.json'
# Save the aggregated data to a JSON file
save_aggregated_data_to_json(all_stats, output_path)

print(f"Aggregated data has been saved to {output_path}")
