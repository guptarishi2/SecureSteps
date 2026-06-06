import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import videoFile from './vid1.mp4';
import { useAuth } from "../context/authcontext";
import { API_BASE } from "../config";

// Video player component
function VideoPlayer() {
  return (
    <video width="600" loop autoPlay muted>
      <source src={videoFile} type="video/mp4" />
    </video>
  );
}

// Login component
export default function Log() {
  const { login } = useAuth(); // Get login function from context
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  // Form submission handler
  const HandleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior
    try {
      const resp = await fetch(`${API_BASE}/user/user-login`, {
        method: "POST",
        body: JSON.stringify({ name, mobilenumber: phone }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        alert("User login successful");
        login({ name, phone }, data.token);  // store user + JWT
        navigate("/Details");  // Redirect to the details page
      } else {
        alert(data.message || `Login failed (${resp.status})`);
      }
    } catch (e) {
      console.error("Login error:", e);
      alert(`Could not reach the server. ${e.message}`);
    }
  };

  return (
    <div>
      <div className="header">
        <div className="aside">
          <div className="container1">{VideoPlayer()}</div>
        </div>
        <div className="section img1">
          <div className="container3">
            <div className="heading">Log in</div>
            <form onSubmit={HandleSubmit} className="form">
              <div className="form1 form3">
                <div className="val1 mar">Name</div>
                <input
                  className="age mar wid"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="val3 mar">Phone</div>
                <input
                  className="age mar mar1 wid"
                  type="number"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button className="formsub1" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
