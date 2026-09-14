import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================================
// VIVA EXPLANATION: Buyer Orders & Immediate Order Cancellation
// 1. Array Filtering: order.buyerId === currentUser.id ensures strict data isolation
//    so buyers never see orders belonging to others.
// 2. Order Cancellation: Updates the status from "Pending"/"In Progress" to "Cancelled"
//    both in localStorage and React component state for instant UI re-render.
// 3. Conditional Button Rendering: The "Cancel Order" button is hidden when an order
//    is already "Completed" or "Cancelled".
// ============================================================================

function Orders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage and filter for the logged-in buyer
  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      // Filter strictly by buyer ID or buyer name (Requirement 9)
      const buyerOrders = storedOrders.filter(
        (order) =>
          Number(order.buyerId) === Number(currentUser?.id) ||
          order.buyer === currentUser?.name
      );
      setOrders(buyerOrders);
    } catch (err) {
      console.error("Error reading orders from localStorage:", err);
    }
  }, [currentUser]);

  // Handle Order Cancellation (Requirement 10)
  const handleCancelOrder = (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const updatedAllOrders = allOrders.map((order) => {
        if (order.id === orderId) {
          // Change status to "Cancelled" without deleting the record
          return { ...order, status: "Cancelled" };
        }
        return order;
      });

      // 1. Update in localStorage
      localStorage.setItem("orders", JSON.stringify(updatedAllOrders));

      // 2. Immediately update local state to reflect "Cancelled" in UI
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("An error occurred while cancelling the order.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge status-pending";
      case "In Progress":
        return "status-badge status-in-progress";
      case "Completed":
        return "status-badge status-completed";
      case "Cancelled":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="page orders-page">
      <div className="section-heading" style={{ marginBottom: "24px" }}>
        <div>
          <p className="section-label">PURCHASE HISTORY</p>
          <h1>My Orders</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Track the status of services you have ordered from freelancers.
          </p>
        </div>

        <Link to="/explore" className="view-all-btn" style={{ textDecoration: "none" }}>
          Browse More Gigs →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="no-results">
          <div>🛒</div>
          <h2>No orders placed yet</h2>
          <p>
            You have not ordered any services yet. Explore skilled freelancers and order your first gig.
          </p>
          <Link
            to="/explore"
            className="order-btn"
            style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}
          >
            Explore Freelancers
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            // Check if order is still cancellable (Pending or In Progress)
            const isCancellable =
              order.status !== "Completed" && order.status !== "Cancelled";

            return (
              <div className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <h2>{order.title}</h2>
                  </div>
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status}
                  </span>
                </div>

                <div className="order-card-details">
                  <p>
                    <strong>Freelancer / Seller:</strong> {order.seller}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹{order.price}
                  </p>
                  {order.createdAt && (
                    <p>
                      <strong>Placed On:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Cancel Button (Visible only for cancellable orders - Requirement 10) */}
                <div className="order-action-bar">
                  {isCancellable ? (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(order.id)}
                      id={`cancel-order-${order.id}`}
                    >
                      ✕ Cancel Order
                    </button>
                  ) : (
                    <span className="order-finalized-text">
                      {order.status === "Completed"
                        ? "✅ Order fulfilled and completed."
                        : "🚫 This order has been cancelled."}
                    </span>
                  )}

                  <Link
                    to={`/gig/${order.gigId}`}
                    className="view-gig-link"
                    style={{ marginLeft: "auto", textDecoration: "none" }}
                  >
                    View Gig Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;