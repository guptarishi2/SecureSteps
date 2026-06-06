import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/authcontext';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:1042";

export default function Loc() {
  const socket = useMemo(() => io(SOCKET_URL), []); // Initialize socket connection
  const [loading, setLoading] = useState(false); // Loading state
  const { user, token } = useAuth(); // Get the authenticated user + JWT from context

  // Extract the user's phone number safely
  const userPhone = user?.phone;
  console.log("User's phone:", userPhone);

  useEffect(() => {
    let geoWatchId;

    if (navigator.geolocation) {
      // Watch the user's position in real-time
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log("Location received:", latitude, longitude);

          if (userPhone) {
            // Send the location to the server via socket
            socket.emit("send-location", { latitude, longitude, roomname: userPhone });
          }
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

    // Cleanup on component unmount
    return () => {
      if (geoWatchId) {
        navigator.geolocation.clearWatch(geoWatchId); // Clear geolocation watcher
      }
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
          `${process.env.REACT_APP_BACKEND_URL}/user/post-location`,
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
        if (resp.ok) {
          socket.emit("join-room", { room: userPhone });
          console.log("Joined room:", userPhone);
          alert("Location is being shared with your emergency contacts!");
        } else {
          console.log("Failed to post location.");
          alert(data.message || "Error sharing location. Please try again.");
        }
      } catch (error) {
        console.error("Error posting location:", error);
        alert("An error occurred while sharing location. Please try again.");
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
