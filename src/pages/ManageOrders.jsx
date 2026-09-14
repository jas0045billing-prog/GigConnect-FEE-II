import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================================
// VIVA EXPLANATION: Seller Order Tracking & Status Updates
// 1. Filter: order.sellerId === currentUser.id ensures sellers only see their gigs' orders.
// 2. State Mutation & localStorage: When seller updates status (Pending -> In Progress -> Completed),
//    we update the master orders array in localStorage and update component state for instant UI re-rendering.
// 3. DBMS Equivalent: In MySQL, this corresponds to:
//    UPDATE orders SET status = 'Completed' WHERE id = ? AND seller_id = ?;
// ============================================================================

function ManageOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  // Load orders on component mount
  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      // Filter orders where seller matches currently logged-in seller
      const sellerOrders = storedOrders.filter(
        (order) =>
          Number(order.sellerId) === Number(currentUser?.id) ||
          order.seller === currentUser?.name
      );
      setOrders(sellerOrders);
    } catch (err) {
      console.error("Error loading seller orders:", err);
    }
  }, [currentUser]);

  // Handle status update
  const handleStatusChange = (orderId, newStatus) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const updatedAllOrders = allOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });

      // 1. Persist update in localStorage
      localStorage.setItem("orders", JSON.stringify(updatedAllOrders));

      // 2. Immediately update local state to reflect change in UI
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Error updating order status.");
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
    <div className="page manage-orders-page">
      <div className="section-heading" style={{ marginBottom: "24px" }}>
        <div>
          <p className="section-label">SELLER DASHBOARD</p>
          <h1>Manage Orders</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Track and fulfill client orders received for your gigs.
          </p>
        </div>

        <Link to="/create-gig" className="create-gig-btn" style={{ textDecoration: "none" }}>
          + Create New Gig
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="no-results">
          <div>📦</div>
          <h2>No orders received yet</h2>
          <p>
            When buyers order your gigs, they will appear here for you to track and fulfill.
          </p>
          <Link
            to="/explore"
            className="order-btn"
            style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
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
                  <strong>Client / Buyer:</strong> {order.buyer || "Jaspreet"}
                </p>
                <p>
                  <strong>Price:</strong> ₹{order.price}
                </p>
                {order.createdAt && (
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="order-action-bar">
                <label style={{ fontWeight: 600, fontSize: "14px", marginRight: "10px" }}>
                  Update Status:
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
                  Changes save to localStorage automatically
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageOrders;
