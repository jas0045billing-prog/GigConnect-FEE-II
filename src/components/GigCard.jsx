import { Link } from "react-router-dom";

function GigCard({ gig }) {
  return (
    <div className="gig-card">
      <img src={gig.image} alt={gig.title} />

      <div className="gig-content">
        <p className="category">{gig.category}</p>

        <h3>{gig.title}</h3>

        <p>By {gig.seller}</p>

        <p>
          ⭐ {gig.rating} ({gig.reviews})
        </p>

        <div className="gig-bottom">
          <span>From ₹{gig.price}</span>

          <Link to={`/gig/${gig.id}`}>
            View Gig
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GigCard;