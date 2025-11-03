import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import videoFile from './vid1.mp4';
import { useAuth } from "../context/authcontext";

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
      const resp = await fetch("http://localhost:1042/user/user-login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name, mobilenumber: phone }),
        headers: {
          "Content-Type": "application/json",  // Set the content type
        },
      });

      if (resp.ok) {
        alert("User login successful");
        login({ name, phone });  // Call login to set user context
        navigate("/details");  // Redirect to the details page
      } else {
        alert("Server Error");
      }
    } catch (e) {
      alert("Error occurred during login");
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
