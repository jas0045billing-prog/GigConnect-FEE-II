import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  requiredRole,
  customGuestMessage,
  deniedMessage,
}) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    const defaultMsg =
      requiredRole === "seller" || requiredRole === "freelancer"
        ? "Please login or signup as a freelancer to continue."
        : "Please login or signup to continue.";

    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: customGuestMessage || defaultMsg,
          redirectTo: location.pathname,
        }}
      />
    );
  }

  // Support both the old and new role names
  const isClient =
    currentUser.role === "client" || currentUser.role === "buyer";

  const isFreelancer =
    currentUser.role === "freelancer" || currentUser.role === "seller";

  const hasRequiredRole =
    !requiredRole ||
    (["client", "buyer"].includes(requiredRole) && isClient) ||
    (["freelancer", "seller"].includes(requiredRole) && isFreelancer);

  if (!hasRequiredRole) {
    return (
      <div className="page auth-page">
        <div className="auth-box" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            🚫
          </div>

          <h1>Access Restricted</h1>

          <p
            style={{
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "16px",
              margin: "14px 0",
            }}
          >
            {deniedMessage ||
              (requiredRole === "seller" ||
              requiredRole === "freelancer"
                ? "Only freelancers can access this page."
                : "Only clients can access this page.")}
          </p>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            You are currently signed in as{" "}
            <strong>{currentUser.name}</strong> ({currentUser.role}).
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              className="view-all-btn"
              style={{
                textDecoration: "none",
                padding: "10px 18px",
              }}
            >
              Back to Home
            </Link>

            {isClient && (
              <Link
                to="/orders"
                className="order-btn"
                style={{
                  textDecoration: "none",
                  padding: "10px 18px",
                }}
              >
                Go to My Orders
              </Link>
            )}

            {isFreelancer && (
              <Link
                to="/manage-orders"
                className="order-btn"
                style={{
                  textDecoration: "none",
                  padding: "10px 18px",
                }}
              >
                Go to Manage Orders
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
