import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreateGig() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentUser) {
      setErrorMessage("Please log in before posting a project.");
      return;
    }

    if (
      !title.trim() ||
      !category ||
      !description.trim() ||
      !skills.trim() ||
      !budgetMin ||
      !budgetMax ||
      !deadline
    ) {
      setErrorMessage("Please fill in all the required fields.");
      return;
    }

    if (Number(budgetMin) <= 0 || Number(budgetMax) <= 0) {
      setErrorMessage("Budget must be greater than zero.");
      return;
    }

    if (Number(budgetMin) > Number(budgetMax)) {
      setErrorMessage(
        "Minimum budget cannot be greater than maximum budget."
      );
      return;
    }

    if (deadline < today) {
      setErrorMessage("Please select today or a future deadline.");
      return;
    }

    const newProject = {
      title: title.trim(),
      description: description.trim(),
      clientId: Number(currentUser.id),
      clientName: currentUser.name,
      category,
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== ""),
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline,
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProject),
        }
      );

      if (!response.ok) {
        throw new Error("Could not save the project.");
      }

      await response.json();

      setSuccessMessage("Your project was posted successfully!");

      setTitle("");
      setCategory("");
      setDescription("");
      setSkills("");
      setBudgetMin("");
      setBudgetMax("");
      setDeadline("");
    } catch (error) {
      console.error("Error posting project:", error);

      setErrorMessage(
        "Could not post your project. Please check that JSON Server is running on port 5000."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page create-gig">
      <div className="create-gig-header">
        <p className="section-label">CLIENT WORKSPACE</p>

        <h1>Post a Project</h1>

        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          Describe your project, set your budget, and find the right
          freelancer for your work.
        </p>
      </div>

      {currentUser && (
        <div className="seller-active-badge" style={{ marginBottom: "20px" }}>
          <span>
            👤 Posting as: <strong>{currentUser.name}</strong>
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            backgroundColor: "#dcfce7",
            color: "#166534",
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="gig-form">
        <label htmlFor="project-title">Project Title *</label>

        <input
          id="project-title"
          type="text"
          placeholder="e.g. Build a responsive React website"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
        />

        <label htmlFor="project-category">Category *</label>

        <select
          id="project-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Video Editing">Video Editing</option>
          <option value="Digital Marketing">Digital Marketing</option>
          <option value="Music & Audio">Music & Audio</option>
        </select>

        <label htmlFor="project-description">
          Project Description *
        </label>

        <textarea
          id="project-description"
          rows="5"
          placeholder="Explain what you need, the project requirements, and expected results..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
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

        <label htmlFor="project-skills">
          Required Skills *
        </label>

        <input
          id="project-skills"
          type="text"
          placeholder="e.g. React, JavaScript, CSS"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
        />

        <small
          style={{
            display: "block",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          Separate skills with commas.
        </small>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label htmlFor="budget-min">Minimum Budget (₹) *</label>

            <input
              id="budget-min"
              type="number"
              placeholder="e.g. 3000"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="budget-max">Maximum Budget (₹) *</label>

            <input
              id="budget-max"
              type="number"
              placeholder="e.g. 6000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              min="1"
              required
            />
          </div>
        </div>

        <label htmlFor="project-deadline">Project Deadline *</label>

        <input
          id="project-deadline"
          type="date"
          value={deadline}
          min={today}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          id="post-project-btn"
          className="order-btn"
          style={{
            width: "100%",
            marginTop: "16px",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Posting Project..." : "Post Project 🚀"}
        </button>
      </form>
    </div>
  );
}

export default CreateGig;