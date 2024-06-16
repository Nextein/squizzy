import json
import numpy as np
import matplotlib.pyplot as plt

def load_and_process_data(filepath):
    # Load the JSON data
    with open(filepath, 'r') as file:
        data = json.load(file)
    
    # Find the maximum width (number of pixels in the longest row)
    max_width = max(len(row) for row in data if row is not None)

    # Replace 'null' with [0, 0, 0] and pad shorter rows
    processed_data = []
    for row in data:
        if row is None:
            processed_row = [[0, 0, 0]] * max_width  # Consider entire missing rows
        else:
            processed_row = [pixel if pixel is not None else [0, 0, 0] for pixel in row]
            processed_row += [[0, 0, 0]] * (max_width - len(row))  # Pad rows shorter than the max width
        processed_data.append(processed_row)

    return np.array(processed_data, dtype=np.uint8)

# Define the file path
filepath = './data/imx/color_matrix.json'

# Process the data
color_matrix = load_and_process_data(filepath)

# Plotting the image
plt.figure(figsize=(10, 6))
plt.imshow(color_matrix, aspect='auto')
plt.axis('off')  # Hide the axes
plt.show()

