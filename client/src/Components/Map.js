import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "../App.css";
import { SOCKET_URL } from "../config";

// Fix the default marker icon, whose image paths break under CRA/webpack
// (otherwise the marker is invisible).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // India, shown until the first fix

// Keeps the map centered on the latest position. MapContainer's `center` prop
// is only applied on mount, so we move the view imperatively on updates.
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

const Location = () => {
  const { id } = useParams(); // room id from the URL (the user's digits)
  const socket = useMemo(() => io(SOCKET_URL), []);
  const [position, setPosition] = useState(null); // [lat, lng] or null until first update

  useEffect(() => {
    const join = () => socket.emit("join-room", { room: id });
    join();
    socket.on("connect", join); // re-join if the socket reconnects

    socket.on("receive-location", ({ latitude, longitude }) => {
      if (typeof latitude === "number" && typeof longitude === "number") {
        setPosition([latitude, longitude]);
      }
    });

    return () => {
      socket.off("connect", join);
      socket.off("receive-location");
      socket.disconnect();
    };
  }, [socket, id]);

  return (
    <div>
      <h1>Real-time Location Tracker</h1>
      {position ? (
        <p>Latitude: {position[0]} &nbsp; Longitude: {position[1]}</p>
      ) : (
        <p>Waiting for live location… (keep this page open)</p>
      )}

      <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 18 : 5} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker position={position}>
            <Popup>Current location</Popup>
          </Marker>
        )}
        <Recenter position={position} />
      </MapContainer>
    </div>
  );
};

export default Location;
