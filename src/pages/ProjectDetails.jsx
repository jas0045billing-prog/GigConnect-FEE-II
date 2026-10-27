
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const API = "http://localhost:5000";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [project, setProject] = useState(null);
  const [existingProposal, setExistingProposal] = useState(null);
  const [form, setForm] = useState({
    proposedPrice: "",
    deliveryDays: "",
    coverLetter: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const projectResponse = await fetch(`${API}/projects/${id}`);
        if (!projectResponse.ok) {
          throw new Error("Project not found.");
        }

        const projectData = await projectResponse.json();

        let proposalData = [];
        if (currentUser?.role === "seller" || currentUser?.role === "freelancer") {
          const proposalResponse = await fetch(
            `${API}/proposals?projectId=${encodeURIComponent(id)}`
          );

          if (!proposalResponse.ok) {
            throw new Error("Could not check your existing proposal.");
          }

          proposalData = await proposalResponse.json();
        }

        if (cancelled) return;

        setProject(projectData);

        const myProposal = proposalData.find(
          (proposal) =>
            String(proposal.freelancerId) === String(currentUser?.id)
        );

        setExistingProposal(myProposal || null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load project.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id, currentUser?.id, currentUser?.role]);

  function updateField(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      navigate("/login", {
        state: {
          message: "Log in as a freelancer to submit a proposal.",
          redirectTo: `/projects/${id}`,
        },
      });
      return;
    }

    if (currentUser.role !== "seller" && currentUser.role !== "freelancer") {
      setError("Only freelancer accounts can submit proposals.");
      return;
    }

    if (!project || project.status !== "open") {
      setError("This project is no longer accepting proposals.");
      return;
    }

    if (existingProposal) {
      setError("You have already submitted a proposal for this project.");
      return;
    }

    const proposedPrice = Number(form.proposedPrice);
    const deliveryDays = Number(form.deliveryDays);

    if (
      !Number.isFinite(proposedPrice) ||
      proposedPrice <= 0 ||
      proposedPrice < Number(project.budgetMin) ||
      proposedPrice > Number(project.budgetMax)
    ) {
      setError(
        `Your proposed price must be between ₹${project.budgetMin} and ₹${project.budgetMax}.`
      );
      return;
    }

    if (
      !Number.isInteger(deliveryDays) ||
      deliveryDays < 1 ||
      deliveryDays > 365
    ) {
      setError("Enter a delivery estimate between 1 and 365 days.");
      return;
    }

    if (form.coverLetter.trim().length < 20) {
      setError("Please write at least 20 characters about your approach.");
      return;
    }

    const proposal = {
      projectId: project.id,
      freelancerId: currentUser.id,
      freelancerName: currentUser.name,
      proposedPrice,
      deliveryDays,
      coverLetter: form.coverLetter.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);

      const response = await fetch(`${API}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      });

      if (!response.ok) {
        throw new Error("The proposal could not be submitted.");
      }

      const savedProposal = await response.json();
      setExistingProposal(savedProposal);
      setSuccess("Proposal submitted successfully!");
      setForm({
        proposedPrice: "",
        deliveryDays: "",
        coverLetter: "",
      });
    } catch (err) {
      setError(err.message || "Unable to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="page"><p>Loading project details...</p></main>;
  }

  if (error && !project) {
    return (
      <main className="page">
        <div className="no-results">
          <h1>Unable to open project</h1>
          <p>{error}</p>
          <Link to="/projects">Back to projects</Link>
        </div>
      </main>
    );
  }

  if (!project) return null;

  const isOpen = project.status === "open";

  return (
    <main className="page project-details-page">
      <Link to="/projects" className="back-link">
        ← Back to Explore Projects
      </Link>

      <article className="project-detail-card">
        <div className="project-card-top">
          <span className={`project-status ${isOpen ? "" : "closed"}`}>
            {project.status}
          </span>
          <span>{project.category || "General"}</span>
        </div>

        <h1>{project.title}</h1>
        <p className="project-description">{project.description}</p>

        <div className="project-skills">
          {(project.skills || []).map((item) => (
            <span className="skill-chip" key={item}>{item}</span>
          ))}
        </div>

        <div className="project-meta">
          <p>
            <strong>Client</strong>
            <span>{project.clientName || "Client"}</span>
          </p>
          <p>
            <strong>Budget range</strong>
            <span>
              ₹{Number(project.budgetMin).toLocaleString()} – ₹
              {Number(project.budgetMax).toLocaleString()}
            </span>
          </p>
          <p>
            <strong>Deadline</strong>
            <span>{project.deadline || "Not specified"}</span>
          </p>
        </div>

        {project.requirements && (
          <section className="project-requirements">
            <h2>Requirements</h2>
            <p>{project.requirements}</p>
          </section>
        )}

        {project.status !== "open" && (
          <div className="alert-banner warning">
            This project is no longer accepting proposals.
          </div>
        )}

        {!currentUser && isOpen && (
          <p>
            <Link
              to="/login"
              state={{
                message: "Log in as a freelancer to apply.",
                redirectTo: `/projects/${id}`,
              }}
            >
              Log in
            </Link>{" "}
            to submit a proposal.
          </p>
        )}

        {(currentUser?.role === "client" || currentUser?.role === "buyer")&& (
          <p>Client accounts cannot submit freelancer proposals.</p>
        )}

        {existingProposal && (
          <div className="alert-banner success">
            <h2>Your proposal has been submitted</h2>
            <p>Proposed price: ₹{existingProposal.proposedPrice}</p>
            <p>Delivery: {existingProposal.deliveryDays} days</p>
            <p>Status: {existingProposal.status}</p>
            <Link to="/my-proposals">Track your proposals →</Link>
          </div>
        )}

        {(currentUser?.role === "seller" || currentUser?.role === "freelancer")&& isOpen && !existingProposal && (
          <section className="proposal-form-section">
            <h2>Submit Your Proposal</h2>
            <p>Offer a price and timeline that you can realistically deliver.</p>

            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p className="alert-banner success" role="status">{success}</p>}

            <form className="proposal-form" onSubmit={handleSubmit}>
              <label htmlFor="proposedPrice">Your price (₹) *</label>
              <input
                id="proposedPrice"
                name="proposedPrice"
                type="number"
                min={project.budgetMin}
                max={project.budgetMax}
                required
                value={form.proposedPrice}
                onChange={updateField}
              />

              <label htmlFor="deliveryDays">Delivery time (days) *</label>
              <input
                id="deliveryDays"
                name="deliveryDays"
                type="number"
                min="1"
                max="365"
                required
                value={form.deliveryDays}
                onChange={updateField}
              />

              <label htmlFor="coverLetter">Your proposal *</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows="5"
                minLength="20"
                maxLength="2000"
                required
                value={form.coverLetter}
                onChange={updateField}
                placeholder="Explain your experience, approach, and deliverables..."
              />

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Proposal"}
              </button>
            </form>
          </section>
        )}
      </article>
    </main>
  );
}

export default ProjectDetails;
