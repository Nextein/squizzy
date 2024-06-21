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
            processed_row = [[0, 0, 0]] * max_width
        else:
            processed_row = [pixel if pixel is not None else [0, 0, 0] for pixel in row]
            processed_row += [[0, 0, 0]] * (max_width - len(row))
        processed_data.append(processed_row)

    return np.array(processed_data, dtype=np.uint8)

def load_megacities(filepath):
    # Load the megacities data
    with open(filepath, 'r') as file:
        data = json.load(file)
    
    # Extract the coordinates
    coordinates = []
    for city_block in data:
        for position in ['top_left', 'top_right', 'bottom_left', 'bottom_right']:
            if position in city_block:
                coord = city_block[position]
                if 'x_coordinate' in coord and 'y_coordinate' in coord:
                    coordinates.append((coord['y_coordinate'], coord['x_coordinate']))
    return coordinates

# File paths
color_matrix_filepath = './data/imx/color_matrix.json'
megacities_filepath = './data/imx/megacities.json'

# Load the data
color_matrix = load_and_process_data(color_matrix_filepath)
megacities = load_megacities(megacities_filepath)

# Mark megacities on the heatmap
for y, x in megacities:
    if 0 <= x < color_matrix.shape[1] and 0 <= y < color_matrix.shape[0]:
        color_matrix[y, x] = [255, 105, 180]  # Pink color

# Plotting the image with megacities
plt.figure(figsize=(10, 6))
plt.imshow(color_matrix, aspect='auto')
plt.axis('off')


# Optionally display the image as well
plt.show()


# Draw our megacities
megacities_filepath = './data/imx/our_megacities.json'
color_matrix = load_and_process_data(color_matrix_filepath)
megacities = load_megacities(megacities_filepath)

# Mark megacities on the heatmap
for y, x in megacities:
    if 0 <= x < color_matrix.shape[1] and 0 <= y < color_matrix.shape[0]:
        color_matrix[y, x] = [255, 105, 180]  # Pink color

# Plotting the image with megacities
plt.figure(figsize=(10, 6))
plt.imshow(color_matrix, aspect='auto')
plt.axis('off')


# Optionally display the image as well
plt.show()