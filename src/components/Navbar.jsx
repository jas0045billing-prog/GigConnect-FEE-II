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

  const isClient =
    currentUser?.role === "client" || currentUser?.role === "buyer";

  const isFreelancer =
    currentUser?.role === "freelancer" || currentUser?.role === "seller";

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
          <Link to="/explore">Explore Projects</Link>

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

          {/* Client Links */}
          {currentUser && isClient && (
            <>
              <Link to="/create-gig">Post a Project</Link>

              <Link to="/my-projects">My Projects</Link>

              <Link to="/dashboard">Dashboard</Link>

              <ThemeToggle />

              <div className="nav-user-badge">
                <span className="user-icon">👤</span>

                <span className="user-name">
                  {currentUser.name}
                </span>

                <span className="role-tag buyer">
                  Client
                </span>
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

          {/* Freelancer Links */}
          {currentUser && isFreelancer && (
            <>
              <Link to="/my-proposals">My Proposals</Link>

              <Link to="/dashboard">Dashboard</Link>

              <ThemeToggle />

              <div className="nav-user-badge">
                <span className="user-icon">👤</span>

                <span className="user-name">
                  {currentUser.name}
                </span>

                <span className="role-tag seller">
                  Freelancer
                </span>
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