import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================================
// VIVA EXPLANATION: Dynamic Role-Based Dashboard Calculations
// 1. Data Aggregation: Rather than static numbers, metrics are computed directly
//    from live REST API data (/gigs) and localStorage order records.
// 2. Seller Calculations:
//    - Total Gigs: Gigs where gig.sellerId === currentUser.id
//    - Total Orders: Orders where order.sellerId === currentUser.id
//    - Pending Orders: Status === "Pending"
//    - Completed Orders: Status === "Completed"
//    - Earnings: Sum of prices of Completed orders.
// 3. Buyer Calculations:
//    - Total Orders, Pending Orders, Completed Orders, Cancelled Orders.
// ============================================================================

function Dashboard() {
  const { currentUser } = useAuth();
  const [sellerGigs, setSellerGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch gigs from REST API
        const gigsRes = await fetch("http://localhost:5000/gigs");
        if (gigsRes.ok) {
          const allGigs = await gigsRes.json();
          // Filter gigs belonging to the current seller
          const matchedGigs = allGigs.filter(
            (g) =>
              Number(g.sellerId) === Number(currentUser?.id) ||
              g.seller === currentUser?.name
          );
          setSellerGigs(matchedGigs);
        }

        // 2. Fetch orders from localStorage
        const storedOrders =
          JSON.parse(localStorage.getItem("orders")) || [];
        setOrders(storedOrders);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  // If user is a SELLER (Requirement 12)
  if (currentUser?.role === "seller") {
    const myOrders = orders.filter(
      (o) =>
        Number(o.sellerId) === Number(currentUser?.id) ||
        o.seller === currentUser?.name
    );

    const totalOrders = myOrders.length;
    const pendingOrders = myOrders.filter((o) => o.status === "Pending").length;
    const inProgressOrders = myOrders.filter((o) => o.status === "In Progress").length;
    const completedOrders = myOrders.filter((o) => o.status === "Completed").length;
    const earnings = myOrders
      .filter((o) => o.status === "Completed")
      .reduce((sum, o) => sum + Number(o.price || 0), 0);

    return (
      <div className="page dashboard">
        <div className="section-heading" style={{ marginBottom: "20px" }}>
          <div>
            <h1>Seller Dashboard</h1>
            <p className="welcome">
              Welcome back, <strong>{currentUser.name}</strong> 👋 (Freelance Seller)
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/manage-orders" className="view-all-btn" style={{ textDecoration: "none" }}>
              Manage Orders ({myOrders.length})
            </Link>
            <Link to="/create-gig" className="create-gig-btn" style={{ textDecoration: "none" }}>
              + Create Gig
            </Link>
          </div>
        </div>

        {/* Dynamic Statistics (Requirement 12) */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Gigs</h3>
            <p>{loading ? "..." : sellerGigs.length}</p>
            <span className="stat-subtext">Active listings</span>
          </div>

          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
            <span className="stat-subtext">From clients</span>
          </div>

          <div className="stat-card">
            <h3>Pending / Active</h3>
            <p>{pendingOrders + inProgressOrders}</p>
            <span className="stat-subtext">{pendingOrders} pending, {inProgressOrders} in progress</span>
          </div>

          <div className="stat-card">
            <h3>Earnings</h3>
            <p>₹{earnings.toLocaleString()}</p>
            <span className="stat-subtext">{completedOrders} orders fulfilled</span>
          </div>
        </div>

        {/* My Gigs Section */}
        <section className="my-gigs">
          <div className="section-heading" style={{ marginBottom: "16px" }}>
            <h2>My Active Gigs ({sellerGigs.length})</h2>
            <Link to="/create-gig" className="create-gig-btn" style={{ textDecoration: "none" }}>
              + Add New Service
            </Link>
          </div>

          {sellerGigs.length === 0 ? (
            <div className="no-results" style={{ padding: "40px" }}>
              <p>You haven't created any gigs yet.</p>
              <Link to="/create-gig" className="create-gig-btn" style={{ textDecoration: "none", marginTop: "12px" }}>
                Create Your First Gig
              </Link>
            </div>
          ) : (
            sellerGigs.map((gig) => (
              <div className="seller-gig" key={gig.id}>
                <div>
                  <span style={{ fontWeight: 700 }}>{gig.title}</span>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Category: {gig.category} • Price: ₹{gig.price} • Delivery: {gig.delivery}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    to={`/gig/${gig.id}`}
                    className="order-btn"
                    style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    );
  }

  // If user is a BUYER (Requirement 13)
  const myBuyerOrders = orders.filter(
    (o) =>
      Number(o.buyerId) === Number(currentUser?.id) ||
      o.buyer === currentUser?.name
  );

  const totalOrders = myBuyerOrders.length;
  const pendingOrders = myBuyerOrders.filter((o) => o.status === "Pending").length;
  const completedOrders = myBuyerOrders.filter((o) => o.status === "Completed").length;
  const cancelledOrders = myBuyerOrders.filter((o) => o.status === "Cancelled").length;

  return (
    <div className="page dashboard">
      <div className="section-heading" style={{ marginBottom: "20px" }}>
        <div>
          <h1>Buyer Dashboard</h1>
          <p className="welcome">
            Welcome back, <strong>{currentUser?.name || "Client"}</strong> 👋 (Buyer Account)
          </p>
        </div>

        <Link to="/explore" className="view-all-btn" style={{ textDecoration: "none" }}>
          Find Talent →
        </Link>
      </div>

      {/* Dynamic Statistics for Buyer (Requirement 13) */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
          <span className="stat-subtext">Services commissioned</span>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <p>{pendingOrders}</p>
          <span className="stat-subtext">Awaiting fulfillment</span>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>{completedOrders}</p>
          <span className="stat-subtext">Delivered projects</span>
        </div>

        <div className="stat-card">
          <h3>Cancelled</h3>
          <p>{cancelledOrders}</p>
          <span className="stat-subtext">Refunded / cancelled</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="my-gigs">
        <div className="section-heading" style={{ marginBottom: "16px" }}>
          <h2>Recent Orders ({myBuyerOrders.length})</h2>
          <Link to="/orders" className="view-all-btn" style={{ textDecoration: "none" }}>
            View All in My Orders →
          </Link>
        </div>

        {myBuyerOrders.length === 0 ? (
          <div className="no-results" style={{ padding: "40px" }}>
            <p>You haven't ordered any services yet.</p>
            <Link to="/explore" className="order-btn" style={{ textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              Explore Services
            </Link>
          </div>
        ) : (
          myBuyerOrders.slice(0, 5).map((order) => (
            <div className="seller-gig" key={order.id}>
              <div>
                <span style={{ fontWeight: 700 }}>{order.title}</span>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Seller: {order.seller} • ₹{order.price} • Status:{" "}
                  <strong>{order.status}</strong>
                </div>
              </div>

              <Link
                to={`/gig/${order.gigId}`}
                className="order-btn"
                style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}
              >
                View Gig
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Dashboard;