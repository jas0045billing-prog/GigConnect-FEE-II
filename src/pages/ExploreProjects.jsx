
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

function ExploreProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/projects`);
        if (!response.ok) {
          throw new Error("Unable to fetch projects.");
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message || "Could not load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const availableSkills = useMemo(
    () => [
      ...new Set(
        projects.flatMap((project) =>
          Array.isArray(project.skills) ? project.skills : []
        )
      ),
    ].sort(),
    [projects]
  );

  const filteredProjects = projects.filter((project) => {
    if (project.status !== "open") return false;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      (project.skills || []).some((item) =>
        item.toLowerCase().includes(query)
      );

    const matchesSkill =
      !skill || (project.skills || []).includes(skill);

    return matchesSearch && matchesSkill;
  });

  return (
    <main className="page projects-page">
      <div className="explore-header">
        <p className="section-label">FREELANCER WORKSPACE</p>
        <h1>Explore Projects</h1>
        <p>
          Discover client requirements, compare budgets, and submit
          a proposal for work that matches your skills.
        </p>
      </div>

      <div className="project-filters">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects, skills, or category..."
          aria-label="Search projects"
        />

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          aria-label="Filter by skill"
        >
          <option value="">All skills</option>
          {availableSkills.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="order-btn"
          onClick={() => {
            setSearch("");
            setSkill("");
          }}
        >
          Reset
        </button>
      </div>

      {loading && <p>Loading available projects...</p>}

      {!loading && error && (
        <div className="no-results">
          <h2>Could not load projects</h2>
          <p>{error}</p>
          <p>Check that `npm run server` is running.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <h2 className="project-result-count">
            {filteredProjects.length} open project(s)
          </h2>

          {filteredProjects.length === 0 ? (
            <div className="no-results">
              <h2>No matching projects</h2>
              <p>Try another search or reset the filters.</p>
            </div>
          ) : (
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-card-top">
                    <span className="project-status">Open</span>
                    <span>{project.category || "General"}</span>
                  </div>

                  <h2>{project.title}</h2>
                  <p className="project-description">
                    {project.description}
                  </p>

                  <div className="project-skills">
                    {(project.skills || []).map((item) => (
                      <span className="skill-chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="project-meta">
                    <p>
                      <strong>Budget</strong>
                      <span>
                        ₹{Number(project.budgetMin).toLocaleString()} –
                        ₹{Number(project.budgetMax).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      <strong>Deadline</strong>
                      <span>{project.deadline || "Not specified"}</span>
                    </p>
                    <p>
                      <strong>Client</strong>
                      <span>{project.clientName || "Client"}</span>
                    </p>
                  </div>

                  <Link
                    className="project-action"
                    to={`/projects/${project.id}`}
                  >
                    View Details & Apply →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default ExploreProjects;
