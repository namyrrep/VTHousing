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

# Major streets and areas in Blacksburg, VA
BLACKSBURG_STREETS = [
    # Main streets
    "Main Street", "University City Boulevard", "South Main Street", "North Main Street",
    "Prices Fork Road", "Progress Street", "College Avenue", "Washington Street",
    "Clay Street", "Draper Road", "Tom's Creek Road", "Giles Road",
    "Harding Avenue", "Kabrich Street", "McBryde Drive", "Patrick Henry Drive",
    "Roanoke Street", "Turner Street", "Kent Street", "Eheart Street",
    "Lucas Avenue", "Preston Avenue", "Sturbridge Drive", "Alumni Mall",
    
    # Campus area streets
    "Duck Pond Drive", "Ag Quad Lane", "Beamer Way", "Research Center Drive",
    "Plantation Road", "Old Turner Street", "Faculty Street", "Stadium Drive",
    
    # Residential areas
    "Foxridge Drive", "University Mall Drive", "Tall Oaks Drive", "Heather Drive",
    "Harvest Drive", "Hunter Hills Drive", "Hickory Street", "Knollwood Drive",
    "Laurel Street", "Lee Street", "Maple Avenue", "Oak Lane",
    "Pine Street", "Pleasant Street", "Ridgewood Drive", "Spring Street",
    "Sunset Boulevard", "Toms Creek Road", "Vista Drive", "Woodbine Drive",
    
    # Apartment complex areas
    "Pheasant Run Circle", "University Terrace Drive", "Collegiate Square",
    "Village Way", "Windsor Hills Drive", "Terrace View Drive",
    
    # Newer developments
    "Innovation Drive", "Corporate Research Drive", "Technology Boulevard",
    "Southgate Drive", "Northside Drive", "Mill Creek Drive"
]

# Popular apartment complexes and housing areas
BLACKSBURG_HOUSING_AREAS = [
    "University Terrace", "Pheasant Run Crossing", "Collegiate Suites",
    "The Village", "Windsor Hills", "Foxridge", "Hunter's Ridge",
    "Sturbridge Square", "Mill Creek", "University Mall area",
    "Downtown Blacksburg area", "Hethwood", "Blacksburg Country Club area"
]

# Updated context for web search integration with website links
HOUSING_AGENT_CONTEXT = """
You are a housing agent that helps users find rentals in Blacksburg, VA. You will be provided with real web search results from rental websites.

Extract rental information from the web search results that match the user's criteria. Only use information from the provided search results - do not make up any data.

For addresses, prioritize using specific street addresses when available. If you find references to these Blacksburg streets, use them:
""" + ", ".join(BLACKSBURG_STREETS[:20]) + """

For missing information:
- If exact address not available but area is mentioned, use area name (e.g., "University Terrace area", "Near VT Campus")
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

Return up to 3 rentals from the search results, prioritizing those with specific Blacksburg street addresses.
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

def enhance_search_with_streets(user_search):
    """Enhance user search with relevant Blacksburg street names and areas"""
    enhanced_queries = [user_search]  # Start with original
    
    # Add street-specific searches
    street_keywords = ["apartment", "rental", "house", "condo"]
    
    # If user mentions specific areas, add street-specific searches
    search_lower = user_search.lower()
    
    # Add popular street searches
    popular_streets = [
        "Progress Street", "University City Boulevard", "Main Street", 
        "Prices Fork Road", "College Avenue", "Patrick Henry Drive"
    ]
    
    for street in popular_streets:
        enhanced_queries.append(f"{user_search} {street} Blacksburg VA")
    
    # Add housing complex searches
    popular_complexes = [
        "University Terrace", "Pheasant Run Crossing", "Collegiate Suites",
        "The Village", "Foxridge"
    ]
    
    for complex_name in popular_complexes:
        enhanced_queries.append(f"{user_search} {complex_name} Blacksburg VA")
    
    return enhanced_queries

def search_rentals(user_search):
    """Complete search function with enhanced street-based searching"""
    try:
        print(f"Searching for: {user_search}")
        
        # Get enhanced search queries
        search_queries = enhance_search_with_streets(user_search)
        print(f"Enhanced with {len(search_queries)} search variations")
        
        all_web_data = []
        
        # Search with multiple enhanced queries
        for i, query in enumerate(search_queries[:3], 1):  # Limit to 3 variations
            print(f"Step {i}: Searching web for: {query}")
            
            search_params = {
                "engine": "google",
                "q": f"apartments rentals {query} site:apartments.com OR site:zillow.com OR site:rent.com OR site:realtor.com",
                "api_key": serpapi_key,
                "num": 5  # Fewer per query since we're doing multiple
            }
            
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            if "organic_results" in results:
                print(f"  Found {len(results['organic_results'])} results for query {i}")
                for result in results["organic_results"]:
                    title = result.get("title", "")
                    snippet = result.get("snippet", "")
                    link = result.get("link", "")
                    
                    # Avoid duplicates
                    if link not in [item["link"] for item in all_web_data]:
                        all_web_data.append({
                            "title": title,
                            "snippet": snippet,
                            "link": link,
                            "query_used": query
                        })
        
        if not all_web_data:
            print("No web search results found")
            return []
        
        print(f"Found {len(all_web_data)} total unique web results")
        
        # Step 3: Format for AI processing with street context
        formatted_web_data = "WEB SEARCH RESULTS:\n\n"
        for i, result in enumerate(all_web_data, 1):
            formatted_web_data += f"{i}. {result['title']}\n"
            formatted_web_data += f"   Description: {result['snippet']}\n"
            formatted_web_data += f"   URL: {result['link']}\n"
            formatted_web_data += f"   Search Query: {result['query_used']}\n\n"
        
        # DEBUG: Print what we're sending to AI
        print("DEBUG: Data being sent to AI:")
        print(formatted_web_data[:800] + "..." if len(formatted_web_data) > 800 else formatted_web_data)
        
        # Step 4: Create enhanced prompt with street knowledge
        street_list = ", ".join(BLACKSBURG_STREETS[:30])
        area_list = ", ".join(BLACKSBURG_HOUSING_AREAS)
        
        full_prompt = f"""
{formatted_web_data}

