
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function MyProjects() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectResponse, proposalResponse] = await Promise.all([
          fetch("http://localhost:5000/projects"),
          fetch("http://localhost:5000/proposals"),
        ]);

        if (!projectResponse.ok || !proposalResponse.ok) {
          throw new Error("Unable to load projects.");
        }

        const projectData = await projectResponse.json();
        const proposalData = await proposalResponse.json();

        const myProjects = projectData.filter(
          (project) =>
            String(project.clientId) === String(currentUser?.id)
        );

        setProjects(myProjects);
        setProposals(proposalData);
      } catch (err) {
        console.error(err);
        setError(
          "Could not load projects. Please check that JSON Server is running."
        );
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div className="page"><h2>Please log in to view your projects.</h2></div>;
  }

  if (loading) {
    return <div className="page"><p>Loading your projects...</p></div>;
  }

  if (error) {
    return <div className="page"><p>{error}</p></div>;
  }

  return (
    <div className="page">
      <div className="create-gig-header">
        <p className="section-label">CLIENT WORKSPACE</p>
        <h1>My Projects</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage your projects and review freelancer proposals.
        </p>
      </div>

      {projects.length === 0 ? (
        <div>
          <p>You haven't posted any projects yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
          {projects.map((project) => {
            const projectProposals = proposals.filter(
              (proposal) =>
                String(proposal.projectId) === String(project.id)
            );

            return (
              <div
                key={project.id}
                style={{
                  padding: "20px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-input)",
                }}
              >
                <h2>{project.title}</h2>

                <p>{project.description}</p>

                <p><strong>Category:</strong> {project.category}</p>

                <p>
                  <strong>Budget:</strong> ₹{project.budgetMin} – ₹
                  {project.budgetMax}
                </p>

                <p><strong>Deadline:</strong> {project.deadline}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  {project.status.replace("_", " ")}
                </p>

                <p>
                  <strong>Proposals received:</strong>{" "}
                  {projectProposals.length}
                </p>

                <p>
                  <strong>Required skills:</strong>{" "}
                  {project.skills.join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyProjects;
