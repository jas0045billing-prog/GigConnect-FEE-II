import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="logo">
            Gig<span>Connect</span>
          </Link>
          <p className="footer-tagline">
            Connecting talented freelancers with ambitious clients worldwide. A complete freelance marketplace built for FEE-II.
          </p>
          <div className="footer-badge">
            🎓 FEE-II College Project • React + Vite + REST API
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Explore Categories</h4>
            <Link to="/explore?category=Web%20Development">Web Development</Link>
            <Link to="/explore?category=Graphic%20Design">Graphic Design</Link>
            <Link to="/explore?category=Video%20Editing">Video Editing</Link>
            <Link to="/explore?category=Content%20Writing">Content Writing</Link>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/explore">All Gigs</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/create-gig">Become a Seller</Link>
          </div>

          <div className="footer-col">
            <h4>Technology Stack</h4>
            <span>Frontend: React 19 + Vite</span>
            <span>Routing: React Router v7</span>
            <span>API: json-server REST API</span>
            <span>Storage: localStorage (DBMS-Ready)</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {new Date().getFullYear()} GigConnect Freelance Marketplace. All rights reserved.</p>
          <p>Designed for Academic Demonstration & Viva Evaluation.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
