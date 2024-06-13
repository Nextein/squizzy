import requests
from illuvials import illuvials

def fetch_and_save_html(url, file_path):
    """
    Fetches an HTML page from the specified URL and saves it to a file.

    Args:
    url (str): The URL of the webpage to fetch.
    file_path (str): The local path where the HTML should be saved.

    Returns:
    None
    """
    try:
        # Send a GET request to the URL
        response = requests.get(url)
        # Raise an exception if the request was unsuccessful
        response.raise_for_status()

        # Write the HTML content to the specified file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(response.text)
        print(f"HTML content has been saved to {file_path}")

    except requests.RequestException as e:
        print(f"An error occurred: {e}")

# Example usage

for ilv in illuvials:
    url = f"https://www.illuvialmaster.com/illuvial/{ilv}"
    file_path = f"./data/illuvials/{ilv}.html"
    fetch_and_save_html(url, file_path)
    
