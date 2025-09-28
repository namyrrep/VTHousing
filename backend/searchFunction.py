# This is the search functionality implementation using OpenAI and web search
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from serpapi import GoogleSearch
import re

# Check for .env file and load environment variables
if(os.path.exists('../.env')):  # .env is in parent directory
    load_dotenv('../.env')
    api_key = os.getenv('OPENAI_API_KEY')
    serpapi_key = os.getenv('SERPAPI_KEY')
    client = OpenAI(api_key=api_key)
else:
    raise Exception("No .env file found, Please read the README for instructions on how to set up the .env file")

# Updated context for web search integration with website links
HOUSING_AGENT_CONTEXT = """
You are a housing agent that helps users find rentals in Blacksburg, VA. You will be provided with real web search results from rental websites.

Extract rental information from the web search results that match the user's criteria. Only use information from the provided search results - do not make up any data.

For missing information:
- If exact address not available, use general location mentioned like "Blacksburg, VA"
- Estimate distance from Drillfield based on location (VT campus = 0-1 miles, downtown = 1-2 miles, etc.)
- For distance_from_drillfield_in_miles, only include the number (e.g., 1, not "Estimate 1")
- If price not mentioned, extract from context or use "Contact for pricing"
- For website_link, use the URL from the search results
- If bedrooms/bathrooms not specified, make reasonable estimates based on property type

You must respond with ONLY a raw JSON array (no markdown, no code blocks, no formatting). Format:
[
  {
    "name_of_rental": "string",
    "address": "string",
    "distance_from_drillfield_in_miles": 1,
    "rent_price": "integer or string", 
    "num_bedrooms": 2,
    "num_bathrooms": 1,
    "website_link": "string"
  }
]

Return up to 3 rentals from the search results, even if information is incomplete.
If you find ANY rental-related results, extract what you can and return them.
Do not return empty array unless NO rental information exists at all.
Do not wrap response in markdown code blocks. Return raw JSON only.
"""

def debug_json_response(ai_response):
    """Debug helper to identify JSON issues"""
    print("Raw AI Response:")
    print(repr(ai_response))  # Shows hidden characters
    print("\nCleaning response...")
    
    # Clean the response - remove markdown code blocks
    cleaned = ai_response.strip()
    
    # Remove markdown code block markers
    if cleaned.startswith('```json'):
        cleaned = cleaned[7:]  # Remove ```json
    if cleaned.startswith('```'):
        cleaned = cleaned[3:]  # Remove ```
    if cleaned.endswith('```'):
        cleaned = cleaned[:-3]  # Remove ending ```
    
    # Final cleanup
    cleaned = cleaned.strip()
    
    # Check for common issues
    if not cleaned.startswith('['):
        print("ERROR: Response doesn't start with '['")
    if not cleaned.endswith(']'):
        print("ERROR: Response doesn't end with ']'")
        
    try:
        parsed = json.loads(cleaned)
        print("JSON is valid!")
        return parsed
    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        print(f"Cleaned response: {repr(cleaned)}")
        return []

def search_rentals(user_search):
    """Complete search function with web search + AI processing"""
    try:
        print(f"Searching for: {user_search}")
        
        # Step 1: Web search for real rental data
        print("Step 1: Searching web for rental listings...")
        search_params = {
            "engine": "google",
            "q": f"apartments rentals Blacksburg VA {user_search} site:apartments.com OR site:zillow.com OR site:rent.com",
            "api_key": serpapi_key,
            "num": 10
        }
        
        search = GoogleSearch(search_params)
        results = search.get_dict()
        
        # DEBUG: Print what we got from SerpAPI
        print("DEBUG: SerpAPI Results:")
        if "organic_results" in results:
            print(f"Found {len(results['organic_results'])} organic results")
            for i, result in enumerate(results["organic_results"][:3], 1):
                print(f"{i}. Title: {result.get('title', 'No title')}")
                print(f"   Snippet: {result.get('snippet', 'No snippet')[:100]}...")
        else:
            print("No organic_results in SerpAPI response")
            print("Available keys:", list(results.keys()))
        
        # Step 2: Extract and format web results
        web_data = []
        if "organic_results" in results:
            for result in results["organic_results"]:
                title = result.get("title", "")
                snippet = result.get("snippet", "")
                link = result.get("link", "")
                
                web_data.append({
                    "title": title,
                    "snippet": snippet,
                    "link": link
                })
        
        if not web_data:
            print("No web search results found")
            return []
        
        print(f"Found {len(web_data)} web results")
        
        # Step 3: Format for AI processing
        formatted_web_data = "WEB SEARCH RESULTS:\n\n"
        for i, result in enumerate(web_data, 1):
            formatted_web_data += f"{i}. {result['title']}\n"
            formatted_web_data += f"   Description: {result['snippet']}\n"
            formatted_web_data += f"   URL: {result['link']}\n\n"
        
        # DEBUG: Print what we're sending to AI
        print("DEBUG: Data being sent to AI:")
        print(formatted_web_data[:500] + "..." if len(formatted_web_data) > 500 else formatted_web_data)
        
        # Step 4: Create combined prompt
        full_prompt = f"""
{formatted_web_data}

USER SEARCH CRITERIA: {user_search}

Based on the web search results above, extract rental information that matches the user's criteria.
Use the URL from each search result as the website_link.
For distance estimates, only include the number (e.g., 1, not "Estimate 1" or "1 mile").
"""
        
        # Step 5: Send to OpenAI
        print("Step 2: Processing with AI...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": HOUSING_AGENT_CONTEXT},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=800,
            temperature=0.2,
        )
        
        ai_response = response.choices[0].message.content
        print(f"AI Response received: {len(ai_response)} characters")
        
        # Step 6: Validate and return JSON with debugging
        rentals = debug_json_response(ai_response)
        if rentals:
            print(f"Successfully parsed {len(rentals)} rentals")
        else:
            print("WARNING: AI returned empty results. Check debug output above.")
        return rentals
            
    except Exception as e:
        print(f"Error in search function: {e}")
        return []

# Test the function
if __name__ == "__main__":
    user_search = "2 bedroom apartment under $1500 near Virginia Tech campus"
    results = search_rentals(user_search)
    
    print("\n" + "="*50)
    print("FINAL RESULTS:")
    print("="*50)
    print(json.dumps(results, indent=2))