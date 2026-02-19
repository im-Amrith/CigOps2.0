import { useState, useEffect } from "react";
import { searchKnowledgeBase } from "../api";
import "./KnowledgeBase.css";

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15));

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchKnowledgeBase(userId, searchQuery);
      setResults(response.results || []);
    } catch (err) {
      console.error("Error searching knowledge base:", err);
      setError("Failed to search knowledge base. Please try again.");
      
      // Mock data for development
      setResults([
        {
          id: 1,
          title: "Understanding Nicotine Withdrawal",
          content: "Nicotine withdrawal symptoms typically begin within 2-3 hours after your last cigarette and peak within 2-3 days. Common symptoms include irritability, anxiety, difficulty concentrating, and increased appetite.",
          category: "Withdrawal"
        },
        {
          id: 2,
          title: "Coping Strategies for Cravings",
          content: "When a craving hits, try the 4 D's: Delay, Deep breathing, Drink water, and Do something else. Most cravings last only 3-5 minutes, so finding ways to distract yourself can help you overcome them.",
          category: "Coping"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="knowledge-base-container">
      <h1>Knowledge Base</h1>
      <p className="knowledge-base-intro">
        Search for information about nicotine recovery, withdrawal symptoms, coping strategies, and more.
      </p>
      
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for information..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
      
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching knowledge base...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleSearch} className="retry-button">
            Try Again
          </button>
        </div>
      )}
      
      {!isLoading && !error && results.length > 0 && (
        <div className="results-container">
          <h2>Search Results</h2>
          <div className="results-list">
            {results.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-category">{result.category}</div>
                <h3 className="result-title">{result.title}</h3>
                <p className="result-content">{result.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && !error && searchQuery && results.length === 0 && (
        <div className="no-results">
          <p>No results found for "{searchQuery}". Try a different search term.</p>
        </div>
      )}
    </div>
  );
} 