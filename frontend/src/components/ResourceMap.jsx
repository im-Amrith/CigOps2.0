import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl, ScaleControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ResourceMap.css'; // We'll create this CSS file
// Import marker cluster components and styles
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icon
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Import custom marker icons
import clinicIconUrl from '../assets/clinic-marker.svg';
import doctorIconUrl from '../assets/doctor-marker.svg';
import rehabIconUrl from '../assets/rehab-marker.svg';
import userLocationIconUrl from '../assets/user-location.svg';
import favoriteIconUrl from '../assets/favorite-marker.svg';

// Import icons for UI
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaMapMarkerAlt, 
  FaList, 
  FaThLarge, 
  FaShare, 
  FaHeart, 
  FaRegHeart, 
  FaDirections, 
  FaSave, 
  FaTimes, 
  FaPhone, 
  FaGlobe, 
  FaClock, 
  FaUserMd, 
  FaInfoCircle,
  FaMoon,
  FaSun,
  FaSlidersH,
  FaExpand,
  FaCompress,
  FaStar,
  FaStarHalfAlt,
  FaRegStar
} from 'react-icons/fa';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom Hook to get map instance for panning
function MapControls({ mapRef, onMapMove }) {
  const map = useMap();
  
  // Update mapRef when map instance is available
  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
    // No cleanup needed for ref assignment
  }, [map, mapRef]);

  // Listen for map move events
  useMapEvents({
    moveend: () => {
      if (onMapMove) {
        onMapMove(map.getCenter(), map.getZoom());
      }
    }
  });

  return null;
}

// Function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Format distance for display
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

