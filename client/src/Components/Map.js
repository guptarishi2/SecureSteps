import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "../App.css"; // Assuming you have CSS for the map container

const Location = () => {
  const { id } = useParams(); // Extract id from URL params
  const socket = useMemo(() => io("http://localhost:1890"), []); // Initialize socket connection
  const [latitude, setLatitude] = useState(0); // Latitude state
  const [longitude, setLongitude] = useState(0); // Longitude state

  console.log("Room:", id); // For debugging

  useEffect(() => {
    // Emit event to join the id on socket connection
    socket.emit("join-room", { room:id });
    console.log("Joined id:", id);

    // Listen for location updates from the server
    socket.on("receive-location", (data) => {
      const { latitude, longitude } = data;
      console.log("Location received:", latitude, longitude);
      setLatitude(latitude);
      setLongitude(longitude);
    });

    // Cleanup function to remove event listener and disconnect socket on unmount
    return () => {
      socket.off("receive-location"); // Remove location listener
      socket.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, [socket , id]); // Dependencies: socket and id

  return (
    <div>
      <h1>Real-time Location Tracker</h1>

      {/* Display the current latitude and longitude */}
      <p>Longitude: {longitude}</p>
      <p>Latitude: {latitude}</p>

      {/* Render the map with a marker at the current location */}
      <MapContainer center={[latitude, longitude]} zoom={19} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
    </div>
  );
};

export default Location;
