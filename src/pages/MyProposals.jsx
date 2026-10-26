
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000";

function MyProposals() {
  const { currentUser } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [proposalResponse, projectResponse, assignmentResponse] =
        await Promise.all([
          fetch(
            `${API}/proposals?freelancerId=${encodeURIComponent(currentUser.id)}`
          ),
          fetch(`${API}/projects`),
          fetch(
            `${API}/assignments?freelancerId=${encodeURIComponent(currentUser.id)}`
          ),
        ]);

      if (
        !proposalResponse.ok ||
        !projectResponse.ok ||
        !assignmentResponse.ok
      ) {
        throw new Error("Unable to load proposal information.");
      }

      const [proposalData, projectData, assignmentData] =
        await Promise.all([
          proposalResponse.json(),
          projectResponse.json(),
          assignmentResponse.json(),
        ]);

      setProposals(proposalData);
      setProjects(projectData);
      setAssignments(assignmentData);
    } catch (err) {
      setError(err.message || "Could not load your proposals.");
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <main className="page"><p>Loading your proposals...</p></main>;
  }

  if (error) {
    return (
      <main className="page">
        <div className="no-results">
          <h1>Could not load proposals</h1>
          <p>{error}</p>
          <button className="order-btn" onClick={loadData}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const sortedProposals = [...proposals].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return (
    <main className="page my-proposals-page">
      <div className="explore-header">
        <p className="section-label">FREELANCER WORKSPACE</p>
        <h1>My Proposals</h1>
        <p>Track the proposals you have sent to clients.</p>
      </div>

      <div className="proposal-summary">
        <div>
          <strong>{proposals.length}</strong>
          <span>Total proposals</span>
        </div>
        <div>
          <strong>
            {proposals.filter((p) => p.status === "pending").length}
          </strong>
          <span>Pending</span>
        </div>
        <div>
          <strong>
            {proposals.filter((p) => p.status === "accepted").length}
          </strong>
          <span>Accepted</span>
        </div>
        <div>
          <strong>
            {proposals.filter((p) => p.status === "rejected").length}
          </strong>
          <span>Rejected</span>
        </div>
      </div>

      {sortedProposals.length === 0 ? (
        <div className="no-results">
          <h2>You haven't submitted any proposals yet</h2>
          <p>Explore projects and apply for work that matches your skills.</p>
          <Link to="/projects" className="project-action">
            Explore Projects →
          </Link>
        </div>
      ) : (
        <div className="project-grid">
          {sortedProposals.map((proposal) => {
            const project = projects.find(
              (item) =>
                String(item.id) === String(proposal.projectId)
            );

            const assignment = assignments.find(
              (item) =>
                String(item.proposalId) === String(proposal.id)
            );

            return (
              <article className="project-card" key={proposal.id}>
                <div className="project-card-top">
                  <span
                    className={`proposal-status ${proposal.status}`}
                  >
                    {proposal.status}
                  </span>
                  {project && (
                    <span className="project-status">
                      {project.status}
                    </span>
                  )}
                </div>

                <h2>{project?.title || `Project #${proposal.projectId}`}</h2>

                {project?.description && (
                  <p className="project-description">
                    {project.description}
                  </p>
                )}

                <div className="project-meta">
                  <p>
                    <strong>Your price</strong>
                    <span>
                      ₹{Number(proposal.proposedPrice).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <strong>Your delivery estimate</strong>
                    <span>{proposal.deliveryDays} days</span>
                  </p>
                  <p>
                    <strong>Submitted</strong>
                    <span>
                      {proposal.createdAt
                        ? new Date(proposal.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </p>
                  {assignment && (
                    <p>
                      <strong>Assignment</strong>
                      <span>{assignment.status}</span>
                    </p>
                  )}
                </div>

                <p className="proposal-cover-letter">
                  {proposal.coverLetter}
                </p>

                {project && (
                  <Link
                    to={`/projects/${project.id}`}
                    className="project-action"
                  >
                    View Project →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default MyProposals;
