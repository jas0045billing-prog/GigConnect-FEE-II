import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function GigDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // State for single gig details, loading, and error
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderNotice, setOrderNotice] = useState(null);

  // Fetch gig details from json-server REST API
  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);
        // GET request for single gig by ID parameter
        const response = await fetch(`http://localhost:5000/gigs/${id}`);

        if (!response.ok) {
          throw new Error(`Gig not found (Status: ${response.status})`);
        }

        const data = await response.json();
        setGig(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching gig details:", err);
        setError("Could not load gig details from API. Please verify json-server is running.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGigDetails();
    }
  }, [id]);

  // Handle Order Placement (Requirements 3 & 8)
  const placeOrder = () => {
    if (!gig) return;

    // 1. If not logged in -> redirect to /login with message (Requirement 3)
    if (!currentUser) {
      navigate("/login", {
        state: {
          message: "Please login or signup to place an order.",
          redirectTo: `/gig/${id}`,
        },
      });
      return;
    }

    // 2. If logged in as Seller -> A seller should not order their own gig (Requirement 8)
    if (currentUser.role === "seller") {
      const isOwnGig =
        Number(gig.sellerId) === Number(currentUser.id) ||
        gig.seller === currentUser.name;

      if (isOwnGig) {
        setOrderNotice("A seller cannot order their own gig.");
        alert("You cannot order your own gig. You are the seller of this service.");
        return;
      } else {
        setOrderNotice("Sellers cannot place orders. Please switch to a Buyer account.");
        alert("You are currently logged in as a Seller. Please use a Buyer account to place orders.");
        return;
      }
    }

    // 3. Logged in as Buyer -> Create normalized order object (Requirement 8)
    const newOrder = {
      id: Date.now(),
      gigId: Number(gig.id),
      title: gig.title,
      seller: gig.seller || "Freelancer",
      sellerId: Number(gig.sellerId) || (gig.seller === "Simran Kaur" ? 2 : 1),
      buyer: currentUser.name,
      buyerId: currentUser.id,
      price: Number(gig.price),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
      localStorage.setItem("orders", JSON.stringify([...existingOrders, newOrder]));

      alert("🎉 Order placed successfully! Redirecting to My Orders...");
      navigate("/orders");
    } catch (err) {
      console.error("Failed to save order to localStorage:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="page gig-details-page">
        <div className="no-results">
          <div>⏳</div>
          <h2>Loading gig details...</h2>
          <p>Fetching gig #{id} from REST API</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="page gig-details-page">
        <div className="no-results">
          <div>⚠️</div>
          <h2>{error || "Gig not found"}</h2>
          <p>The requested service could not be located on the server.</p>
          <button
            style={{ marginTop: "20px" }}
            className="order-btn"
            onClick={() => navigate("/explore")}
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const isSellerOwnGig =
    currentUser?.role === "seller" &&
    (Number(gig.sellerId) === Number(currentUser.id) ||
      gig.seller === currentUser.name);

  return (
    <div className="page gig-details-page">
      <div className="gig-details-card">
        <div className="gig-details-media">
          <img
            src={
              gig.image ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
            }
            alt={gig.title}
          />
        </div>

        <div className="gig-details-info">
          <span className="gig-detail-category">{gig.category}</span>
          <h1>{gig.title}</h1>

          {gig.description && (
            <p style={{ margin: "16px 0", color: "var(--text-muted)", lineHeight: "1.6" }}>
              {gig.description}
            </p>
          )}

          <div className="gig-meta">
            <p>
              👤 <strong>Seller:</strong> {gig.seller || "Freelancer"}
            </p>
            <p>
              ⭐ <strong>Rating:</strong> {gig.rating || 5.0} ({gig.reviews || 0} reviews)
            </p>
            <p>
              ⏱️ <strong>Delivery Time:</strong> {gig.delivery || "3 days"}
            </p>
          </div>

          <div className="gig-price-box">
            <span className="price-label">Service Price</span>
            <span className="price-amount">₹{gig.price}</span>
          </div>

          {orderNotice && (
            <div className="alert-banner warning" style={{ marginBottom: "16px" }}>
              ⚠️ {orderNotice}
            </div>
          )}

          {/* Dynamic Order Button with Auth and Role Awareness */}
          {isSellerOwnGig ? (
            <div className="seller-own-notice">
              <span>ℹ️ You are the seller of this gig. Manage orders in your dashboard.</span>
              <Link to="/manage-orders" className="view-all-btn" style={{ textDecoration: "none", marginTop: "10px", display: "inline-block" }}>
                Go to Manage Orders →
              </Link>
            </div>
          ) : (
            <button className="order-btn" onClick={placeOrder} id="order-now-btn">
              {currentUser ? "Order Now 🚀" : "Login to Order 🚀"}
            </button>
          )}

          {!currentUser && (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px", textAlign: "center" }}>
              🔒 You will be asked to login or sign up before placing this order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GigDetails;