import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const flashMessage = location.state?.message;
  const redirectTo = location.state?.redirectTo || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      const result = login(email, password);

      if (result && result.success) {
        alert(`Welcome back, ${result.user.name}!`);
        navigate(redirectTo, { replace: true });
      } else {
        setError(result?.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during login.");
    }
  };

  const handleQuickDemo = (role) => {
    const user =
      role === "buyer"
        ? {
            id: 3,
            name: "Demo Buyer",
            email: "buyer@demo.com",
            role: "buyer",
          }
        : {
            id: 1,
            name: "Demo Seller",
            email: "seller@demo.com",
            role: "seller",
          };

    quickLogin(user);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="page auth-page">
      <div className="auth-box">
        <h1>Login</h1>
        <p>Access your GigConnect marketplace account</p>

        {flashMessage && (
          <div
            className="alert-banner warning"
            style={{ marginBottom: "20px" }}
          >
            ℹ️ {flashMessage}
          </div>
        )}

        {error && (
          <div
            className="alert-banner danger"
            style={{ marginBottom: "20px" }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className="quick-demo-box">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Quick Demo Login
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              className="quick-demo-btn buyer"
              onClick={() => handleQuickDemo("buyer")}
            >
              👤 Demo Buyer
            </button>

            <button
              type="button"
              className="quick-demo-btn seller"
              onClick={() => handleQuickDemo("seller")}
            >
              💼 Demo Seller
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" id="login-submit-btn">
            Login to Account
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register" state={location.state}>
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
