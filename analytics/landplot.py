import pandas as pd
from PIL import Image
import json

def create_heatmap_and_save_matrix(filepath):
    try:
        # Read data from CSV
        data = pd.read_csv(filepath)
        
        # Determine the extents of the grid
        x_min, x_max = data['x_coordinate'].min(), data['x_coordinate'].max()
        y_min, y_max = data['y_coordinate'].min(), data['y_coordinate'].max()
        
        # Calculate the size of the image
        width = x_max - x_min + 1
        height = y_max - y_min + 1
        
        # Create an image with RGB mode
        img = Image.new('RGB', (width, height), "black")  # start with a black image
        pixels = img.load()

        # Define colors for tiers in a heatmap style (hotter colors for higher tiers)
        tier_colors = {
            0: (0, 0, 0),        # Black for no land
            1: (173, 216, 230),  # Light blue for tier 1
            2: (144, 238, 144),  # Green for tier 2
            3: (255, 255, 0),    # Yellow for tier 3
            4: (255, 165, 0),    # Orange for tier 4
            5: (255, 0, 0)       # Red for tier 5
        }

        # Create a matrix to store pixel data
        color_matrix = []

        # Populate the image and matrix with colors based on land tiers
        for index, row in data.iterrows():
            x = row['x_coordinate'] - x_min
            y = row['y_coordinate'] - y_min
            tier = row['tier']
            pixels[x, y] = tier_colors.get(tier, (0, 0, 0))
            while len(color_matrix) <= y:
                color_matrix.append([])
            while len(color_matrix[y]) <= x:
                color_matrix[y].append(None)  # Fill sparse areas with None
            color_matrix[y][x] = tier_colors.get(tier, (0, 0, 0))

        # Save the image
        img.save('./data/imx/land_heatmap.jpeg', 'JPEG')

        # Save the color matrix to a JSON file
        with open('./data/imx/color_matrix.json', 'w') as f:
            json.dump(color_matrix, f)

    except Exception as e:
        print(f"An error occurred: {e}")

def main():
    filepath = "./data/imx/lands.csv"
    create_heatmap_and_save_matrix(filepath)

if __name__ == "__main__":
    main()