USER SEARCH CRITERIA: {user_search}

BLACKSBURG STREET REFERENCE LIST:
{street_list}

KNOWN HOUSING AREAS IN BLACKSBURG:
{area_list}

INSTRUCTIONS:
- Extract rental properties from the search results above
- When you find address information, use specific street names from the reference list when possible
- If you see references to the known housing areas, include those in the address
- Prioritize results that mention specific Blacksburg streets or known housing complexes
- Use the most specific address information available in the search results
- For areas like "near campus" or "university area", try to be more specific if street names are mentioned

Based on the web search results above, extract rental information that matches the user's criteria.
Use the URL from each search result as the website_link.
For distance estimates, only include the number (e.g., 1, not "Estimate 1" or "1 mile").
Return up to 3 rentals, prioritizing those with specific Blacksburg addresses.
"""
        
        # Step 5: Send to OpenAI
        print("Processing with AI...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": HOUSING_AGENT_CONTEXT},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=1000,
            temperature=0.2,
        )
        
        ai_response = response.choices[0].message.content
        print(f"AI Response received: {len(ai_response)} characters")
        
        # Step 6: Parse JSON response
        rentals = debug_json_response(ai_response)
        
        print(f"Successfully processed {len(rentals)} rentals")
        for rental in rentals:
            print(f"✓ Found: {rental.get('name_of_rental', 'Unknown')} at {rental.get('address', 'Unknown address')}")
        
        return rentals
            
    except Exception as e:
        print(f"Error in search function: {e}")
        return []

def search_specific_sites(address, property_name=""):
    """Search specifically for Zillow and Apartments.com listings for a specific address"""
    try:
        results = {}
        
        # Clean the address for search
        clean_address = address.replace(',', ' ').replace('  ', ' ').strip()
        search_term = f"{clean_address} Blacksburg VA"
        
        print(f"Searching specific sites for: {search_term}")
        
        # Search for Zillow
        zillow_params = {
            "engine": "google",
            "q": f'"{clean_address}" site:zillow.com Blacksburg VA',
            "api_key": serpapi_key,
            "num": 3
        }
        
        zillow_search = GoogleSearch(zillow_params)
        zillow_results = zillow_search.get_dict()
        
        if "organic_results" in zillow_results and zillow_results["organic_results"]:
            for result in zillow_results["organic_results"]:
                link = result.get("link", "")
                if "zillow.com" in link.lower():
                    results["zillow"] = {
                        "url": link,
                        "title": result.get("title", ""),
                        "snippet": result.get("snippet", "")
                    }
                    break
        
        # Search for Apartments.com
        apt_params = {
            "engine": "google", 
            "q": f'"{clean_address}" site:apartments.com Blacksburg VA',
            "api_key": serpapi_key,
            "num": 3
        }
        
        apt_search = GoogleSearch(apt_params)
        apt_results = apt_search.get_dict()
        
        if "organic_results" in apt_results and apt_results["organic_results"]:
            for result in apt_results["organic_results"]:
                link = result.get("link", "")
                if "apartments.com" in link.lower():
                    results["apartments_com"] = {
                        "url": link,
                        "title": result.get("title", ""),
                        "snippet": result.get("snippet", "")
                    }
                    break
        
        # Search for Rent.com
        rent_params = {
            "engine": "google",
            "q": f'"{clean_address}" site:rent.com Blacksburg VA',
            "api_key": serpapi_key,
            "num": 3
        }
        
        rent_search = GoogleSearch(rent_params)
        rent_results = rent_search.get_dict()
        
        if "organic_results" in rent_results and rent_results["organic_results"]:
            for result in rent_results["organic_results"]:
                link = result.get("link", "")
                if "rent.com" in link.lower():
                    results["rent_com"] = {
                        "url": link,
                        "title": result.get("title", ""),
                        "snippet": result.get("snippet", "")
                    }
                    break
        
        print(f"Found site links: {list(results.keys())}")
        return results
        
    except Exception as e:
        print(f"Error searching specific sites: {e}")
        return {}

# Test the function
if __name__ == "__main__":
    user_search = "2 bedroom apartment under $1500 near Virginia Tech campus"
    results = search_rentals(user_search)
    
    print("\n" + "="*50)
    print("FINAL RESULTS:")
    print("="*50)
    print(json.dumps(results, indent=2))