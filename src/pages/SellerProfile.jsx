import { Link } from "react-router-dom";

function SellerProfile() {
  return (
    <div className="page seller-profile">
      <div className="profile-header">
        <div className="profile-avatar">AS</div>

        <div>
          <h1>Aman Singh</h1>
          <p>Full Stack Web Developer</p>
          <p>⭐ 4.9 (42 reviews)</p>
        </div>
      </div>

      <section className="profile-section">
        <h2>About Me</h2>
        <p>
          I am a passionate web developer specializing in React,
          JavaScript and modern web development. I help businesses
          build responsive and user-friendly websites.
        </p>
      </section>

      <section className="profile-section">
        <h2>Skills</h2>

        <div className="skills">
          <span>React</span>
          <span>JavaScript</span>
          <span>HTML</span>
          <span>CSS</span>
          <span>Node.js</span>
        </div>
      </section>

      <section className="profile-section">
        <h2>Experience</h2>
        <p>2+ years of freelance web development experience.</p>
      </section>

      <Link to="/explore" className="profile-btn">
        View My Gigs
      </Link>
    </div>
  );
}

export default SellerProfile;