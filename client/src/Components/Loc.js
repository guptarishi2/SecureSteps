import React, { useEffect, useState, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { API_BASE, SOCKET_URL } from '../config';

export default function Loc() {
  const socket = useMemo(() => io(SOCKET_URL), []); // Initialize socket connection
  const [loading, setLoading] = useState(false); // Loading state
  const [trackingLink, setTrackingLink] = useState(""); // Live-tracking link to share manually
  const { user, token } = useAuth(); // Get the authenticated user + JWT from context
  const lastPosRef = useRef(null); // Most recent {latitude, longitude}

  // Extract the user's phone number safely
  const userPhone = user?.phone;
  console.log("User's phone:", userPhone);

  useEffect(() => {
    let geoWatchId;

    const emitLocation = () => {
      if (userPhone && lastPosRef.current) {
        socket.emit("send-location", { ...lastPosRef.current, roomname: userPhone });
      }
    };

    if (navigator.geolocation) {
      // Watch the user's position in real-time
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          lastPosRef.current = { latitude, longitude };
          emitLocation();
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please check your browser's location settings.");
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }

    // Re-emit the last known position periodically so a viewer who opens the
    // tracking link later still receives it even when the sender is stationary.
    const interval = setInterval(emitLocation, 3000);

    // Cleanup on component unmount
    return () => {
      if (geoWatchId) {
        navigator.geolocation.clearWatch(geoWatchId); // Clear geolocation watcher
      }
      clearInterval(interval);
      socket.disconnect(); // Disconnect the socket
    };
  }, [socket, userPhone]);

  // Function to handle location sharing and fetch request
  const setLocation = async () => {
    setLoading(true);
    console.log("Sharing location for user:", userPhone);
  
    if (userPhone) {
      try {
        const resp = await fetch(
          `${API_BASE}/user/post-location`,
          {
            method: "POST",
            body: JSON.stringify({ userPhone }), // Send userPhone in request body
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );

        const data = await resp.json().catch(() => ({}));
        // Join the socket room whenever the server returns one, so live
        // location works even if the SMS/call could not be delivered.
        if (data.room) {
          socket.emit("join-room", { room: data.room });
          console.log("Joined room:", data.room);
        }
        if (data.trackingLink) {
          setTrackingLink(data.trackingLink);
        }

        if (resp.ok) {
          alert("Location is being shared with your emergency contacts!");
        } else {
          console.warn("post-location:", data);
          alert(
            data.message ||
              `Error sharing location (${resp.status}). Please try again.`
          );
        }
      } catch (error) {
        console.error("Error posting location:", error);
        alert(`Could not reach the server. ${error.message}`);
      }
    } else {
      console.log("User phone number not available.");
      alert("User phone number not available.");
    }
    setLoading(false);
  };
  useEffect(() => {
    // Handle socket connection event
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    return () => {
      // Clean up the socket event listener on component unmount
      socket.off("connect");
    };
  }, [socket]);

  // Render different UI based on whether user is authenticated
  if (user) {
    return (
      <div>
        <div className="body">
          <div className="nav1">
            <div className="logo3"></div>
          </div>
          <div className="section1">
            <div className="aside1">
              Protecting what matters the most <br /> your family's safety, anytime, anywhere.
              <div className="font1">Your location will be shared with your family</div>
              <button className="btn4 btn3" onClick={setLocation} disabled={loading}>
                {loading ? "Sharing..." : "Share Location"}
              </button>
              <div style={{ marginTop: 12 }}>
                <Link
                  to="/Emergency-Chat"
                  style={{
                    display: "inline-block",
                    background: "#5b6bf5",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  💬 Talk to Saheli
                </Link>
              </div>
              <div className="font1" style={{ marginTop: 12 }}>
                <Link to="/Details" style={{ color: "#fff", textDecoration: "underline" }}>
                  Update family details
                </Link>
              </div>
              {trackingLink && (
                <div className="font1" style={{ marginTop: 16, wordBreak: "break-all" }}>
                  Live tracking link (share with your contacts):
                  <br />
                  <a href={trackingLink} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
                    {trackingLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Please Login or Register</h1>
      </div>
    );
  }
}
