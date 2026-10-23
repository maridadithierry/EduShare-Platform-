import { useEffect, useState } from "react";
import {
  getResources,
  markResourceHelpful,
  type Resource,
} from "../services/resourcesApi";

const SUBJECT_OPTIONS = ["All", "Mathematics", "Science", "English", "ICT"];
const LEVEL_OPTIONS = ["All", "Primary", "Secondary", "University"];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subject, setSubject] = useState("All");
  const [level, setLevel] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingForId, setVotingForId] = useState<number | null>(null);

  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        setError(null);
        const data = await getResources({
          subject: subject === "All" ? undefined : subject,
          level: level === "All" ? undefined : level,
        });
        setResources(data);
      } catch {
        setError("Could not load resources right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [subject, level]);

  async function handleHelpfulVote(resourceId: number) {
    try {
      setVotingForId(resourceId);
      const updated = await markResourceHelpful(resourceId);
      setResources((current) =>
        current
          .map((resource) =>
            resource.id === updated.id ? { ...resource, helpfulCount: updated.helpfulCount } : resource,
          )
          .sort((a, b) => b.helpfulCount - a.helpfulCount),
      );
    } catch {
      setError("Voting failed. Please try again.");
    } finally {
      setVotingForId(null);
    }
  }

  return (
    <section className="container page resources-page">
      <h1>Resources</h1>
      <p className="resources-intro">
        Browse practical study resources shared for African learners.
      </p>

      <div className="filters">
        <label>
          Subject
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Level
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="state-message">Loading resources...</p>}
      {error && <p className="state-message state-message--error">{error}</p>}

      {!loading && !error && resources.length === 0 && (
        <p className="state-message">No resources match your current filters.</p>
      )}

      {!loading && !error && resources.length > 0 && (
        <div className="resources-grid">
          {resources.map((resource) => (
            <article className="resource-card" key={resource.id}>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <ul>
                <li>
                  <strong>Subject:</strong> {resource.subject}
                </li>
                <li>
                  <strong>Level:</strong> {resource.level}
                </li>
                <li>
                  <strong>Language:</strong> {resource.language}
                </li>
              </ul>
              <div className="resource-card__actions">
                <span>Helpful: {resource.helpfulCount}</span>
                <button
                  onClick={() => handleHelpfulVote(resource.id)}
                  disabled={votingForId === resource.id}
                >
                  {votingForId === resource.id ? "Saving..." : "Helpful"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}