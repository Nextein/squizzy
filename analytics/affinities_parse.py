import os
import re
from bs4 import BeautifulSoup
import json

# Ensure the stats directory exists
os.makedirs('./stats/', exist_ok=True)

# Path to the HTML file
html_file_path = './data/affinities.html'
json_file_path = './stats/affinities.json'

# Read the HTML file
with open(html_file_path, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Dictionary to hold affinity stats
affinities = {}

# Regular expression patterns to clean and extract numeric data
pattern_details = re.compile(r"(\d+%?)\s*([a-zA-Z ]+)(?:,|\.)?")

# Function to clean and structure description text
def extract_data(description):
    results = []
    # Remove excessive newlines and spaces
    cleaned_description = ' '.join(description.split())
    # Remove filler words like 'and'
    cleaned_description = re.sub(r"\band\b", "", cleaned_description)
    # Use regex to find all matches
    matches = pattern_details.findall(cleaned_description)
    temp_data = []
    for match in matches:
        value, desc = match
        desc = desc.strip()
        if value.endswith('%'):
            current_data = {"percentage": value, "text": desc}
        else:
            current_data = {"value": value, "text": desc}
        temp_data.append(current_data)

    # Combine related data
    for i in range(len(temp_data)):
        if i < len(temp_data) - 1 and temp_data[i+1]['text'].startswith('for '):
            temp_data[i]['specific'] = temp_data[i+1]
            results.append(temp_data[i])
            i += 1  # Skip the next item as it's already included
        elif not temp_data[i]['text'].startswith('for '):
            results.append(temp_data[i])
    
    return results

# Find all affinity boxes
for box in soup.find_all('div', class_='box'):
    h2 = box.find('h2')
    if h2:  # Check if h2 element exists
        affinity_name = h2.text.strip()
        min_monsters_required = []
        
        # Iterate over rank containers within each box
        for rank in box.find_all('div', class_='rank_container'):
            num = rank.find('div', class_='num')
            desc = rank.find('div', class_='description')
            if num and desc:  # Check if both elements exist
                num_required = int(num.text.strip())
                description = desc.text.strip()
                details = extract_data(description)
                min_monsters_required.append({"min_monsters_required": num_required, "details": details})
        
        affinities[affinity_name] = min_monsters_required

# Write the dictionary to a JSON file
with open(json_file_path, 'w', encoding='utf-8') as json_file:
    json.dump(affinities, json_file, indent=4)

print(f'Affinity data successfully written to {json_file_path}.')