// Custom map control for radius filter
function RadiusControl({ radius, setRadius, userLocation }) {
  const map = useMap();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="leaflet-control leaflet-bar radius-control">
      <button 
        className="radius-control-button" 
        onClick={toggleExpand}
        title="Set search radius"
      >
        <FaSlidersH />
      </button>
      {isExpanded && (
        <div className="radius-control-panel">
          <div className="radius-control-header">
            <h4>Search Radius</h4>
            <button onClick={toggleExpand} className="close-radius-control">
              <FaTimes />
            </button>
          </div>
          <div className="radius-control-content">
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={radius} 
              onChange={handleRadiusChange} 
              className="radius-slider"
            />
            <div className="radius-value">{radius} km</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom map control for view toggle
function ViewToggleControl({ viewMode, setViewMode }) {
  return (
    <div className="leaflet-control leaflet-bar view-toggle-control">
      <button 
        className={viewMode === 'list' ? 'active' : ''} 
        onClick={() => setViewMode('list')}
        title="List view"
      >
        <FaList />
      </button>
      <button 
        className={viewMode === 'grid' ? 'active' : ''} 
        onClick={() => setViewMode('grid')}
        title="Grid view"
      >
        <FaThLarge />
      </button>
    </div>
  );
}

// Custom map control for fullscreen toggle
function FullscreenControl() {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  return (
    <div className="leaflet-control leaflet-bar fullscreen-control">
      <button 
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
      </button>
    </div>
  );
}

function ResourceMap({ userLocation }) {
  const [displayedResources, setDisplayedResources] = useState([]); // Start with empty array
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Keep loading state for search simulation
  const [mapLoading, setMapLoading] = useState(true);
  const searchResultsRef = useRef(null);
  const mapRef = useRef(null); // Ref to access map instance
  const [filterType, setFilterType] = useState('All'); // State for filtering by type
  const [highlightedResourceId, setHighlightedResourceId] = useState(null); // State to track highlighted marker
  const [sortBy, setSortBy] = useState('distance'); // New state for sorting
  const [showUserLocation, setShowUserLocation] = useState(true); // New state for toggling user location
  const [hoveredResourceId, setHoveredResourceId] = useState(null); // New state to track hovered resource
  const [error, setError] = useState(null); // New state for storing API errors
  
  // New states for enhanced features
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle
  const [radius, setRadius] = useState(10); // Radius filter in km
  const [favorites, setFavorites] = useState([]); // Favorites list
  const [viewMode, setViewMode] = useState('list'); // List or grid view
  const [activeTab, setActiveTab] = useState('info'); // Active tab in details panel
  const [mapCenter, setMapCenter] = useState(null); // Current map center
  const [mapZoom, setMapZoom] = useState(null); // Current map zoom level
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
  const [showFilters, setShowFilters] = useState(false); // Show/hide filters panel
  const [showShareModal, setShowShareModal] = useState(false); // Show/hide share modal
  const [shareUrl, setShareUrl] = useState(''); // URL to share

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('resourceFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('resourceFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Handle map move events
  const handleMapMove = useCallback((center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  // Calculate distances when user location changes
  useEffect(() => {
    if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
      const resourcesWithDistance = displayedResources.map(resource => ({
        ...resource,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          resource.latitude,
          resource.longitude
        )
      }));
      
      // Sort by distance
      const sortedResources = [...resourcesWithDistance].sort((a, b) => a.distance - b.distance);
      setDisplayedResources(sortedResources);
    }
  }, [userLocation, displayedResources]);

  // Fetch resources based on search query and filter type
  useEffect(() => {
    const fetchResources = async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        setSelectedResource(null); // Clear selection on new search/filter
        setHighlightedResourceId(null); // Clear highlight

        try {
            // Construct query parameters
            const params = new URLSearchParams();
            if (searchQuery) {
                params.append('query', searchQuery);
            }
            if (filterType !== 'All') {
                params.append('type', filterType);
            }
            // Add user location for distance calculation if available
            if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
                 params.append('latitude', userLocation.latitude.toString());
                 params.append('longitude', userLocation.longitude.toString());
                 params.append('radius', radius.toString()); // Add radius parameter
             }

            // Make API call
            const response = await fetch(`/api/resources/search?${params.toString()}`);
            
            if (!response.ok) {
                // Handle non-OK responses
                console.error('API Error:', response.status, response.statusText);
                setError(`Error fetching resources: ${response.status} ${response.statusText}`); // Set user-friendly error message
                setDisplayedResources([]); // Clear resources on error
            }

            const data = await response.json();

            // Apply client-side sorting if needed (e.g., if backend doesn't sort)
            let sortedData = data;
             if (sortBy === 'distance' && userLocation) {
                sortedData = data.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
             } else if (sortBy === 'rating') {
                 sortedData = data.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
             } else if (sortBy === 'name') {
                 sortedData = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
             }

            setDisplayedResources(sortedData); // Update state with fetched and sorted data
        } catch (error) {
            console.error('Fetching resources failed:', error);
            setDisplayedResources([]); // Clear resources on error
             // Optionally set an error message state to display to the user
        } finally {
            setLoading(false);
        }
    };

    // Only fetch if query or filter changes, or user location becomes available
    fetchResources();

  }, [searchQuery, filterType, userLocation, sortBy, radius]); // Depend on search query, filter type, user location, sort preference, and radius

  // Effect to handle clicks outside the search results to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setSearchQuery(''); // Clearing query also hides the list
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResultsRef, setSearchQuery]);

  // Set default center to user location or a default if location is not available
  const center = useMemo(() => {
    return (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number')
      ? [userLocation.latitude, userLocation.longitude]
      : [37.0902, -95.7129]; // Center of the US as a default if user location is unavailable
  }, [userLocation]);

  const handleMarkerClick = (resource) => {
      setSelectedResource(resource);
      setHighlightedResourceId(resource.id); // Highlight the clicked marker
      setHoveredResourceId(null); // Clear hover state on click
      // Pan map to marker location
      if (mapRef.current && typeof resource.latitude === 'number' && typeof resource.longitude === 'number') {
          mapRef.current.setView([resource.latitude, resource.longitude], mapRef.current.getZoom() || 13); // Set a default zoom if none is available
      }
  };

  const handleCloseDetails = () => {
      setSelectedResource(null);
      setHighlightedResourceId(null); // Remove highlight when closing details
      setHoveredResourceId(null); // Clear hover state
  };

  const handleResultClick = (resource) => {
      setSelectedResource(resource);
      setHighlightedResourceId(resource.id); // Highlight the selected result's marker
      setHoveredResourceId(null); // Clear hover state on click
      // Pan the map to the selected resource's location when clicking the list item
      if (mapRef.current && typeof resource.latitude === 'number' && typeof resource.longitude === 'number') {
          mapRef.current.setView([resource.latitude, resource.longitude], mapRef.current.getZoom() || 13);
      }
      setSearchQuery(''); // Clear search query after clicking a result
  };

  // Toggle favorite status
  const toggleFavorite = (resourceId) => {
    if (favorites.includes(resourceId)) {
      setFavorites(favorites.filter(id => id !== resourceId));
    } else {
      setFavorites([...favorites, resourceId]);
    }
  };

  // Check if a resource is favorited
  const isFavorited = (resourceId) => {
    return favorites.includes(resourceId);
  };

  // Generate share URL
  const generateShareUrl = (resource) => {
    if (!resource) return '';
    
    const baseUrl = window.location.origin;
    const resourcePath = `/resources/${resource.id}`;
    return `${baseUrl}${resourcePath}`;
  };

  // Handle share button click
  const handleShare = (resource) => {
    const url = generateShareUrl(resource);
    setShareUrl(url);
    setShowShareModal(true);
    
    // If Web Share API is available, use it
    if (navigator.share) {
      navigator.share({
        title: resource.name,
        text: `Check out ${resource.name} on our resource locator!`,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  };

  // Function to create custom icon based on resource type
  const createCustomIcon = (type, isFavorited = false) => {
      let iconUrl = '';
      // Use different icon images for each type
      switch (type) {
          case 'Clinic': iconUrl = clinicIconUrl; break;
          case 'Doctor': iconUrl = doctorIconUrl; break;
          case 'Rehab Center': iconUrl = rehabIconUrl; break;
          default: iconUrl = L.Icon.Default.prototype.options.iconUrl; // Default Leaflet icon
      }

      // If favorited, add a small heart icon overlay
      if (isFavorited) {
          return new L.DivIcon({
              html: `<div class="custom-marker favorited">
                      <img src="${iconUrl}" alt="${type}" />
                      <div class="favorite-badge"><i class="fas fa-heart"></i></div>
                    </div>`,
              className: 'custom-marker-container',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
          });
      }

      return new L.Icon({
          iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
          shadowUrl: shadowUrl,
          shadowSize: [41, 41],
          shadowAnchor: [20, 41]
      });
  };

  // Function to create user location icon
  const createUserLocationIcon = () => {
      return new L.Icon({
          iconUrl: userLocationIconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
          shadowUrl: shadowUrl,
          shadowSize: [41, 41],
          shadowAnchor: [20, 41]
      });
  };

  // Function to create custom cluster icons
  const createClusterCustomIcon = (cluster) => {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count > 10) size = 'medium';
      if (count > 50) size = 'large';

      return new L.DivIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: new L.Point(40, 40),
      });
  };

  // Handle map loading state
  const handleMapLoad = () => {
      setMapLoading(false);
  };

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star full" />
        ))}
        {hasHalfStar && <FaStarHalfAlt key="half" className="star half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star empty" />
        ))}
        <span className="rating-value">{rating}</span>
      </div>
    );
  };

  return (
    <div className={`resource-map-container ${darkMode ? 'dark-mode' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* Dark Mode Toggle */}
        <button 
          className="dark-mode-toggle" 
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Filters Toggle Button */}
        <button 
          className="filters-toggle" 
          onClick={() => setShowFilters(!showFilters)}
          title={showFilters ? "Hide filters" : "Show filters"}
        >
          <FaFilter />
        </button>

        <div className={`map-controls-panel ${showFilters ? 'visible' : 'hidden'}`}>
             <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search clinics, doctors, rehabs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                 {loading && (
                     <div className="loading-indicator">
                         <div className="spinner"></div>
                         <span>Loading...</span>
                     </div>
                 )}
            </div>

            <div className="filter-buttons">
                 <button className={filterType === 'All' ? 'active' : ''} onClick={() => setFilterType('All')}>All</button>
                 <button className={filterType === 'Clinic' ? 'active' : ''} onClick={() => setFilterType('Clinic')}>Clinics</button>
                 <button className={filterType === 'Doctor' ? 'active' : ''} onClick={() => setFilterType('Doctor')}>Doctors</button>
                 <button className={filterType === 'Rehab Center' ? 'active' : ''} onClick={() => setFilterType('Rehab Center')}>Rehabs</button>
            </div>

            <div className="sort-options">
                <label><FaSort /> Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                </select>
            </div>

            <div className="radius-filter">
                <label>Search Radius: {radius} km</label>
                <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={radius} 
                    onChange={(e) => setRadius(parseInt(e.target.value))} 
                    className="radius-slider"
                />
            </div>

      {userLocation && (
                <div className="user-location-toggle">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={showUserLocation} 
                            onChange={() => setShowUserLocation(!showUserLocation)} 
                        />
                        <FaMapMarkerAlt /> Show my location
                    </label>
                </div>
            )}

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
                <label>View Mode:</label>
                <div className="view-mode-buttons">
                    <button 
                        className={viewMode === 'list' ? 'active' : ''} 
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        <FaList />
                    </button>
                    <button 
                        className={viewMode === 'grid' ? 'active' : ''} 
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                    >
                        <FaThLarge />
                    </button>
                </div>
            </div>

            {/* Add Recenter Button */}
            {userLocation && mapRef.current && (
                <button
                    className="action-button recenter-map"
                    onClick={() => {
                        if (mapRef.current && userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
                            mapRef.current.setView([userLocation.latitude, userLocation.longitude], mapRef.current.getZoom() || 13);
                        }
                    }}
                >
                    <FaMapMarkerAlt /> Recenter Map
                </button>
            )}

            {/* Search Results List - show only if query is not empty and not loading */}
            {searchQuery && !loading && displayedResources.length > 0 && (
                <div className={`search-results-list ${viewMode}`} ref={searchResultsRef}>
                    <h4>Matching Resources</h4>
                    {viewMode === 'list' ? (
                        <ul>
                            {displayedResources.map((resource) => (
                                <li
                                    key={resource.id}
                                    onClick={(e) => {
                                        handleResultClick(resource);
                                        e.currentTarget.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'nearest'
                                        });
                                    }}
                                    className={`${resource.id === highlightedResourceId ? 'highlighted' : ''} ${resource.id === hoveredResourceId ? 'hovered' : ''}`}
                                    onMouseEnter={() => setHoveredResourceId(resource.id)}
                                    onMouseLeave={() => setHoveredResourceId(null)}
                                >
                                    <div className="result-header">
                                        <strong>{resource.name}</strong>
                                        <span className="resource-type">{resource.type}</span>
                                    </div>
                                    <p className="result-address">{resource.address}</p>
                                    {resource.distance && (
                                        <p className="result-distance">
                                            <FaMapMarkerAlt /> {formatDistance(resource.distance)}
                                        </p>
                                    )}
                                    {resource.rating && (
                                        <div className="result-rating">
                                            {renderStars(parseFloat(resource.rating))}
                                        </div>
                                    )}
                                    <button 
                                        className={`favorite-button ${isFavorited(resource.id) ? 'favorited' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(resource.id);
                                        }}
                                    >
                                        {isFavorited(resource.id) ? <FaHeart /> : <FaRegHeart />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="grid-view">
                            {displayedResources.map((resource) => (
                                <div 
                                    key={resource.id}
                                    className={`grid-item ${resource.id === highlightedResourceId ? 'highlighted' : ''} ${resource.id === hoveredResourceId ? 'hovered' : ''}`}
                                    onClick={() => handleResultClick(resource)}
                                    onMouseEnter={() => setHoveredResourceId(resource.id)}
                                    onMouseLeave={() => setHoveredResourceId(null)}
                                >
                                    <div className="grid-item-header">
                                        <h4>{resource.name}</h4>
                                        <span className="resource-type">{resource.type}</span>
                                    </div>
                                    <p className="grid-item-address">{resource.address}</p>
                                    {resource.distance && (
                                        <p className="grid-item-distance">
                                            <FaMapMarkerAlt /> {formatDistance(resource.distance)}
                                        </p>
                                    )}
                                    {resource.rating && (
                                        <div className="grid-item-rating">
                                            {renderStars(parseFloat(resource.rating))}
                                        </div>
                                    )}
                                    <button 
                                        className={`favorite-button ${isFavorited(resource.id) ? 'favorited' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(resource.id);
                                        }}
                                    >
                                        {isFavorited(resource.id) ? <FaHeart /> : <FaRegHeart />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {searchQuery && !loading && displayedResources.length === 0 && (
                <div className="search-results-list" ref={searchResultsRef}>
                    <p>No results found for "{searchQuery}".</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>

        <MapContainer 
            center={center} 
            zoom={userLocation ? 13 : 5} 
            style={{ height: '100%', width: '100%', borderRadius: '8px' }} 
            ref={mapRef} 
            whenReady={handleMapLoad}
            zoomControl={false} // Disable default zoom control to use custom one
        >
            {/* Add MapControls component to get map instance */}
            <MapControls mapRef={mapRef} onMapMove={handleMapMove} />
            
            {/* Custom Controls */}
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />
            <RadiusControl radius={radius} setRadius={setRadius} userLocation={userLocation} />
            <ViewToggleControl viewMode={viewMode} setViewMode={setViewMode} />
            <FullscreenControl />
            
            {/* Tile Layer - Use different tile for dark mode */}
            <TileLayer
                url={darkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution={darkMode 
                    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
                    : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }
            />
            
            {/* Render user location marker only if userLocation and its coordinates are valid */}
            {showUserLocation && userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' && (
                <>
                    <Marker 
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={createUserLocationIcon()}
                    >
          <Popup>
                            <div className="user-location-popup">
                                <h4>Your Location</h4>
                                <p>Lat: {userLocation.latitude.toFixed(4)}, Lon: {userLocation.longitude.toFixed(4)}</p>
                            </div>
                        </Popup>
                    </Marker>
                    <Circle 
                        center={[userLocation.latitude, userLocation.longitude]} 
                        radius={radius * 1000} // Convert km to meters
                        pathOptions={{ 
                            color: darkMode ? '#4a90e2' : 'blue', 
                            fillColor: darkMode ? '#4a90e2' : 'blue', 
                            fillOpacity: 0.1 
                        }}
                    />
                </>
            )}
            
            {/* Marker Clustering for Resources */}
            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterCustomIcon}
                maxClusterRadius={50}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={true}
                zoomToBoundsOnClick={true}
            >
                {Array.isArray(displayedResources) && displayedResources.map((resource) => (
                    (resource && typeof resource.latitude === 'number' && typeof resource.longitude === 'number') ? (
                        <Marker
                            key={resource.id}
                            position={[resource.latitude, resource.longitude]}
                            eventHandlers={{
                                click: () => handleMarkerClick(resource),
                                mouseover: () => setHoveredResourceId(resource.id),
                                mouseout: () => setHoveredResourceId(null),
                            }}
                            icon={createCustomIcon(resource.type, isFavorited(resource.id))}
                            className={`${resource.id === highlightedResourceId ? 'highlighted' : ''} ${resource.id === hoveredResourceId ? 'hovered' : ''}`}
                        >
                            <Popup>
                                <div className="marker-popup">
                                    <h4>{resource.name}</h4>
                                    <p>{resource.type}</p>
                                    {resource.distance && (
                                        <p className="popup-distance">
                                            <FaMapMarkerAlt /> {formatDistance(resource.distance)}
                                        </p>
                                    )}
                                    {resource.rating && (
                                        <div className="popup-rating">
                                            {renderStars(parseFloat(resource.rating))}
                                        </div>
                                    )}
                                    <div className="popup-actions">
                                        <button 
                                            className="view-details-btn"
                                            onClick={() => handleMarkerClick(resource)}
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            className={`favorite-btn ${isFavorited(resource.id) ? 'favorited' : ''}`}
                                            onClick={() => toggleFavorite(resource.id)}
                                        >
                                            {isFavorited(resource.id) ? <FaHeart /> : <FaRegHeart />}
                                        </button>
                                    </div>
                                </div>
          </Popup>
        </Marker>
                    ) : null
      ))}
            </MarkerClusterGroup>
    </MapContainer>

        {/* Resource Details Panel - Enhanced with Tabs */}
        {selectedResource && (
            <div className="resource-details-panel active">
                <button onClick={handleCloseDetails} className="close-button">
                    <FaTimes />
                </button>
                
                <div className="details-header">
                    <h3>{selectedResource.name}</h3>
                    <span className="resource-type-badge">{selectedResource.type}</span>
                </div>
                
                {selectedResource.rating && (
                    <div className="rating-display">
                        {renderStars(parseFloat(selectedResource.rating))}
                    </div>
                )}
                
                {selectedResource.distance && (
                    <p className="distance-display">
                        <FaMapMarkerAlt /> {formatDistance(selectedResource.distance)} away
                    </p>
                )}
                
                <p className="address-display">
                    <FaMapMarkerAlt /> {selectedResource.address}
                </p>

                {/* Tabs Navigation */}
                <div className="details-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <FaInfoCircle /> Info
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <FaPhone /> Contact
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <FaUserMd /> Services
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div className="tab-pane">
                            {selectedResource.description && (
                                <div className="details-section">
                                    <h4>Description</h4>
                                    <p>{selectedResource.description}</p>
                                </div>
                            )}

                            {/* Hours and Other Info Section */}
                            {(selectedResource.hours || selectedResource.insurance || selectedResource.doctors > 0) && (
                                <div className="details-section">
                                    <h4>Additional Information</h4>
                                    {selectedResource.hours && (
                                        <p>
                                            <FaClock /> <strong>Hours:</strong> {selectedResource.hours}
                                        </p>
                                    )}
                                    {selectedResource.insurance && (
                                        <p>
                                            <FaInfoCircle /> <strong>Insurance:</strong> {selectedResource.insurance}
                                        </p>
                                    )}
                                    {selectedResource.doctors > 0 && (
                                        <p>
                                            <FaUserMd /> <strong>Doctors on Staff:</strong> {selectedResource.doctors}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div className="tab-pane">
                            {(selectedResource.phone || selectedResource.website) && (
                                <div className="details-section">
                                    <h4>Contact Information</h4>
                                    {selectedResource.phone && (
                                        <p>
                                            <FaPhone /> <strong>Phone:</strong> <a href={`tel:${selectedResource.phone}`}>{selectedResource.phone}</a>
                                        </p>
                                    )}
                                    {selectedResource.website && (
                                        <p>
                                            <FaGlobe /> <strong>Website:</strong> <a href={selectedResource.website} target="_blank" rel="noopener noreferrer">{selectedResource.website}</a>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="tab-pane">
                            {selectedResource.services && selectedResource.services.length > 0 && (
                                <div className="details-section">
                                    <h4>Services Offered</h4>
                                    <ul>
                                        {selectedResource.services.map((service, index) => (
                                            <li key={index}>
                                                <FaUserMd /> {service}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="details-actions">
                    <button 
                        className="action-button directions" 
                        onClick={() => {
                            if (userLocation && selectedResource) {
                                const origin = `${userLocation.latitude},${userLocation.longitude}`;
                                const destination = `${selectedResource.latitude},${selectedResource.longitude}`;
                                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
                                window.open(googleMapsUrl, '_blank');
                            } else if (selectedResource) {
                                const destination = `${selectedResource.latitude},${selectedResource.longitude}`;
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
                                window.open(googleMapsUrl, '_blank');
                            }
                        }}
                    >
                        <FaDirections /> Get Directions
                    </button>
                    <button 
                        className="action-button share" 
                        onClick={() => handleShare(selectedResource)}
                    >
                        <FaShare /> Share
                    </button>
                    <button 
                        className={`action-button favorite ${isFavorited(selectedResource.id) ? 'favorited' : ''}`} 
                        onClick={() => toggleFavorite(selectedResource.id)}
                    >
                        {isFavorited(selectedResource.id) ? <FaHeart /> : <FaRegHeart />} 
                        {isFavorited(selectedResource.id) ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
            <div className="share-modal-overlay">
                <div className="share-modal">
                    <button 
                        className="close-modal-button" 
                        onClick={() => setShowShareModal(false)}
                    >
                        <FaTimes />
                    </button>
                    <h3>Share Resource</h3>
                    <p>Share this resource with others:</p>
                    <div className="share-url-container">
                        <input 
                            type="text" 
                            value={shareUrl} 
                            readOnly 
                            className="share-url-input"
                        />
                        <button 
                            className="copy-url-button" 
                            onClick={copyShareUrl}
                        >
                            Copy
                        </button>
                    </div>
                    <div className="social-share-buttons">
                        <button className="social-share facebook">
                            Facebook
                        </button>
                        <button className="social-share twitter">
                            Twitter
                        </button>
                        <button className="social-share email">
                            Email
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default ResourceMap; 