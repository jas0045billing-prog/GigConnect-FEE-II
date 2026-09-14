import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GigCard from "../components/GigCard";

// ============================================================================
// VIVA EXPLANATION: REST API Consumption (GET /gigs) & Filter Synchronization
// 1. fetch("http://localhost:5000/gigs"): Asynchronously calls the mock json-server REST API.
// 2. async/await: Cleaner syntactic sugar for handling Promises without chaining .then().
// 3. useSearchParams: Synchronizes query string (?search=react&category=Web+Development)
//    with React component state for bookmarkable, shareable URLs.
// 4. Combined Filtering: Demonstrates client-side multi-parameter array filtering.
// ============================================================================

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and category filter state from URL parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  // State to store gigs fetched from the REST API, plus loading and error indicators
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "Web Development",
    "Graphic Design",
    "Content Writing",
    "Video Editing",
    "Digital Marketing",
    "Music & Audio",
  ];

  // Update internal states when URL params change (e.g. via browser back/forward)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Fetch all gigs from json-server REST API
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        // GET request to json-server endpoint
        const response = await fetch("http://localhost:5000/gigs");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert the JSON response into JavaScript array
        const data = await response.json();
        setGigs(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching gigs:", err);
        setError("Could not connect to json-server API on http://localhost:5000/gigs.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  // Handle search input typing
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Submit search via form or Search button click (Requirement 7)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (selectedCategory) params.category = selectedCategory;

    setSearchParams(params);
  };

  // Handle category button click (combines with active search query)
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;

    setSearchParams(params);
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSearchParams({});
  };

  // Filter the fetched API gigs dynamically based on combined search query and category
  const filteredGigs = gigs.filter((gig) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      query === "" ||
      (gig.title && gig.title.toLowerCase().includes(query)) ||
      (gig.category && gig.category.toLowerCase().includes(query)) ||
      (gig.seller && gig.seller.toLowerCase().includes(query)) ||
      (gig.description && gig.description.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === "" || gig.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page explore-page">
      <div className="explore-header">
        <div>
          <p className="section-label">DISCOVER SERVICES</p>
          <h1>Explore Freelance Gigs</h1>
          <p>
            Find talented freelancers for your next project, hire by category, and compare services.
          </p>
        </div>
      </div>

      {/* Search Bar with working submit button (Requirement 7) */}
      <form className="explore-search-bar" onSubmit={handleSearchSubmit}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search services, skills, or freelancers (e.g. React, Logo, Python)..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search services"
        />
        {search && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => {
              setSearch("");
              const params = {};
              if (selectedCategory) params.category = selectedCategory;
              setSearchParams(params);
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-action-btn" id="explore-search-btn">
          Search
        </button>
      </form>

      {/* Categories Filter */}
      <div className="explore-categories">
        <div className="category-header-row">
          <h2>Browse Categories</h2>
          {(selectedCategory || search) && (
            <button className="clear-all-filters-btn" onClick={handleClearFilters}>
              Reset Filters ↺
            </button>
          )}
        </div>

        <div className="category-buttons">
          <button
            type="button"
            className={selectedCategory === "" ? "active" : ""}
            onClick={() => handleCategoryClick("")}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="results-heading">
        <h2>
          {loading
            ? "Loading Services from API..."
            : `${filteredGigs.length} Services Available`}
        </h2>
        {selectedCategory && (
          <span className="active-filter-indicator">
            Filtering by: <strong>{selectedCategory}</strong>
          </span>
        )}
      </div>

      {/* Gigs Grid */}
      <div className="gig-grid">
        {loading ? (
          <div className="no-results">
            <div>⏳</div>
            <h2>Connecting to REST API...</h2>
            <p>Fetching gigs from http://localhost:5000/gigs</p>
          </div>
        ) : error ? (
          <div className="no-results">
            <div>⚠️</div>
            <h2>API Connection Error</h2>
            <p>{error}</p>
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              Make sure json-server is running on port 5000:{" "}
              <code>npm run server</code>
            </p>
          </div>
        ) : filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
        ) : (
          <div className="no-results">
            <div>🔎</div>
            <h2>No gigs match your filters</h2>
            <p>
              Try clearing your search or switching to another category.
            </p>
            <button
              type="button"
              className="order-btn"
              style={{ marginTop: "20px" }}
              onClick={handleClearFilters}
            >
              Show All Gigs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;