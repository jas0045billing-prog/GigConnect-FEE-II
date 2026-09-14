import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreateGig() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form states (Requirement 5)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("3 days");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Category image defaults to ensure the created gig displays beautifully in GigCard
  const categoryImages = {
    "Web Development": "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    "Graphic Design": "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    "Content Writing": "https://images.unsplash.com/photo-1456324504439-367cee3b3c32",
    "Video Editing": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d",
    "Digital Marketing": "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
    "Music & Audio": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !price || !category || !delivery) {
      alert("Please enter title, price, category, and delivery time.");
      return;
    }

    // New Gig object with dynamic seller details (Requirement 5)
    const newGig = {
      title: title.trim(),
      description:
        description.trim() ||
        `Professional ${category} service delivered with high quality standards.`,
      seller: currentUser?.name || "Aman Singh",
      sellerId: Number(currentUser?.id) || 1,
      category,
      price: Number(price),
      rating: 5.0,
      reviews: 0,
      delivery,
      image:
        categoryImages[category] ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    };

    try {
      setIsSubmitting(true);

      // Sending POST request to json-server REST API
      const response = await fetch("http://localhost:5000/gigs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGig),
      });

      if (!response.ok) {
        throw new Error(`Failed to save gig. HTTP Status: ${response.status}`);
      }

      const createdData = await response.json();
      console.log("New gig created in json-server:", createdData);

      setSuccessMessage("Gig created successfully and published to the REST API!");
      alert("🎉 Gig created successfully! Published to REST API.");

      // Clear the form fields
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setDelivery("3 days");

      // Navigate to Explore page so the user can verify the new gig
      navigate("/explore");
    } catch (err) {
      console.error("Error creating gig:", err);
      alert(
        "Failed to create gig. Make sure json-server is running on port 5000 (npm run server)."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page create-gig">
      <div className="create-gig-header">
        <p className="section-label">SELLER STUDIO</p>
        <h1>Create a New Gig</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          Publish your service to the GigConnect marketplace.
        </p>
      </div>

      {currentUser && (
        <div className="seller-active-badge" style={{ marginBottom: "20px" }}>
          <span>👤 Publishing as: <strong>{currentUser.name}</strong> (Seller ID: #{currentUser.id})</span>
        </div>
      )}

      {successMessage && (
        <div className="alert-banner success" style={{ marginBottom: "20px" }}>
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="gig-form">
        {/* Gig Title */}
        <label>Gig Title *</label>
        <input
          type="text"
          placeholder="e.g. I will build a modern responsive React website"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Category */}
        <label>Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a Category</option>
          <option>Web Development</option>
          <option>Graphic Design</option>
          <option>Content Writing</option>
          <option>Video Editing</option>
          <option>Digital Marketing</option>
          <option>Music & Audio</option>
        </select>

        {/* Price & Delivery Time Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label>Price (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
            />
          </div>

          <div>
            <label>Delivery Time *</label>
            <select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              required
            >
              <option value="1 day">1 day</option>
              <option value="2 days">2 days</option>
              <option value="3 days">3 days</option>
              <option value="5 days">5 days</option>
              <option value="7 days">7 days</option>
              <option value="14 days">14 days</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <label>Gig Description (Optional)</label>
        <textarea
          rows="4"
          placeholder="Describe the deliverables, tools, and value you offer in this service..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "9px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            marginBottom: "16px",
            fontFamily: "inherit",
          }}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          id="publish-gig-btn"
          className="order-btn"
          style={{ width: "100%", marginTop: "16px" }}
        >
          {isSubmitting ? "Publishing to API..." : "Publish Gig 🚀"}
        </button>
      </form>
    </div>
  );
}

export default CreateGig;