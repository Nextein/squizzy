import pandas as pd
import plotly.express as px
from plotly.subplots import make_subplots
import json

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
        [{"type": "pie"}, {"type": "pie"}],
    ],
    subplot_titles=[
        'Collections by Count',
        'Collections by Total Value',
        'Number of Illuvials',
        'Total Value of Illuvials' 
    ]
)

# Custom function to adjust text info based on percentage
def custom_textinfo(values):
    return ['label+percent' if x >= 0.4 else 'label' for x in (values / values.sum() * 100)]


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
        names='name'
    ).data[0],
    row=2, col=2
)

# Update layout and display the figure
fig.update_layout(height=6000, showlegend=False, title_text="DEX Analysis")
fig.show()
