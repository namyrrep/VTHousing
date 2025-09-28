import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DropdownMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
      <button
        style={{
          background: '#861f41', color: '#ffffff', border: 'none', padding: '0.7em 1.2em', borderRadius: 6,
          fontSize: '1.1em', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px #333'
        }}
        onClick={() => setOpen(!open)}
      >
        ☰ Menu 
      </button>
      {open && (
        <div style={{
          marginTop: 8, background: '#ddd', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 12px #333',
          minWidth: 140, display: 'flex', flexDirection: 'column', padding: '0.5em 0'
        }}>
          <Link to="/Checklist" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Checklist</Link>
          <Link to="/Prompt" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Prompt</Link>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [search, setSearch] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    // Check if we have at least some search criteria
    const hasSearchText = search.trim();
    const hasFilters = maxRent || minBeds || minBaths;
    
    if (!hasSearchText && !hasFilters) {
      setError("Please enter a search term or select at least one filter");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Build search query from user inputs
      let searchQuery = search.trim() || "rental apartments Blacksburg VA"; // Default if no search text
      
      if (maxRent) {
        searchQuery += ` under $${maxRent}`;
      }
      if (minBeds) {
        searchQuery += ` ${minBeds} bedroom${minBeds > 1 ? 's' : ''}`;
      }
      if (minBaths) {
        searchQuery += ` ${minBaths} bathroom${minBaths > 1 ? 's' : ''}`;
      }

      console.log("Searching for:", searchQuery);

      // Call your Flask backend API
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          filters: {
            maxRent: maxRent ? parseInt(maxRent) : null,
            minBeds: minBeds ? parseInt(minBeds) : null,
            minBaths: minBaths ? parseInt(minBaths) : null
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle potential error responses
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResults(data || []);

    } catch (error) {
      console.error('Search error:', error);
      setError(`Search failed: ${error.message}. Make sure your backend server is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setMaxRent("");
    setMinBeds("");
    setMinBaths("");
    setResults([]);
    setError("");
  };

  // Check if we can enable search button
  const canSearch = search.trim() || maxRent || minBeds || minBaths;

  // New function to search for actual site links for a specific address
  const searchSpecificSites = async (address, propertyName) => {
    try {
      const response = await fetch('http://localhost:5000/api/search-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: address,
          property_name: propertyName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Site search results:', data);
        return data;
      }
    } catch (error) {
      console.error('Site search error:', error);
    }
    
    return {};
  };

  // Helper function to generate fallback search URLs
  const generateFallbackUrls = (rental) => {
    const address = encodeURIComponent(rental.address + ' Blacksburg VA');
    const propertyName = encodeURIComponent(rental.name_of_rental);
    
    return {
      zillow: `https://www.zillow.com/homes/${address}_rb/`,
      apartmentsCom: `https://www.apartments.com/search/${address}/`,
      rentCom: `https://www.rent.com/virginia/blacksburg-apartments/`
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: '#ddd', 
      paddingBottom: '2rem',
      boxSizing: 'border-box',
      overflow: 'hidden' // Prevent horizontal scroll
    }}>
      <DropdownMenu />
      
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '4rem', 
        marginBottom: '3rem',
        width: '100%',
        padding: '4rem 1rem 3rem 1rem'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
          marginBottom: '0.5rem', 
          color: '#861f41', 
          fontWeight: 'bold', 
          letterSpacing: '2px',
          margin: '0 0 0.5rem 0'
        }}>
          Hokie Homes
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
          color: '#333', 
          marginBottom: '2rem',
          margin: '0 0 2rem 0'
        }}>
          Find your perfect rental near Virginia Tech
        </p>
      </div>

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        padding: '0 1rem',
        boxSizing: 'border-box'
      }}>

        {/* Search Container */}
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: 'clamp(1rem, 3vw, 2rem)', 
          backgroundColor: '#861f41', 
          borderRadius: '15px', 
          boxShadow: '0 4px 20px #333',
          marginBottom: '2rem',
          boxSizing: 'border-box'
        }}>
          
          {/* Main Search Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem', 
              color: '#ffffff',
              fontSize: 'clamp(1rem, 1.5vw, 1.1rem)'
            }}>
              What are you looking for? (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 'apartment near campus', 'close to drillfield', 'quiet neighborhood'..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                padding: 'clamp(0.75rem, 1.5vw, 1rem)',
                borderRadius: '10px',
                border: '2px solid #ddd', 
                outline: 'none',
                boxShadow: '0 2px 8px #333',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#333'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Filter Inputs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'clamp(1rem, 2vw, 1.5rem)', 
            marginBottom: '2rem',
            width: '100%'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem', 
                color: '#ffffff',
                fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
              }}>
                Maximum Rent
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#333',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  zIndex: 2
                }}>
                  $
                </span>
                <input
                  type="number"
                  placeholder="1500"
                  value={maxRent}
                  onChange={e => setMaxRent(e.target.value)}
                  style={{ 
                    width: '100%',
                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', 
                    padding: 'clamp(0.6rem, 1.2vw, 0.75rem) clamp(0.6rem, 1.2vw, 0.75rem) clamp(0.6rem, 1.2vw, 0.75rem) 2rem', 
                    borderRadius: '8px', 
                    border: '2px solid #ddd', 
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box', 
                  }}
                  onFocus={e => e.target.style.borderColor = '#861f41'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem', 
                color: '#ffffff',
                fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
              }}>
                Minimum Bedrooms
              </label>
              <select
                value={minBeds}
                onChange={e => setMinBeds(e.target.value)}
                style={{ 
                  width: '100%',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', 
                  padding: 'clamp(0.6rem, 1.2vw, 0.75rem)', 
                  borderRadius: '8px', 
                  border: '2px solid #ddd',
                  backgroundColor: '#333',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#861f41'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              >
                <option value="">Any</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem', 
                color: '#ffffff',
                fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
              }}>
                Minimum Bathrooms
              </label>
              <select
                value={minBaths}
                onChange={e => setMinBaths(e.target.value)}
                style={{ 
                  width: '100%',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', 
                  padding: 'clamp(0.6rem, 1.2vw, 0.75rem)', 
                  borderRadius: '8px', 
                  border: '2px solid #ddd',
                  backgroundColor: '#333',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#861f41'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              >
                <option value="">Any</option>
                <option value="1">1+ Bathroom</option>
                <option value="2">2+ Bathrooms</option>
                <option value="3">3+ Bathrooms</option>
              </select>
            </div>
          </div>

          {/* Search Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '1rem', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={handleSearch}
              disabled={loading || !canSearch}
              style={{
                background: '#861f41',
                color: '#861f41',
                border: '2px solid #ffffff',
                padding: 'clamp(0.8rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                borderRadius: '10px',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px #333',
                transition: 'all 0.3s',
                minWidth: 'clamp(120px, 20vw, 150px)',
                flex: '1 1 auto',
                maxWidth: '200px'
              }}
              onMouseOut={e => {
                if (!loading && search.trim()) {
                  e.target.style.backgroundColor = '#861f41';
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}  
              onMouseOver={e => {
                if (!loading && search.trim()) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#861f41';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? 'Searching...' : 'Search Rentals'}
            </button>

            <button
              onClick={clearSearch}
              style={{
                background: 'transparent',
                color: '#861f41',
                border: '2px solid #ffffff',
                padding: 'clamp(0.8rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                borderRadius: '10px',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px #333',
                transition: 'all 0.3s',
                flex: '1 1 auto',
                maxWidth: '200px'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.color = '#861f41';
                e.target.style.transform = 'translateY(0)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateY(-2px)';
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            width: '100%',
            margin: '0 0 2rem 0', 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            color: '#c00',
            boxSizing: 'border-box'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ width: '100%' }}>
            <h3 style={{ 
              color: '#861f41', 
              marginBottom: '1.5rem', 
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              textAlign: 'center'
            }}>
              Found {results.length} rental{results.length !== 1 ? 's' : ''}:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              width: '100%'
            }}>
              {results.map((rental, index) => {
                // Create a component for each rental card with its own state
                return <RentalCard key={index} rental={rental} searchSpecificSites={searchSpecificSites} generateFallbackUrls={generateFallbackUrls} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for each rental card to manage individual state
function RentalCard({ rental, searchSpecificSites, generateFallbackUrls }) {
  const [siteLinks, setSiteLinks] = useState({});
  const [loadingSites, setLoadingSites] = useState(true);
  
  const fallbackUrls = generateFallbackUrls(rental);
  
  // Function to load specific site links for this rental
  const loadSiteLinks = async () => {
    try {
      const links = await searchSpecificSites(rental.address, rental.name_of_rental);
      setSiteLinks(links);
    } catch (error) {
      console.error('Error loading site links:', error);
    }
    setLoadingSites(false);
  };

  // Automatically load site links when component mounts
  useEffect(() => {
    loadSiteLinks();
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#861f41',
      border: '1px solid #861f41',
      padding: 'clamp(1rem, 2vw, 1.5rem)', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px #333',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <h4 style={{ 
        color: '#ffffff',
        marginBottom: '0.5rem',
        fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
        wordBreak: 'break-word'
      }}>
        {rental.name_of_rental}
      </h4>
      <p style={{ 
        color: '#ffffff',
        marginBottom: '0.5rem',
        fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
        wordBreak: 'break-word'
      }}>
        📍 {rental.address}
      </p>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <span style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
          whiteSpace: 'nowrap'
        }}>
          💰 ${rental.rent_price}/month
        </span>
        <span style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
          whiteSpace: 'nowrap'
        }}>
          🛏️ {rental.num_bedrooms} bed{rental.num_bedrooms !== 1 ? 's' : ''}
        </span>
        <span style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
          whiteSpace: 'nowrap'
        }}>
          🚿 {rental.num_bathrooms} bath{rental.num_bathrooms !== 1 ? 's' : ''}
        </span>
        <span style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
          whiteSpace: 'nowrap'
        }}>
          📏 {rental.distance_from_drillfield_in_miles} mile{rental.distance_from_drillfield_in_miles !== 1 ? 's' : ''} from Drillfield
        </span>
      </div>
      
      {/* Site Links Section - now always show */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        flexWrap: 'wrap',
        marginBottom: '1rem'
      }}>
        {/* Original listing - always show if available */}
        {rental.website_link && (
          <a 
            href={rental.website_link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#ffffff',
              textDecoration: 'none', 
              fontWeight: 'bold',
              border: '2px solid #ffffff',
              backgroundColor: 'transparent',
              padding: '0.4rem 0.8rem',
              borderRadius: '5px',
              display: 'inline-block',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#861f41';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            📄 Original
          </a>
        )}

        {/* Show loading indicator while searching */}
        {loadingSites && (
          <div style={{ 
            color: '#ffffff',
            border: '2px solid #ffffff',
            backgroundColor: 'transparent',
            padding: '0.4rem 0.8rem',
            borderRadius: '5px',
            fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
            whiteSpace: 'nowrap',
            opacity: 0.7
          }}>
            🔄 Finding listings...
          </div>
        )}

        {/* Zillow link - only show if found */}
        {!loadingSites && siteLinks.zillow && (
          <a 
            href={siteLinks.zillow.url}
            target="_blank" 
            rel="noopener noreferrer"
            title={siteLinks.zillow.title}
            style={{ 
              color: '#ffffff',
              textDecoration: 'none', 
              fontWeight: 'bold',
              border: '2px solid #0074E4',
              backgroundColor: 'transparent',
              padding: '0.4rem 0.8rem',
              borderRadius: '5px',
              display: 'inline-block',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#0074E4';
              e.target.style.color = '#ffffff';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            🏠 Zillow
          </a>
        )}

        {/* Apartments.com link - only show if found */}
        {!loadingSites && siteLinks.apartments_com && (
          <a 
            href={siteLinks.apartments_com.url}
            target="_blank" 
            rel="noopener noreferrer"
            title={siteLinks.apartments_com.title}
            style={{ 
              color: '#ffffff',
              textDecoration: 'none', 
              fontWeight: 'bold',
              border: '2px solid #E31837',
              backgroundColor: 'transparent',
              padding: '0.4rem 0.8rem',
              borderRadius: '5px',
              display: 'inline-block',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#E31837';
              e.target.style.color = '#ffffff';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            🏢 Apartments.com
          </a>
        )}

        {/* Rent.com link - only show if found */}
        {!loadingSites && siteLinks.rent_com && (
          <a 
            href={siteLinks.rent_com.url}
            target="_blank" 
            rel="noopener noreferrer"
            title={siteLinks.rent_com.title}
            style={{ 
              color: '#ffffff',
              textDecoration: 'none', 
              fontWeight: 'bold',
              border: '2px solid #FF6B35',
              backgroundColor: 'transparent',
              padding: '0.4rem 0.8rem',
              borderRadius: '5px',
              display: 'inline-block',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#FF6B35';
              e.target.style.color = '#ffffff';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            🏡 Rent.com
          </a>
        )}

        {/* Show message if no additional listings found */}
        {!loadingSites && !siteLinks.zillow && !siteLinks.apartments_com && !siteLinks.rent_com && (
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
            fontStyle: 'italic',
            padding: '0.4rem 0'
          }}>
            No additional listings found
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;