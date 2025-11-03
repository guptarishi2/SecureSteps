import React, { useState } from 'react';
import { Form } from 'react-router-dom';
import videoFile from './vid1.mp4';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
function VideoPlayer() {
  return (
    <video width="600" loop autoPlay muted>
      <source src={videoFile} type="video/mp4" />
    </video>
  );
}

export default function Reg() {
  const {login} = useAuth()
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [checkbox, setCheckbox] = useState(false);
const navigate = useNavigate()
  const HandleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior
    try {
      if (checkbox) {
        const resp = await fetch("http://localhost:1042/user/user-register", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ name, mobilenumber: phone, age }),
          headers: {
            "Content-Type": "application/json",  // Corrected headers
          },
        });

        if (resp.ok) {
          alert("User registration successful");
          login({name , phone})
          navigate("/details")
        } else {
          alert("Server Error");
        }
      } else {
        alert("Please agree to the terms and conditions");
      }
    } catch (e) {
      alert("Error occurred");
    }
  };

  return (
    <div>
      <div className="header">
        <div className='aside'>
          <div className="container1">
            <VideoPlayer />
          </div>
        </div>
        <div className="section img1">
          <div className="container2">
            <div className="heading">Register</div>
            <form className="form" onSubmit={HandleSubmit}>
              <div className="form1">
                <div className="val1">Name</div>
                <div className="val2">Phone</div>
              </div>

              <input
                className="age"
                type="text"
                id="fname"
                name="fname"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="age2 age"
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              /><br /><br />
              <input
                className="age1 age"
                type="text"
                id="age"
                name="age"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              /><br /><br />

              <div className="em">
                <input
                  type="checkbox"
                  className="tick"
                  checked={checkbox}
                  onChange={() => setCheckbox(!checkbox)}
                />
                <div className="tor">
                  I agree with Stayfree Terms of Service, Privacy, and Policy, and default Notification Setting
                </div>
              </div>

              <button className="formsub" type="submit">
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
