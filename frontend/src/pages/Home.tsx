import { Link } from "react-router-dom";

const features = [
  { title: "Browse", text: "Explore learning materials shared by students and teachers." },
  { title: "Search", text: "Find resources quickly by title or subject." },
  { title: "Share", text: "Add your own resources so others can learn too." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Sharing Knowledge, Empowering African Students</h1>
          <p>
            EduShare is a simple platform where students can find and share
            affordable learning resources.
          </p>
          <Link to="/resources" className="btn">
            Explore Resources
          </Link>
        </div>
      </section>

      <section className="container features">
        {features.map((f) => (
          <div className="card" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}