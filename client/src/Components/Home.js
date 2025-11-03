import React from "react";
import './Home.css'
import { Link } from "react-router-dom";

export default function Home(props) {
  return (
    <div>
      <section>
        <aside>
          <article>
            <div>GET</div>
            <div>Started</div>
            <div className="button">
              <Link className="btn1" to="/Register">Register</Link>
              <Link className="btn1" to="/Log in">Log in</Link>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

