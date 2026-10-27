import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo">
          Gig<span>Connect</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>

          {/* Guest Links */}
          {!currentUser && (
            <>
              <ThemeToggle />
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="signup-nav-btn">
                Signup
              </Link>
            </>
          )}

          {/* Buyer Links */}
          {currentUser && currentUser.role === "buyer" && (
            <>
              <Link to="/orders">My Orders</Link>
              <Link to="/dashboard">Dashboard</Link>
              <ThemeToggle />
              <div className="nav-user-badge">
                <span className="user-icon">👤</span>
                <span className="user-name">{currentUser.name}</span>
                <span className="role-tag buyer">Buyer</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                Logout
              </button>
            </>
          )}

          {/* Seller Links */}
          
{/* Freelancer Links */}
{currentUser && currentUser.role === "seller" && (
  <>
    <Link to="/projects">Explore Projects</Link>
    <Link to="/my-proposals">My Proposals</Link>
    <Link to="/create-gig">Create Gig</Link>
    <Link to="/manage-orders">Manage Orders</Link>
    <Link to="/dashboard">Dashboard</Link>

    <ThemeToggle />

    <div className="nav-user-badge">
      <span className="user-icon">👤</span>
      <span className="user-name">{currentUser.name}</span>
      <span className="role-tag seller">Freelancer</span>
    </div>

    <button
      onClick={handleLogout}
      className="logout-btn"
      title="Logout"
    >
      Logout
    </button>
  </>
)}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;