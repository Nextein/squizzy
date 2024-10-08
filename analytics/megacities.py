import csv
import json
from collections import defaultdict

def read_csv_data(filepath):
    data = []
    with open(filepath, 'r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            row['x_coordinate'] = int(row['x_coordinate'])
            row['y_coordinate'] = int(row['y_coordinate'])
            row['tier'] = int(row['tier'])
            data.append(row)
    return data

def check_for_megacity(user_lands):
    # Group lands by coordinates
    coordinates = defaultdict(list)
    for land in user_lands:
        coord = (land['x_coordinate'], land['y_coordinate'])
        coordinates[coord].append(land)
    
    megacities = []
    # Check every land if it can be the top-left corner of a 2x2 grid
    for (x, y), lands in coordinates.items():
        if (x+1, y) in coordinates and (x, y+1) in coordinates and (x+1, y+1) in coordinates:
            megacities.append({
                "top_left": lands[0],
                "top_right": coordinates[(x+1, y)][0],
                "bottom_left": coordinates[(x, y+1)][0],
                "bottom_right": coordinates[(x+1, y+1)][0]
            })
    return megacities

def find_megacity_opportunities(data):
    potential_megacities = []
    # Filter and map coordinates to lists for quick lookup
    coords_by_tier = defaultdict(list)
    for land in data:
        coords_by_tier[(land['tier'], land['x_coordinate'], land['y_coordinate'])].append(land)

    # Look for combinations that match the criteria
    for land in data:
        x, y = land['x_coordinate'], land['y_coordinate']
        # Possible patterns for forming a 2x2 grid with the specific tier configuration
        possible_configurations = [
            # Configurations for Tier 4, Tier 4, Tier 3, Tier 2
            # [(4, x, y), (4, x+1, y), (3, x, y+1), (2, x+1, y+1)],
            # [(4, x, y), (4, x, y+1), (3, x+1, y), (2, x+1, y+1)],
            # [(4, x, y), (3, x+1, y), (4, x, y+1), (2, x+1, y+1)],
            # [(2, x, y), (3, x+1, y), (4, x, y+1), (4, x+1, y+1)],
            # Add more permutations for Tier 4, Tier 4, Tier 3, Tier 1
            # [(4, x, y), (4, x+1, y), (3, x, y+1), (1, x+1, y+1)],
            # [(4, x, y), (4, x, y+1), (3, x+1, y), (1, x+1, y+1)],
            # [(4, x, y), (3, x+1, y), (4, x, y+1), (1, x+1, y+1)],
            # [(1, x, y), (3, x+1, y), (4, x, y+1), (4, x+1, y+1)],
            # Add more permutations for Tier 4, Tier 4, Tier 2, Tier 2
            # [(4, x, y), (4, x+1, y), (2, x, y+1), (2, x+1, y+1)],
            # [(2, x, y), (2, x+1, y), (4, x, y+1), (4, x+1, y+1)],
            # [(4, x, y), (2, x+1, y), (4, x, y+1), (2, x+1, y+1)],
            # [(2, x, y), (4, x+1, y), (2, x, y+1), (4, x+1, y+1)]
            # Una Tier 4 y tres Tier 3
            # [(4, x, y), (3, x+1, y), (3, x, y+1), (3, x+1, y+1)],
            # [(3, x, y), (4, x+1, y), (3, x, y+1), (3, x+1, y+1)],
            # [(3, x, y), (3, x+1, y), (4, x, y+1), (3, x+1, y+1)],
            # [(3, x, y), (3, x+1, y), (3, x, y+1), (4, x+1, y+1)]
        ]
        for config in possible_configurations:
            if all(key in coords_by_tier for key in config):
                potential_megacities.append({
                    "lands": [coords_by_tier[key][0] for key in config]
                })
    return potential_megacities

def main():
    filepath = "./data/imx/lands.csv"
    lands_data = read_csv_data(filepath)
    
    # Group lands by owner
    lands_by_owner = defaultdict(list)
    for land in lands_data:
        lands_by_owner[land['user']].append(land)

    # Find existing megacities
    existing_megacities = []
    for user, lands in lands_by_owner.items():
        megacities = check_for_megacity(lands)
        if megacities:
            existing_megacities.extend(megacities)
    
    # Write existing megacities to JSON
    with open('./data/imx/megacities.json', 'w') as f:
        json.dump(existing_megacities, f, indent=4)

    # Find potential megacities
    potential_megacities = find_megacity_opportunities(lands_data)
    
    # Write potential megacities to JSON
    with open('./data/imx/our_megacities.json', 'w') as f:
        json.dump(potential_megacities, f, indent=4)

if __name__ == "__main__":
    main()


import json

# Path to the input JSON file
input_file_path = './data/imx/our_megacities.json'
# Path to the output text file
output_file_path = './data/imx/megacity_coordinates.txt'

def extract_and_write_coordinates(input_path, output_path):
    # Open and read the JSON data
    with open(input_path, 'r') as file:
        data = json.load(file)
    
    # Prepare to collect coordinates
    coordinates = []
    
    # Extract coordinates from each land entry
    for region in data:
        for land in region['lands']:
            x_coord = land['x_coordinate']
            y_coord = land['y_coordinate']
            coordinates.append(f"({x_coord}, {y_coord})\n")
    
    # Write the coordinates to the output file
    with open(output_path, 'w') as file:
        file.writelines(coordinates)
    print(f"Coordinates have been written to {output_path}")

# Execute the function
extract_and_write_coordinates(input_file_path, output_file_path)








import csv
import json
from collections import defaultdict

def read_csv_data(filepath):
    data = []
    with open(filepath, 'r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            row['x_coordinate'] = int(row['x_coordinate'])
            row['y_coordinate'] = int(row['y_coordinate'])
            row['tier'] = int(row['tier'])
            # Convert resource quantities to integers
            resource_fields = ['fuels', 'solon', 'carbon', 'crypton', 'silicon', 'elements', 'hydrogen', 'hyperion']
            for field in resource_fields:
                row[field] = int(row[field])
            data.append(row)
    return data

def has_resources(land):
    # Check if land has at least one unit of each resource
    return all(land[res] > 0 for res in ['fuels', 'solon', 'carbon', 'crypton', 'silicon', 'elements', 'hydrogen', 'hyperion'])

def check_for_megacity(user_lands):
    # Group lands by coordinates
    coordinates = defaultdict(list)
    for land in user_lands:
        if has_resources(land):  # Check if land has required resources
            coord = (land['x_coordinate'], land['y_coordinate'])
            coordinates[coord].append(land)
    
    megacities = []
    # Check every land if it can be the top-left corner of a 2x2 grid
    for (x, y), lands in coordinates.items():
        if (x+1, y) in coordinates and (x, y+1) in coordinates and (x+1, y+1) in coordinates:
            # Check if all corners have required resources
            if all(has_resources(coordinates[coord][0]) for coord in [(x+1, y), (x, y+1), (x+1, y+1)]):
                megacities.append({
                    "top_left": lands[0],
                    "top_right": coordinates[(x+1, y)][0],
                    "bottom_left": coordinates[(x, y+1)][0],
                    "bottom_right": coordinates[(x+1, y+1)][0]
                })
    return megacities

def main():
    filepath = "./data/imx/lands.csv"
    lands_data = read_csv_data(filepath)
    
    # Group lands by owner
    lands_by_owner = defaultdict(list)
    for land in lands_data:
        lands_by_owner[land['user']].append(land)

    # Find existing megacities
    existing_megacities = []
    for user, lands in lands_by_owner.items():
        megacities = check_for_megacity(lands)
        if megacities:
            existing_megacities.extend(megacities)
    
    # Write existing megacities to JSON
    with open('./data/imx/best_megacities.json', 'w') as f:
        json.dump(existing_megacities, f, indent=4)

if __name__ == "__main__":
    main()
