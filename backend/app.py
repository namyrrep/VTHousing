from flask import Flask, request, jsonify
from flask_cors import CORS

# Import searchFunction from the same directory
from searchFunction import search_rentals

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

@app.route('/api/search', methods=['POST'])
def search_endpoint():
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query']
        filters = data.get('filters', {})
        
        # Build enhanced query with filters
        enhanced_query = query
        if filters.get('maxRent'):
            enhanced_query += f" under ${filters['maxRent']}"
        if filters.get('minBeds'):
            enhanced_query += f" {filters['minBeds']} bedroom"
        if filters.get('minBaths'):
            enhanced_query += f" {filters['minBaths']} bathroom"
        
        print(f"Processing search: {enhanced_query}")
        
        # Call your existing search function
        results = search_rentals(enhanced_query)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in search endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/search-sites', methods=['POST'])
def search_sites_endpoint():
    try:
        data = request.get_json()
        
        if not data or 'address' not in data:
            return jsonify({'error': 'Address is required'}), 400
        
        address = data['address']
        property_name = data.get('property_name', '')
        
        print(f"Searching specific sites for address: {address}")
        
        # Import the search function
        from searchFunction import search_specific_sites
        results = search_specific_sites(address, property_name)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in search sites endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
