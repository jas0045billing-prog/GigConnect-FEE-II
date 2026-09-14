import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================================
// VIVA EXPLANATION: User Registration with Role Selection (Buyer vs Seller)
// 1. Role Assignment: Enables user to select "buyer" or "seller" at registration.
// 2. Storage: Serializes new user object into localStorage ('users' and 'currentUser').
// 3. Educational Context: Explains that in a full-stack system, this executes:
//    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?);
// ============================================================================

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // Default to Buyer
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const result = register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      if (result.success) {
        alert(`🎉 Account created successfully as ${role.toUpperCase()}!`);
        // Navigate based on selected role or redirect target
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else if (role === "seller") {
          navigate("/dashboard");
        } else {
          navigate("/explore");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>Join GigConnect to hire or offer services</p>

        {error && (
          <div className="alert-banner danger" style={{ marginBottom: "20px" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Jaspreet Kaur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address *</label>
          <input
            type="email"
            placeholder="e.g. jaspreet@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password *</label>
          <input
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Role Selection (Requirement 2) */}
          <label style={{ marginTop: "20px" }}>I want to join as: *</label>
          <div className="role-selector-grid">
            <label
              className={`role-option ${role === "buyer" ? "selected" : ""}`}
              onClick={() => setRole("buyer")}
            >
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={role === "buyer"}
                onChange={() => setRole("buyer")}
                style={{ display: "none" }}
              />
              <div className="role-icon">🛒</div>
              <div className="role-title">Buyer</div>
              <div className="role-desc">I want to hire freelancers & order gigs</div>
            </label>

            <label
              className={`role-option ${role === "seller" ? "selected" : ""}`}
              onClick={() => setRole("seller")}
            >
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
                style={{ display: "none" }}
              />
              <div className="role-icon">💼</div>
              <div className="role-title">Seller</div>
              <div className="role-desc">I want to create gigs & offer services</div>
            </label>
          </div>

          <button type="submit" id="register-submit-btn" style={{ marginTop: "24px" }}>
            Create Account as {role === "buyer" ? "Buyer" : "Seller"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login" state={location.state}>
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;