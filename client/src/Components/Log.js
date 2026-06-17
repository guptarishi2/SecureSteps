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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Form submission handler
  const HandleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior
    try {
      const resp = await fetch(`${API_BASE}/user/user-login`, {
        method: "POST",
        body: JSON.stringify({ mobilenumber: phone, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        alert(data.message || `Login failed (${resp.status})`);
        return;
      }

      alert("User login successful");
      const name = data.user?.name || "";
      login({ name, phone }, data.token);  // store user + JWT

      // Family details are filled only once. If the user already has them
      // saved, skip the Details form and go straight to sharing location.
      if (!data.token) {
        navigate("/Details");
        return;
      }
      try {
        const detailResp = await fetch(`${API_BASE}/user/user-detail`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        const detailData = await detailResp.json().catch(() => ({}));
        if (detailResp.ok) {
          // Only a definitive answer routes the user: send first-timers to the
          // form, returning users straight to Share-Location.
          navigate(detailData.exists ? "/Share-Location" : "/Details");
        } else {
          // Server/network error: we can't tell, so don't force a returning user
          // to re-fill. Share-Location guards itself if details are missing.
          navigate("/Share-Location");
        }
      } catch (err) {
        // Same reasoning for an outright fetch failure — avoid a needless re-fill.
        console.error("Detail check error:", err);
        navigate("/Share-Location");
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
                <div className="val3 mar">Phone</div>
                <input
                  className="age mar wid"
                  type="number"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="val3 mar">Password</div>
                <input
                  className="age mar mar1 wid"
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
