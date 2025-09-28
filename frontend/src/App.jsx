import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [search, setSearch] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // New state for to-do list functionality
  const [appliedRentals, setAppliedRentals] = useState({});

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
    // Note: We do NOT clear appliedRentals here - they persist!
  };

  // Check if we can enable search button - should work when ANY field has content
  const canSearch = search.trim() || maxRent || minBeds || minBaths;
  
  // Check if we can enable clear button - should work when ANY field has content OR there are results/errors
  const canClear = search.trim() || maxRent || minBeds || minBaths || results.length > 0 || error;

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

  // Function to handle applying for a rental
  const handleApply = (rental) => {
    const rentalKey = `${rental.name_of_rental}_${rental.address}`;
    
    if (!appliedRentals[rentalKey]) {
      const now = new Date();
      const defaultTasks = [
        { 
          id: 1, 
          task: "Research the property and neighborhood", 
          completed: false, 
          status: 'not_started',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
          category: 'research',
          estimatedTime: '2-3 hours'
        },
        { 
          id: 2, 
          task: "Schedule a viewing/tour", 
          completed: false, 
          status: 'not_started',
          priority: 'high',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
          category: 'viewing',
          estimatedTime: '30 minutes',
          dependencies: [1]
        },
        { 
          id: 3, 
          task: "Gather required documents (ID, income proof, references)", 
          completed: false, 
          status: 'not_started',
          priority: 'high',
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days
          category: 'documentation',
          estimatedTime: '1-2 hours'
        },
        { 
          id: 4, 
          task: "Check credit score and get credit report", 
          completed: false, 
          status: 'not_started',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days
          category: 'financial',
          estimatedTime: '30 minutes'
        },
        { 
          id: 5, 
          task: "Calculate total monthly costs (rent + utilities + fees)", 
          completed: false, 
          status: 'not_started',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
          category: 'financial',
          estimatedTime: '1 hour'
        },
        { 
          id: 6, 
          task: "Read lease agreement thoroughly", 
          completed: false, 
          status: 'not_started',
          priority: 'high',
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week
          category: 'legal',
          estimatedTime: '1-2 hours',
          dependencies: [2, 3]
        },
        { 
          id: 7, 
          task: "Submit rental application", 
          completed: false, 
          status: 'not_started',
          priority: 'critical',
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days
          category: 'application',
          estimatedTime: '45 minutes',
          dependencies: [3, 6]
        },
        { 
          id: 8, 
          task: "Pay application fee (if required)", 
          completed: false, 
          status: 'not_started',
          priority: 'high',
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days
          category: 'financial',
          estimatedTime: '15 minutes',
          dependencies: [7]
        },
        { 
          id: 9, 
          task: "Follow up on application status", 
          completed: false, 
          status: 'not_started',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks
          category: 'communication',
          estimatedTime: '15 minutes',
          dependencies: [7, 8]
        },
        { 
          id: 10, 
          task: "Secure renter's insurance", 
          completed: false, 
          status: 'not_started',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks
          category: 'insurance',
          estimatedTime: '1 hour'
        },
        { 
          id: 11, 
          task: "Plan move-in logistics", 
          completed: false, 
          status: 'not_started',
          priority: 'low',
          dueDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 weeks
          category: 'logistics',
          estimatedTime: '2-3 hours'
        }
      ];

      setAppliedRentals(prev => ({
        ...prev,
        [rentalKey]: {
          rental: rental,
          tasks: defaultTasks,
          appliedDate: new Date().toLocaleDateString(),
          status: 'interested',
          lastUpdated: new Date().toISOString()
        }
      }));
    }
  };

  // Function to toggle task completion with smart status progression
  const toggleTask = (rentalKey, taskId) => {
    setAppliedRentals(prev => {
      const rental = prev[rentalKey];
      const task = rental.tasks.find(t => t.id === taskId);
      
      // Check dependencies before allowing completion
      if (!task.completed && task.dependencies) {
        const uncompletedDeps = task.dependencies.filter(depId => 
          !rental.tasks.find(t => t.id === depId).completed
        );
        if (uncompletedDeps.length > 0) {
          alert('Please complete the prerequisite tasks first!');
          return prev;
        }
      }
      
      const newCompleted = !task.completed;
      let newStatus = task.status;
      
      if (newCompleted) {
        newStatus = 'completed';
      } else if (task.status === 'completed') {
        newStatus = 'in_progress';
      }
      
      const updatedTasks = rental.tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: newCompleted, status: newStatus, completedDate: newCompleted ? new Date().toISOString() : null }
          : t
      );
      
      // Update rental status based on progress
      const completedTasks = updatedTasks.filter(t => t.completed).length;
      const totalTasks = updatedTasks.length;
      let rentalStatus = 'interested';
      
      if (completedTasks === 0) rentalStatus = 'interested';
      else if (completedTasks < totalTasks * 0.5) rentalStatus = 'researching';
      else if (completedTasks < totalTasks * 0.8) rentalStatus = 'applying';
      else if (completedTasks === totalTasks) rentalStatus = 'completed';
      else rentalStatus = 'in_progress';
      
      return {
        ...prev,
        [rentalKey]: {
          ...rental,
          tasks: updatedTasks,
          status: rentalStatus,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };
  
  // Function to update task status (not started -> in progress -> completed)
  const updateTaskStatus = (rentalKey, taskId, newStatus) => {
    setAppliedRentals(prev => ({
      ...prev,
      [rentalKey]: {
        ...prev[rentalKey],
        tasks: prev[rentalKey].tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus }
            : task
        ),
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Function to remove a rental from applied list
  const removeAppliedRental = (rentalKey) => {
    setAppliedRentals(prev => {
      const newState = { ...prev };
      delete newState[rentalKey];
      return newState;
    });
  };
  
  // Helper function to check if task is overdue
  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };
  
  // Helper function to check if task is due soon (within 2 days)
  const isTaskDueSoon = (task) => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return dueDate <= twoDaysFromNow && dueDate >= now;
  };
  
  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'not_started': return '#6c757d';
      default: return '#6c757d';
    }
  };
  
  // Helper function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };
  
  // Get overall task analytics
  const getTaskAnalytics = () => {
    const allTasks = Object.values(appliedRentals).flatMap(rental => rental.tasks);
    const overdueTasks = allTasks.filter(isTaskOverdue);
    const dueSoonTasks = allTasks.filter(isTaskDueSoon);
    const completedTasks = allTasks.filter(task => task.completed);
    
    return {
      total: allTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      dueSoon: dueSoonTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length * 100).toFixed(1) : 0
    };
  };

  return (
    <div 
      className="main-app-container"
      style={{ 
        minHeight: '100vh', 
        width: '100%',
        margin: 0,
        padding: 0,
  backgroundColor: '#f5f5f5', 
        paddingBottom: '2rem',
        boxSizing: 'border-box',
        position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto'
      }}>
      
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '2rem',
        marginBottom: '2rem',
        width: '100%',
        padding: '2rem 1rem 2rem 1rem',
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 5
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
          marginBottom: '1.5rem', // Reduced from 2rem
          margin: '0 0 1.5rem 0'
        }}>
          Find your perfect rental near Virginia Tech
        </p>
      </div>

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Search Container */}
        <div 
          className="search-section content-section"
          style={{ 
            width: '100%',
            maxWidth: '100%',
            padding: 'clamp(1rem, 3vw, 2rem)', 
            backgroundColor: '#861f41', 
            borderRadius: '15px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginBottom: '2rem',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2
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
                  className="max-rent-input"
                  type="number"
                  placeholder="1500"
                  value={maxRent}
                  onChange={e => setMaxRent(e.target.value)}
                  style={{ 
                    width: '100%',
                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', 
                    padding: 'clamp(0.6rem, 1.2vw, 0.75rem) clamp(0.6rem, 1.2vw, 0.75rem) clamp(0.6rem, 1.2vw, 0.75rem) 2rem', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(255,255,255,0.7)', 
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'border-color 0.3s, background-color 0.3s',
                    boxSizing: 'border-box', 
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    caretColor: '#ffffff'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#ffffff';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.7)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  }}
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
                background: canSearch ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                color: canSearch ? '#861f41' : 'rgba(134, 31, 65, 0.6)',
                border: `2px solid ${canSearch ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}`,
                padding: 'clamp(0.8rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                borderRadius: '10px',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                cursor: canSearch && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px #333',
                transition: 'all 0.3s',
                minWidth: 'clamp(120px, 20vw, 150px)',
                flex: '1 1 auto',
                maxWidth: '200px'
              }}
              onMouseOver={e => {
                if (canSearch && !loading) {
                  e.target.style.backgroundColor = '#861f41';
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={e => {
                if (canSearch && !loading) {
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
              disabled={!canClear}
              style={{
                background: 'transparent',
                color: canClear ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                border: `2px solid ${canClear ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}`,
                padding: 'clamp(0.8rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                borderRadius: '10px',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                cursor: canClear ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px #333',
                transition: 'all 0.3s',
                flex: '1 1 auto',
                maxWidth: '200px'
              }}
              onMouseOver={e => {
                if (canClear) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#861f41';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              onMouseOut={e => {
                if (canClear) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }
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
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 1
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div 
            className="results-section content-section"
            style={{ 
              width: '100%',
              position: 'relative',
              zIndex: 1,
              marginBottom: '2rem'
            }}>
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
                return <RentalCard 
                  key={index} 
                  rental={rental} 
                  searchSpecificSites={searchSpecificSites} 
                  generateFallbackUrls={generateFallbackUrls}
                  onApply={() => handleApply(rental)}
                  isApplied={!!appliedRentals[`${rental.name_of_rental}_${rental.address}`]}
                />;
              })}
            </div>
          </div>
        )}

        {/* To-Do List Section */}
        {Object.keys(appliedRentals).length > 0 && (
          <div 
            className="todo-section content-section"
            style={{ 
              width: '100%', 
              marginTop: '3rem',
              position: 'relative',
              zIndex: 1,
              paddingTop: '2rem',
              borderTop: '2px solid #e9ecef'
            }}>
            <h3 style={{ 
              color: '#861f41', 
              marginBottom: '1.5rem', 
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              textAlign: 'center'
            }}>
              My Application To-Do List ({Object.keys(appliedRentals).length} Properties)
            </h3>
            
            {/* Dashboard Analytics */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '2px solid #861f41',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                  {getTaskAnalytics().completionRate}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Overall Progress</div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                  {getTaskAnalytics().completed}/{getTaskAnalytics().total}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Tasks Completed</div>
              </div>
              
              {getTaskAnalytics().overdue > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '2px solid #dc3545'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {getTaskAnalytics().overdue}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#dc3545', fontWeight: 'bold' }}>Overdue Tasks</div>
                </div>
              )}
              
              {getTaskAnalytics().dueSoon > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '2px solid #fd7e14'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd7e14' }}>
                    {getTaskAnalytics().dueSoon}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fd7e14', fontWeight: 'bold' }}>Due Soon</div>
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              width: '100%'
            }}>
              {Object.entries(appliedRentals).map(([rentalKey, data]) => (
                <ToDoCard 
                  key={rentalKey}
                  rentalKey={rentalKey}
                  data={data}
                  onToggleTask={(taskId) => toggleTask(rentalKey, taskId)}
                  onRemove={() => removeAppliedRental(rentalKey)}
                  updateTaskStatus={updateTaskStatus}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Updated RentalCard component with Apply button
function RentalCard({ rental, searchSpecificSites, generateFallbackUrls, onApply, isApplied }) {
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
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Property Info */}
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
      
      {/* Property Details */}
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
      
      {/* Site Links Section */}
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

      {/* Apply Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: 'auto',
        paddingTop: '1rem'
      }}>
        <button
          onClick={onApply}
          disabled={isApplied}
          style={{
            background: isApplied ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
            color: isApplied ? '#ffffff' : '#861f41',
            border: '2px solid #ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
            cursor: isApplied ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          {isApplied ? '✓ Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
}

// New ToDoCard component
function ToDoCard({ rentalKey, data, onToggleTask, onRemove, updateTaskStatus }) {
  const completedTasks = data.tasks.filter(task => task.completed).length;
  const totalTasks = data.tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  
  // Helper functions for the component
  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };
  
  const isTaskDueSoon = (task) => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return dueDate <= twoDaysFromNow && dueDate >= now;
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'not_started': return '#6c757d';
      default: return '#6c757d';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };
  
  // Get status badge for rental
  const getStatusBadge = (status) => {
    const statusConfig = {
      'interested': { color: '#6c757d', label: '👀 Interested' },
      'researching': { color: '#17a2b8', label: '🔍 Researching' },
      'applying': { color: '#fd7e14', label: '📝 Applying' },
      'in_progress': { color: '#007bff', label: '⏳ In Progress' },
      'completed': { color: '#28a745', label: '✅ Complete' }
    };
    
    const config = statusConfig[status] || statusConfig['interested'];
    return (
      <span style={{
        backgroundColor: config.color,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {config.label}
      </span>
    );
  };
  
  // Sort tasks by priority and due date
  const sortedTasks = [...data.tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed !== b.completed) return a.completed - b.completed;
    
    // Sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const aPriority = priorityOrder[a.priority] ?? 4;
    const bPriority = priorityOrder[b.priority] ?? 4;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Sort by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    
    return a.id - b.id;
  });

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '2px solid #861f41',
      borderRadius: '15px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h4 style={{ 
              color: '#861f41', 
              margin: 0,
              fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
              wordBreak: 'break-word'
            }}>
              {data.rental.name_of_rental}
            </h4>
            {getStatusBadge(data.status)}
          </div>
          <p style={{ 
            color: '#666', 
            margin: '0 0 0.5rem 0',
            fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
            wordBreak: 'break-word'
          }}>
            📍 {data.rental.address}
          </p>
          <p style={{ 
            color: '#888', 
            margin: 0,
            fontSize: 'clamp(0.8rem, 1vw, 0.9rem)'
          }}>
            Applied: {data.appliedDate} • Last updated: {formatDate(data.lastUpdated)}
          </p>
        </div>
        
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            color: '#dc3545',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseOver={e => {
            e.target.style.backgroundColor = '#dc3545';
            e.target.style.color = '#ffffff';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#dc3545';
          }}
        >
          Remove
        </button>
      </div>

      {/* Progress Bar with Analytics */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ 
            color: '#861f41', 
            fontWeight: 'bold',
            fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
          }}>
            Progress: {completedTasks}/{totalTasks} tasks completed
          </span>
          <span style={{ 
            color: '#861f41', 
            fontWeight: 'bold',
            fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
          }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: progressPercentage === 100 ? '#28a745' : progressPercentage > 70 ? '#fd7e14' : '#007bff',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
        
        {/* Task Summary */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '0.75rem', 
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}>
          {data.tasks.filter(isTaskOverdue).length > 0 && (
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              ⚠️ {data.tasks.filter(isTaskOverdue).length} overdue
            </span>
          )}
          {data.tasks.filter(isTaskDueSoon).length > 0 && (
            <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>
              🔔 {data.tasks.filter(isTaskDueSoon).length} due soon
            </span>
          )}
          <span style={{ color: '#6c757d' }}>
            📈 {data.tasks.filter(t => t.status === 'in_progress').length} in progress
          </span>
        </div>
      </div>

      {/* Enhanced Task List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '0.75rem'
      }}>
        {sortedTasks.map(task => {
          const overdue = isTaskOverdue(task);
          const dueSoon = isTaskDueSoon(task);
          const dependencyLabels = (task.dependencies || []).map(depId => {
            const depTask = data.tasks.find(t => t.id === depId);
            return depTask ? depTask.task : `Task ${depId}`;
          });
          
          return (
            <div
              key={task.id}
              className={`task-card-hover ${overdue ? 'task-overdue' : dueSoon ? 'task-due-soon' : ''} task-priority-${task.priority}`}
              style={{
                padding: '1rem',
                backgroundColor: task.completed ? '#f8f9fa' : '#ffffff',
                border: `2px solid ${
                  task.completed ? '#28a745' : 
                  overdue ? '#dc3545' : 
                  dueSoon ? '#fd7e14' : 
                  '#ffffff'
                }`,
                borderRadius: '10px',
                transition: 'all 0.3s',
                position: 'relative'
              }}
            >
              {/* Priority & Status Indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getPriorityColor(task.priority)
                  }} />
                  <span style={{
                    fontSize: '0.7rem',
                    color: getPriorityColor(task.priority),
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {task.priority}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: getStatusColor(task.status),
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.estimatedTime && (
                    <span style={{
                      fontSize: '0.7rem',
                      color: '#6c757d',
                      fontStyle: 'italic'
                    }}>
                      ⏱️ {task.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Task Content */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${task.completed ? '#28a745' : getStatusColor(task.status)}`,
                    backgroundColor: task.completed ? '#28a745' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  onClick={() => onToggleTask(task.id)}
                >
                  {task.completed && (
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <span style={{
                    color: task.completed ? '#6c757d' : '#333',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                    fontWeight: task.completed ? 'normal' : '500',
                    display: 'block',
                    marginBottom: '0.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => onToggleTask(task.id)}
                  >
                    {task.task}
                  </span>
                  
                  {/* Due Date */}
                  {task.dueDate && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: overdue ? '#dc3545' : dueSoon ? '#fd7e14' : '#6c757d',
                        fontWeight: overdue || dueSoon ? 'bold' : 'normal'
                      }}>
                        📅 Due: {formatDate(task.dueDate)}
                        {overdue && ' (OVERDUE)'}
                        {dueSoon && !overdue && ' (Due Soon)'}
                      </span>
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  {task.category && (
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#ffffff',
                      color: '#495057',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      marginTop: '0.5rem'
                    }}>
                      {task.category}
                    </span>
                  )}

                  {dependencyLabels.length > 0 && (
                    <div style={{
                      marginTop: '0.5rem',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      padding: '0.4rem 0.6rem',
                      border: '1px solid #dc3545'
                    }}>
                      <span style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: '#dc3545',
                        marginBottom: dependencyLabels.length > 1 ? '0.25rem' : '0'
                      }}>
                        Prerequisite{dependencyLabels.length > 1 ? 's' : ''}:
                      </span>
                      <ol style={{
                        margin: 0,
                        paddingLeft: '1.1rem',
                        fontSize: '0.7rem',
                        color: '#6c757d'
                      }}>
                        {dependencyLabels.map((label, index) => (
                          <li key={`${task.id}-dep-${index}`} style={{ marginBottom: index === dependencyLabels.length - 1 ? 0 : '0.2rem' }}>
                            {label}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Change Buttons */}
              {!task.completed && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  {task.status === 'not_started' && (
                    <button
                      onClick={() => updateTaskStatus(rentalKey, task.id, 'in_progress')}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTaskStatus(rentalKey, task.id, 'not_started')}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      Pause Task
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;