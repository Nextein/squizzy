import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import datetime
import matplotlib.colors as mcolors
from matplotlib.colors import LinearSegmentedColormap

# Load and preprocess data
with open('data/imx/active_orders.json', 'r') as file:
    data = json.load(file)

# Normalize data
df = pd.json_normalize(data)

# Convert quantities to float to handle large numbers
df['buy.data.quantity'] = pd.to_numeric(df['buy.data.quantity'], errors='coerce') / 10**18

# Filter for Illuvium Illuvials collection
illuvials_df = df[df['sell.data.properties.collection.name'] == 'Illuvium Illuvials']


# Create a subplot layout, removing unnecessary rows and columns
fig = make_subplots(
    rows=4, cols=2,
    specs=[
        [{"type": "pie"}, {"type": "pie"}],
        [{"type": "pie"}, {"type": "pie"}],
        [{"type": "pie"}, {"type": "pie"}],
        [{"type": "table", "colspan": 2}, None],
    ],
    subplot_titles=[
        'Collections by Count',
        'Collections by Total $ Value',
        'Illuvials by Count',
        'Illuvials by Total $ Value',
        'Illuvials by Avg Price',
        'Illuvials Offer Pricing Table',
        'Illuvials Past Pricing Table'
    ]
)


# Generate a color palette
unique_names = illuvials_df['sell.data.properties.name'].unique()
colors = px.colors.qualitative.Set1
color_discrete_map = {name: colors[i % len(colors)] for i, name in enumerate(unique_names)}

# Create a custom colormap
colors = ["red", "orange", "yellow", "greenyellow", "green"]
n_bins = 100  # Increase this number for a finer transition
cmap = LinearSegmentedColormap.from_list("custom", colors, N=n_bins)

def color_scale(value, min_value, max_value):
    # Normalize the value between 0 and 1
    normalized = (value - min_value) / (max_value - min_value)
    # Get color from the colormap
    rgba_color = cmap(normalized)
    # Convert RGBA color to hex format for use in Plotly
    return mcolors.rgb2hex(rgba_color)


# 1 Pie chart of token types by count

count_per_type = df['sell.data.properties.collection.name'].value_counts().reset_index()
count_per_type.columns = ['name', 'count']  # Rename columns for clarity

fig.add_trace(
    px.pie(
        count_per_type,
        values='count',
        names='name',
    ).data[0],
    row=1, col=1
)

# 2 Pie chart of token types by total value
value_per_type = df.groupby('sell.data.properties.collection.name')['buy.data.quantity'].sum().reset_index()
value_per_type.columns = ['name', 'total_value']  # Rename columns for clarity

fig.add_trace(
    px.pie(
        value_per_type,
        values='total_value',
        names='name'
    ).data[0],
    row=1, col=2
)

# 3 Pie chart of Illuvials by count
count_per_illuvial = illuvials_df['sell.data.properties.name'].value_counts().reset_index()
count_per_illuvial.columns = ['name', 'count']  # Rename columns for clarity

fig.add_trace(
    px.pie(
        count_per_illuvial,
        values='count',
        names='name',
        color_discrete_map=color_discrete_map
    ).data[0],
    row=2, col=1
)

# 4 Pie chart of Illuvials by total value
value_per_illuvial = illuvials_df.groupby('sell.data.properties.name')['buy.data.quantity'].sum().reset_index()
value_per_illuvial.columns = ['name', 'total_value']  # Rename columns for clarity

fig.add_trace(
    px.pie(
        value_per_illuvial,
        values='total_value',
        names='name',
        color_discrete_map=color_discrete_map
    ).data[0],
    row=2, col=2
)

# 5 Pie chart of Illuvials by average price
avg_price_per_illuvial = illuvials_df.groupby('sell.data.properties.name')['buy.data.quantity'].mean().reset_index()
avg_price_per_illuvial.columns = ['name', 'average_price']  # Rename columns for clarity

fig.add_trace(
    px.pie(
        avg_price_per_illuvial,
        values='average_price',
        names='name',
        color_discrete_map=color_discrete_map
    ).data[0],
    row=3, col=1
)

# 6 Illuvials pricing table
price_stats = illuvials_df.groupby('sell.data.properties.name')['buy.data.quantity'].agg(['mean', 'min']).reset_index()
price_stats.columns = ['Illuvials', 'Average Price', 'Floor Price']

# Calculate data points for each Illuvial
data_points = illuvials_df['sell.data.properties.name'].value_counts().reset_index()
data_points.columns = ['Illuvials', 'Data Points']

# Load and preprocess data from aggregated_stats.json
with open('./data/illuvials/aggregated_stats.json', 'r') as file:
    stats_data = json.load(file)
stats_df = pd.json_normalize(stats_data)
stats_df = stats_df[['name', 'Tier', 'Stage']]
stats_df.columns = ['Illuvials', 'Tier', 'Stage']

# Merge all data together
full_stats = pd.merge(price_stats, data_points, on='Illuvials', how='left')
full_stats = pd.merge(full_stats, stats_df, on='Illuvials', how='left')

# Applying color scaling to the DataFrame columns for visualization
cell_colors = {
    'Average Price': [color_scale(val, full_stats['Average Price'].min(), full_stats['Average Price'].max()) for val in full_stats['Average Price']],
    'Floor Price': [color_scale(val, full_stats['Floor Price'].min(), full_stats['Floor Price'].max()) for val in full_stats['Floor Price']],
    'Data Points': [color_scale(val, full_stats['Data Points'].min(), full_stats['Data Points'].max()) for val in full_stats['Data Points']]
}

fig.add_trace(
    go.Table(
        header=dict(values=['Data Points', 'Illuvials', 'Average Price', 'Floor Price', 'Tier', 'Stage']),
        cells=dict(values=[
                full_stats['Data Points'],
                full_stats.Illuvials,
                full_stats['Average Price'].map('{:,.4f}'.format),
                full_stats['Floor Price'].map('{:,.4f}'.format),
                full_stats['Tier'],
                full_stats['Stage']
            ],
            # fill_color=[
            #         'white',
            #         'white',  # Default color for non-numeric columns
            #         cell_colors['Average Price'],
            #         cell_colors['Floor Price'],
            #         'white',  # Default color for non-numeric columns
            #         'white',  # Default color for non-numeric columns
            # ],
            # font_color=[
            #     cell_colors['Data Points'],
            #     'black',
            #     'white',
            #     'white',
            #     'black',
            #     'black',
            # ]
        )
    ),
    row=4, col=1
)

# Update layout and display the figure
fig.update_layout(height=3000, showlegend=False, title_text="DEX Analysis")

# Get current date and time
now = datetime.datetime.now()
formatted_date = now.strftime("%Y-%m-%d_%H")

# Filename with date and time
filename = f"./dashboards/{formatted_date}.html"

# Save the figure
fig.write_html(filename)
print(f"Figure saved as {filename}")

fig.show()
