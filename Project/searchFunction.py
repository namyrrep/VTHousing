# This is the search functionality implmementation using open ai
import os
from dotenv import load_dotenv
from openai import OpenAI
import json #in case Chat is not producing valid JSON

#checks to see if api key is in environment variables
if(os.path.exists('.env')):
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    client = OpenAI(api_key=api_key)
else:
    raise Exception("No .env file found, Please read the README for instructions on how to set up the .env file")

# Context for the model to use when searching
HOUSING_AGENT_CONTEXT = """
You are a housing agent that help users find rentals in Blacksburg, VA.

A user will implement a search that has context about what they are looking for in a rental. You need to parse this search and only use information relevant to distance, rent price, number of bedrooms, number of bathrooms, and address.
If some of this information is missing, you should assume the user is open to any option.

You are not allowed to make up any information about the rentals. If the user asks for information you do not have, you should respond with "I don't know".
You should only respond with a JSON array containing objects with the following format:
[
  {
    "address": "string",
    "distance_from_drillfield_in_miles": "integer",
    "rent_price": "integer", 
    "num_bedrooms": "integer",
    "num_bathrooms": "integer"
  }
]
You are only allowed to respond with this JSON array, and nothing else.
Only ever respond with 3 rentals at once, if there is less than 3 rentals that match the user's search, you should respond with less than 3 rentals.
If there are no rentals that match the user's search, you should respond with an empty array [].
"""

def search_rentals(user_search): #This stores the search function using our context and given user search
    try:
        response = client.chat.completions.create(
            #Most capable model as of open api
            model="gpt-4o",
            messages=[
                {"role": "system", "content": HOUSING_AGENT_CONTEXT},
                {"role": "user", "content": user_search}
            ],
            max_tokens=500,
            #How close the model should stick to the context, lower is more strict
            temperature=0.2,
        )
        ai_response = response.choices[0].message.content

        # Validate that it's actually a JSON
        try:
            rentals = json.loads(ai_response)
            return rentals
        except json.JSONDecodeError:
            print("Error: Response is not valid JSON")
            return []  # Return empty array instead of error string
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return []  # Return empty array instead of error string