import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          Edu<span>Share</span>
        </NavLink>
        <nav className="navbar__links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/resources">Resources</NavLink>
        </nav>
      </div>
    </header>
  );
}