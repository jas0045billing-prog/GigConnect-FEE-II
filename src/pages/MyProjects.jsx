import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import "./MyProjects.css";

const API = "http://localhost:5000";

function MyProjects() {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingProject, setSavingProject] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchData() {
    const [projectRes, proposalRes] = await Promise.all([
      fetch(`${API}/projects`),
      fetch(`${API}/proposals`),
    ]);

    if (!projectRes.ok || !proposalRes.ok) {
      throw new Error("Unable to load your projects.");
    }

    const allProjects = await projectRes.json();
    const allProposals = await proposalRes.json();

    setProjects(
      allProjects.filter(
        (project) =>
          String(project.clientId) === String(currentUser?.id)
      )
    );

    setProposals(allProposals);
  }

  
  useEffect(() => {
  if (!currentUser) {
    return;
  }

  let cancelled = false;

  async function load() {
    try {
      setError("");

      const [projectRes, proposalRes] = await Promise.all([
        fetch(`${API}/projects`),
        fetch(`${API}/proposals`),
      ]);

      if (!projectRes.ok || !proposalRes.ok) {
        throw new Error("Unable to load your projects.");
      }

      const allProjects = await projectRes.json();
      const allProposals = await proposalRes.json();

      if (cancelled) return;

      setProjects(
        allProjects.filter(
          (project) =>
            String(project.clientId) === String(currentUser.id)
        )
      );
      setProposals(allProposals);
    } catch (err) {
      if (cancelled) return;

      console.error(err);
      setError(
        "Could not load projects. Make sure JSON Server is running on port 5000."
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
    }

  load();

  return () => {
    cancelled = true;
  };
}, [currentUser]);


  function startEditing(project) {
    if ((project.status || "open") !== "open") {
      setError("Only open projects can be edited.");
      return;
    }

    setError("");
    setMessage("");
    setEditingProject(project.id);

    setEditForm({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "Web Development",
      budgetMin: project.budgetMin ?? "",
      budgetMax: project.budgetMax ?? "",
      deadline: project.deadline || "",
      skills: (project.skills || []).join(", "),
    });
  }

  async function handleSaveProject(event, project) {
    event.preventDefault();

    if (savingProject) return;

    if (String(project.clientId) !== String(currentUser?.id)) {
      setError("You cannot edit another client's project.");
      return;
    }

    if ((project.status || "open") !== "open") {
      setError("Only open projects can be edited.");
      return;
    }

    const minBudget = Number(editForm.budgetMin);
    const maxBudget = Number(editForm.budgetMax);

    if (
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !editForm.category.trim() ||
      !editForm.deadline ||
      !editForm.skills.trim()
    ) {
      setError("Please fill in all project fields.");
      return;
    }

    if (
      !Number.isFinite(minBudget) ||
      !Number.isFinite(maxBudget) ||
      minBudget <= 0 ||
      maxBudget < minBudget
    ) {
      setError("Enter a valid budget range.");
      return;
    }

    const skills = editForm.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setError("Please enter at least one required skill.");
      return;
    }

    setSavingProject(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category.trim(),
          budgetMin: minBudget,
          budgetMax: maxBudget,
          deadline: editForm.deadline,
          skills,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not update the project.");
      }

      await fetchData();
      setEditingProject(null);
      setMessage("Project updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update the project.");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleDeleteProject(project) {
    if (String(project.clientId) !== String(currentUser?.id)) {
      setError("You cannot delete another client's project.");
      return;
    }

    if ((project.status || "open") !== "open") {
      setError("Assigned projects cannot be deleted here.");
      return;
    }

    const hasAcceptedProposal = proposals.some(
      (proposal) =>
        String(proposal.projectId) === String(project.id) &&
        proposal.status === "accepted"
    );

    if (hasAcceptedProposal) {
      setError(
        "This project has an accepted proposal and cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(project.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the project.");
      }

      // Remove associated proposals from the database as well.
      const relatedProposals = proposals.filter(
        (proposal) =>
          String(proposal.projectId) === String(project.id)
      );

      const cleanupResults = await Promise.all(
        relatedProposals.map((proposal) =>
          fetch(`${API}/proposals/${proposal.id}`, {
            method: "DELETE",
          })
        )
      );

      setProjects((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(project.id)
        )
      );

      setProposals((previous) =>
        previous.filter(
          (item) => String(item.projectId) !== String(project.id)
        )
      );

      if (String(editingProject) === String(project.id)) {
        setEditingProject(null);
      }

      if (cleanupResults.some((result) => !result.ok)) {
        setMessage(
          "Project deleted, but some related proposals could not be removed."
        );
      } else {
        setMessage("Project and its proposals deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete the project.");

      try {
        await fetchData();
      } catch (refreshError) {
        console.error(refreshError);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleProposalAction(proposal, project, action) {
    if (busyId !== null) return;

    const isAccept = action === "accepted";
    const actionLabel = isAccept ? "accept" : "reject";

    if (
      proposal.status !== "pending" ||
      (project.status || "open") !== "open"
    ) {
      setError("This proposal can no longer be changed.");
      return;
    }

    if (String(project.clientId) !== String(currentUser?.id)) {
      setError("You cannot manage proposals for another client's project.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${proposal.freelancerName}'s proposal?`
    );

    if (!confirmed) return;

    setBusyId(proposal.id);
    setError("");
    setMessage("");

    try {
      if (isAccept) {
        const projectRes = await fetch(`${API}/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "assigned" }),
        });

        if (!projectRes.ok) {
          throw new Error("Could not update the project.");
        }
      }

      const proposalRes = await fetch(
        `${API}/proposals/${proposal.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!proposalRes.ok) {
        throw new Error("Could not update this proposal.");
      }

      if (isAccept) {
        const otherPending = proposals.filter(
          (item) =>
            String(item.projectId) === String(project.id) &&
            String(item.id) !== String(proposal.id) &&
            (item.status || "pending") === "pending"
        );

        const results = await Promise.all(
          otherPending.map((item) =>
            fetch(`${API}/proposals/${item.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "rejected" }),
            })
          )
        );

        if (results.some((res) => !res.ok)) {
          throw new Error(
            "Proposal accepted, but some other proposals could not be updated."
          );
        }
      }

      await fetchData();

      setMessage(
        isAccept
          ? "Proposal accepted successfully!"
          : "Proposal rejected."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");

      try {
        await fetchData();
      } catch (refreshError) {
        console.error(refreshError);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (!currentUser) {
    return (
      <main className="page my-projects-page">
        <div className="projects-empty">
          <h2>Please log in to view your projects.</h2>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page my-projects-page">
        <p className="projects-notice">Loading your projects...</p>
      </main>
    );
  }

  return (
    <main className="page my-projects-page">
      <section className="projects-hero">
        <div>
          <span className="projects-eyebrow">CLIENT WORKSPACE</span>
          <h1>My Projects</h1>
          <p>
            Track your projects, compare freelancer proposals, and choose the
            right person for your work.
          </p>
        </div>

        <div className="projects-total">
          <span>Projects posted</span>
          <strong>{projects.length}</strong>
        </div>
      </section>

      {error && (
        <div className="projects-alert projects-alert-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="projects-alert projects-alert-success" role="status">
          {message}
        </div>
      )}

      {projects.length === 0 ? (
        <section className="projects-empty">
          <div className="projects-empty-icon">✦</div>
          <h2>No projects yet</h2>
          <p>
            Projects you post will appear here, along with proposals from
            interested freelancers.
          </p>
        </section>
      ) : (
        <section className="projects-list">
          {projects.map((project) => {
            const projectProposals = proposals.filter(
              (proposal) =>
                String(proposal.projectId) === String(project.id)
            );

            const isOpen = (project.status || "open") === "open";
            const isEditing =
              String(editingProject) === String(project.id);

            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <div className="project-heading">
                    <span className="project-category">
                      {project.category || "General"}
                    </span>
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                  </div>

                  <div className="project-management-actions">
                    <span
                      className={`project-status ${
                        isOpen ? "status-open" : "status-assigned"
                      }`}
                    >
                      {(project.status || "open").replaceAll("_", " ")}
                    </span>

                    {isOpen && (
                      <>
                        <button
                          type="button"
                          className="project-edit-btn"
                          onClick={() =>
                            isEditing
                              ? setEditingProject(null)
                              : startEditing(project)
                          }
                        >
                          {isEditing ? "Cancel editing" : "Edit project"}
                        </button>

                        <button
                          type="button"
                          className="project-delete-btn"
                          disabled={busyId !== null}
                          onClick={() => handleDeleteProject(project)}
                        >
                          {busyId === project.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <form
                    className="project-edit-form"
                    onSubmit={(event) =>
                      handleSaveProject(event, project)
                    }
                  >
                    <h3>Edit project details</h3>

                    <label>
                      Project title
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            title: event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            description: event.target.value,
                          })
                        }
                        rows={4}
                        required
                      />
                    </label>

                    <label>
                      Category
                      <select
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            category: event.target.value,
                          })
                        }
                        required
                      >
                        <option value="Web Development">
                          Web Development
                        </option>
                        <option value="Graphic Design">
                          Graphic Design
                        </option>
                        <option value="Content Writing">
                          Content Writing
                        </option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Digital Marketing">
                          Digital Marketing
                        </option>
                        <option value="Music & Audio">Music & Audio</option>
                      </select>
                    </label>

                    <div className="project-edit-grid">
                      <label>
                        Minimum budget (₹)
                        <input
                          type="number"
                          min="1"
                          value={editForm.budgetMin}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              budgetMin: event.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <label>
                        Maximum budget (₹)
                        <input
                          type="number"
                          min="1"
                          value={editForm.budgetMax}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              budgetMax: event.target.value,
                            })
                          }
                          required
                        />
                      </label>
                    </div>

                    <label>
                      Deadline
                      <input
                        type="date"
                        value={editForm.deadline}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            deadline: event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label>
                      Required skills (comma-separated)
                      <input
                        value={editForm.skills}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            skills: event.target.value,
                          })
                        }
                        placeholder="React, HTML, CSS"
                        required
                      />
                    </label>

                    <div className="project-management-actions">
                      <button
                        type="button"
                        className="project-cancel-btn"
                        onClick={() => setEditingProject(null)}
                        disabled={savingProject}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="project-edit-btn"
                        disabled={savingProject}
                      >
                        {savingProject ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="project-stats">
                  <div className="project-stat">
                    <span>Budget range</span>
                    <strong>
                      ₹{Number(project.budgetMin || 0).toLocaleString("en-IN")}
                      {" – "}
                      ₹{Number(project.budgetMax || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="project-stat">
                    <span>Deadline</span>
                    <strong>{project.deadline || "Not specified"}</strong>
                  </div>

                  <div className="project-stat">
                    <span>Proposals</span>
                    <strong>{projectProposals.length} received</strong>
                  </div>
                </div>

                <div className="project-skills">
                  <span>Required skills</span>
                  <div className="skill-list">
                    {(project.skills || []).map((skill) => (
                      <span className="skill-chip" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="proposal-section">
                  <div className="proposal-section-heading">
                    <div>
                      <h3>Freelancer proposals</h3>
                      <p>
                        Review offers and decide who should do the work.
                      </p>
                    </div>

                    <span className="proposal-count">
                      {projectProposals.length}
                    </span>
                  </div>

                  {projectProposals.length === 0 ? (
                    <div className="proposal-empty">
                      No proposals yet. Freelancers' offers will appear here.
                    </div>
                  ) : (
                    <div className="proposal-list">
                      {projectProposals.map((proposal) => {
                        const status = proposal.status || "pending";
                        const pending = status === "pending";

                        return (
                          <article
                            className="proposal-card"
                            key={proposal.id}
                          >
                            <div className="proposal-card-heading">
                              <div className="freelancer-avatar">
                                {(proposal.freelancerName || "F")
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="freelancer-details">
                                <h4>
                                  {proposal.freelancerName || "Freelancer"}
                                </h4>
                                <span>Freelancer proposal</span>
                              </div>

                              <span
                                className={`proposal-status status-${status}`}
                              >
                                {status}
                              </span>
                            </div>

                            <div className="proposal-offer">
                              <div>
                                <span>Proposed price</span>
                                <strong>
                                  ₹
                                  {Number(
                                    proposal.proposedPrice || 0
                                  ).toLocaleString("en-IN")}
                                </strong>
                              </div>

                              <div>
                                <span>Delivery time</span>
                                <strong>
                                  {proposal.deliveryDays} days
                                </strong>
                              </div>
                            </div>

                            <div className="proposal-cover-letter">
                              <span>Cover letter</span>
                              <p>
                                {proposal.coverLetter ||
                                  "No cover letter provided."}
                              </p>
                            </div>

                            {pending && isOpen && (
                              <div className="proposal-actions">
                                <button
                                  className="proposal-btn proposal-btn-reject"
                                  type="button"
                                  disabled={busyId !== null}
                                  onClick={() =>
                                    handleProposalAction(
                                      proposal,
                                      project,
                                      "rejected"
                                    )
                                  }
                                >
                                  {busyId === proposal.id
                                    ? "Please wait..."
                                    : "Reject"}
                                </button>

                                <button
                                  className="proposal-btn proposal-btn-accept"
                                  type="button"
                                  disabled={busyId !== null}
                                  onClick={() =>
                                    handleProposalAction(
                                      proposal,
                                      project,
                                      "accepted"
                                    )
                                  }
                                >
                                  {busyId === proposal.id
                                    ? "Please wait..."
                                    : "Accept proposal"}
                                </button>
                              </div>
                            )}

                            {!isOpen && pending && (
                              <p className="proposal-locked">
                                This project is no longer open for proposals.
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyProjects;
