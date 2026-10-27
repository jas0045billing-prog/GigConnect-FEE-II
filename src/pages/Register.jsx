import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

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
        alert(
          `🎉 Account created successfully as ${
            role === "client" ? "CLIENT" : "FREELANCER"
          }!`
        );

        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else if (role === "freelancer") {
          navigate("/dashboard");
        } else {
          navigate("/explore");
        }
      } else {
        setError(
          result.message || "Failed to create account. Please try again."
        );
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
        <p>Join GigConnect to hire freelancers or offer your skills</p>

        {error && (
          <div
            className="alert-banner danger"
            style={{ marginBottom: "20px" }}
          >
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

          <label style={{ marginTop: "20px" }}>
            I want to join as: *
          </label>

          <div className="role-selector-grid">
            <label
              className={`role-option ${
                role === "client" ? "selected" : ""
              }`}
              onClick={() => setRole("client")}
            >
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={() => setRole("client")}
                style={{ display: "none" }}
              />
              <div className="role-icon">🧑‍💼</div>
              <div className="role-title">Client</div>
              <div className="role-desc">
                I want to post projects and hire freelancers
              </div>
            </label>

            <label
              className={`role-option ${
                role === "freelancer" ? "selected" : ""
              }`}
              onClick={() => setRole("freelancer")}
            >
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={role === "freelancer"}
                onChange={() => setRole("freelancer")}
                style={{ display: "none" }}
              />
              <div className="role-icon">💻</div>
              <div className="role-title">Freelancer</div>
              <div className="role-desc">
                I want to find projects and offer my skills
              </div>
            </label>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            style={{ marginTop: "24px" }}
          >
            Create Account as{" "}
            {role === "client" ? "Client" : "Freelancer"}
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