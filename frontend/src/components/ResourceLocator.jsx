import React, { useState, useEffect, useRef } from 'react';
import { searchResources } from '../api';
import ResourceMap from './ResourceMap';
import './ResourceLocator.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaSort, FaList, FaThLarge, FaHeart, FaRegHeart, FaShare, FaDirections, FaPhone, FaGlobe, FaClock, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useLocalStorage } from 'react-use';
import Confetti from 'react-confetti';

function ResourceLocator() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'name', 'rating'
  const [filterType, setFilterType] = useState('all'); // 'all', 'clinic', 'doctor', 'rehab', etc.
  const [selectedResource, setSelectedResource] = useState(null);
  const [favorites, setFavorites] = useLocalStorage('resource-favorites', []);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [radius, setRadius] = useState(10); // km
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);

  // Animation for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Animation for child elements
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  // Spring animation for the search bar
  const searchBarSpring = useSpring({
    from: { y: -50, opacity: 0 },
    to: { y: 0, opacity: 1 },
    config: { tension: 300, friction: 20 }
  });

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get your location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (!userLocation) {
      setError("Please allow location access to search for resources.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchResources(userLocation.latitude, userLocation.longitude, searchQuery);
      setResources(results);
      
      // Show confetti if this is the first search
      if (resources.length === 0 && results.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      setError("Error searching for resources: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFavorite = (resourceId) => {
    if (favorites.includes(resourceId)) {
      setFavorites(favorites.filter(id => id !== resourceId));
    } else {
      setFavorites([...favorites, resourceId]);
      // Show confetti when adding to favorites
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const isFavorited = (resourceId) => {
    return favorites.includes(resourceId);
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    // If in map view, center the map on the selected resource
    if (viewMode === 'map' && mapRef.current) {
      mapRef.current.flyTo([resource.latitude, resource.longitude], 15);
    }
  };

  const handleCloseDetails = () => {
    setSelectedResource(null);
  };

  const handleShare = (resource) => {
    const url = `${window.location.origin}/resources/${resource.id}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    // Show a toast or notification that URL was copied
    alert('Link copied to clipboard!');
  };

  const sortedAndFilteredResources = () => {
    let filtered = [...resources];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.type === filterType);
    }
    
    // Apply radius filter
    filtered = filtered.filter(resource => resource.distance_km <= radius);
    
    // Apply sorting
    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => a.distance_km - b.distance_km);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  return (
    <motion.div 
      className="resource-locator-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Tactical Hero Section */}
      <animated.div 
        className="tactical-hero"
        style={searchBarSpring}
      >
        <div className="geolocation-status">
          <span className="status-text">GEOLOCATION: ACTIVE</span>
          <span className="status-indicator"></span>
        </div>
        
        <h1 className="tactical-title">
          <span className="tactical-title-white">TACTICAL </span>
          <span className="tactical-title-orange">SUPPORT </span>
          <span className="tactical-title-white">RADAR</span>
        </h1>
        
        <p className="tactical-subtitle">
          Scanning local nodes for clinical intervention, CBT specialized hubs, and peer-to-peer synchronization points.
        </p>
        
        <div className="tactical-search-row">
          <div className="tactical-search-input-wrapper">
            <FaSearch className="tactical-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search clinics, pharmacies, support groups..."
              className="tactical-search-input"
            />
            {searchQuery && (
              <button 
                className="tactical-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="tactical-sync-button"
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FaMapMarkerAlt className="sync-icon" />
                <span>SYNC AREA</span>
              </>
            )}
          </button>
        </div>
      </animated.div>

      {/* View Controls */}
      <div className="search-bar">
        <div className="view-controls">
          <button 
            className={`view-control-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Map View"
          >
            <FaMapMarkerAlt />
          </button>
          <button 
            className={`view-control-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <FaList />
          </button>
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaInfoCircle className="error-icon" />
            <span>{error}</span>
            <button 
              className="error-close-btn"
              onClick={() => setError(null)}
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                className="close-filters-btn"
                onClick={() => setShowFilters(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="filters-content">
              <div className="filter-group">
                <label>Sort By:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="distance">Distance</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Type:</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="clinic">Clinics</option>
                  <option value="doctor">Doctors</option>
                  <option value="rehab">Rehab Centers</option>
                  <option value="support">Support Groups</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Radius: {radius} km</label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="radius-slider"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Map View */}
        {viewMode === 'map' && (
          <motion.div 
            className="map-container"
            variants={itemVariants}
          >
        {userLocation ? (
              <ResourceMap 
                resources={resources} 
                userLocation={userLocation} 
                ref={mapRef}
                selectedResource={selectedResource}
                onResourceSelect={handleResourceClick}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                radius={radius}
                filterType={filterType}
              />
            ) : (
              <div className="loading-location">
                <div className="loading-spinner"></div>
                <p>Getting your location...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Results */}
        <motion.div 
          className="results-container"
          variants={itemVariants}
        >
          {resources.length > 0 ? (
            <div className={`resources-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {sortedAndFilteredResources().map((resource, index) => (
                <motion.div 
                  key={resource.id || index} 
                  className={`resource-card ${selectedResource?.id === resource.id ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleResourceClick(resource)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="resource-card-header">
                    <h3 className="resource-name">{resource.name}</h3>
                    <button 
                      className="favorite-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(resource.id);
                      }}
                    >
                      {isFavorited(resource.id) ? (
                        <FaHeart className="favorited" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                  </div>
                  
                  <div className="resource-type-badge">{resource.type || 'Resource'}</div>
                  
                  <p className="resource-description">{resource.description}</p>
                  
                  <div className="resource-details">
                    <div className="resource-address">
                      <FaMapMarkerAlt />
                      <span>{resource.address}</span>
                    </div>
                    
                    {resource.phone && (
                      <div className="resource-phone">
                        <FaPhone />
                        <span>{resource.phone}</span>
                      </div>
                    )}
                    
                    {resource.website && (
                      <div className="resource-website">
                        <FaGlobe />
                        <a 
                          href={resource.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {resource.hours && (
                      <div className="resource-hours">
                        <FaClock />
                        <span>{resource.hours}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="resource-footer">
                    <div className="resource-distance">
                      <FaMapMarkerAlt />
                      <span>{resource.distance_km.toFixed(1)} km away</span>
                    </div>
                    
                    {resource.rating && (
                      <div className="resource-rating">
                        {renderStars(resource.rating)}
                        <span>({resource.rating.toFixed(1)})</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="resource-actions">
                    <button 
                      className="action-btn directions-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`, '_blank');
                      }}
                    >
                      <FaDirections />
                      <span>Directions</span>
                    </button>
                    
                    <button 
                      className="action-btn share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(resource);
                      }}
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <p>No resources found. Try a different search.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Resource Details Modal */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div 
            className="resource-details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="resource-details-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button 
                className="close-details-btn"
                onClick={handleCloseDetails}
              >
                <FaTimes />
              </button>
              
              <div className="resource-details-header">
                <h2>{selectedResource.name}</h2>
                <button 
                  className="favorite-btn"
                  onClick={() => toggleFavorite(selectedResource.id)}
                >
                  {isFavorited(selectedResource.id) ? (
                    <FaHeart className="favorited" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
              
              <div className="resource-type-badge">{selectedResource.type || 'Resource'}</div>
              
              <p className="resource-description">{selectedResource.description}</p>
              
              <div className="resource-details-info">
                <div className="resource-address">
                  <FaMapMarkerAlt />
                  <span>{selectedResource.address}</span>
                </div>
                
                {selectedResource.phone && (
                  <div className="resource-phone">
                    <FaPhone />
                    <span>{selectedResource.phone}</span>
                  </div>
                )}
                
                {selectedResource.website && (
                  <div className="resource-website">
                    <FaGlobe />
                    <a 
                      href={selectedResource.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                    Visit Website
                  </a>
                  </div>
                )}
                
                {selectedResource.hours && (
                  <div className="resource-hours">
                    <FaClock />
                    <span>{selectedResource.hours}</span>
                  </div>
                )}
                
                <div className="resource-distance">
                  <FaMapMarkerAlt />
                  <span>{selectedResource.distance_km.toFixed(1)} km away</span>
                </div>
                
                {selectedResource.rating && (
                  <div className="resource-rating">
                    {renderStars(selectedResource.rating)}
                    <span>({selectedResource.rating.toFixed(1)})</span>
                  </div>
                )}
              </div>
              
              <div className="resource-details-actions">
                <button 
                  className="action-btn directions-btn"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedResource.latitude},${selectedResource.longitude}`, '_blank')}
                >
                  <FaDirections />
                  <span>Get Directions</span>
                </button>
                
                <button 
                  className="action-btn share-btn"
                  onClick={() => handleShare(selectedResource)}
                >
                  <FaShare />
                  <span>Share</span>
                </button>
                
                {selectedResource.phone && (
                  <button 
                    className="action-btn call-btn"
                    onClick={() => window.open(`tel:${selectedResource.phone}`)}
                  >
                    <FaPhone />
                    <span>Call</span>
                  </button>
                )}
          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            className="share-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="share-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button 
                className="close-share-modal-btn"
                onClick={() => setShowShareModal(false)}
              >
                <FaTimes />
              </button>
              
              <h3>Share Resource</h3>
              
              <div className="share-url-container">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="share-url-input"
                />
                <button 
                  className="copy-url-btn"
                  onClick={copyShareUrl}
                >
                  Copy
                </button>
      </div>
              
              <div className="share-options">
                <button className="share-option-btn">
                  <FaShare />
                  <span>Share via...</span>
                </button>
    </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ResourceLocator; 