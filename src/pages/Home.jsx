import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import initialGigs from "../data/gigs";
import GigCard from "../components/GigCard";

function Home() {
  const [search, setSearch] = useState("");
  const [popularGigs, setPopularGigs] = useState(initialGigs);
  const navigate = useNavigate();

  // Fetch latest popular gigs from the REST API
  useEffect(() => {
    fetch("http://localhost:5000/gigs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPopularGigs(data);
        }
      })
      .catch((err) => {
        // Silently fall back to initial gigs if API is offline
        console.log("Using local gigs for Home display:", err.message);
      });
  }, []);

  const categories = [
    {
      name: "Web Development",
      icon: "💻",
      description: "Websites & applications",
    },
    {
      name: "Graphic Design",
      icon: "🎨",
      description: "Logos & visual designs",
    },
    {
      name: "Content Writing",
      icon: "✍️",
      description: "Articles & copywriting",
    },
    {
      name: "Video Editing",
      icon: "🎬",
      description: "Videos & animations",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim() === "") {
      navigate("/explore");
    } else {
      navigate(`/explore?search=${encodeURIComponent(search)}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          <div className="hero-badge">
            🚀 Connect with Top Talent
          </div>

          <h1>
            Find the perfect freelancer
            <span> for your project</span>
          </h1>

          <p>
            Connect with skilled freelancers and bring your ideas to life with seamless order tracking and verified reviews.
          </p>

          {/* Search Form */}
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for services (e.g. React, Logo, Video)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">
              🔍 Search
            </button>
          </form>

          <div className="popular-searches">
            <span>Popular:</span>

            <button
              type="button"
              onClick={() => setSearch("React website")}
            >
              React Website
            </button>

            <button
              type="button"
              onClick={() => setSearch("Logo design")}
            >
              Logo Design
            </button>

            <button
              type="button"
              onClick={() => setSearch("Video editing")}
            >
              Video Editing
            </button>
          </div>

        </div>
      </section>

      {/* Short Introduction to GigConnect */}
      <section className="intro-section">
        <div className="intro-header">
          <p className="section-label">WHY GIGCONNECT?</p>

          <h2>
            A Complete Freelance Marketplace Platform
          </h2>

          <p>
            Designed for seamless collaboration between ambitious clients and skilled freelancers.
          </p>
        </div>

        <div className="intro-grid">

          <div className="intro-card">
            <div className="intro-icon">⭐</div>

            <h3>Verified Freelancers</h3>

            <p>
              Browse vetted professionals across web development, creative design, and digital marketing.
            </p>
          </div>

          <div className="intro-card">
            <div className="intro-icon">🔒</div>

            <h3>Transparent Orders</h3>

            <p>
              Real-time order lifecycle tracking from Pending, In Progress, to Completed or Cancelled.
            </p>
          </div>

          <div className="intro-card">
            <div className="intro-icon">⚡</div>

            <h3>Direct REST API</h3>

            <p>
              Powered by standard RESTful architecture ready for enterprise MySQL and Node.js deployment.
            </p>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="section-heading">

          <div>
            <p className="section-label">EXPLORE</p>
            <h2>Popular Categories</h2>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/explore")}
          >
            View all →
          </button>

        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <div
              className="category-card"
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
            >

              <div className="category-icon">
                {category.icon}
              </div>

              <h3>{category.name}</h3>

              <p>{category.description}</p>

              <span className="category-arrow">
                →
              </span>

            </div>
          ))}
        </div>
      </section>

      {/* Popular Gigs */}
      <section className="popular-gigs">
        <div className="section-heading">

          <div>
            <p className="section-label">TOP SERVICES</p>
            <h2>Popular Gigs</h2>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/explore")}
          >
            Explore gigs →
          </button>

        </div>

        <div className="gig-grid">
          {popularGigs.slice(0, 6).map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
            />
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="cta-section">
        <div>

          <p className="section-label">
            FOR FREELANCERS
          </p>

          <h2>
            Turn your skills into opportunities.
          </h2>

          <p>
            Create your gig and start connecting with clients today.
          </p>

        </div>

        <button
          className="cta-btn"
          onClick={() => navigate("/create-gig")}
        >
          Start Selling →
        </button>
      </section>

    </div>
  );
}

export default Home;