import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(L.latLngBounds(positions), { padding: [22, 22] });
    else if (positions.length === 1) map.setView(positions[0], 15);
  }, [map, positions]);
  return null;
}

export default function RouteMap({ activity }) {
  const routeGeojson = activity.details?.routeGeojson;
  const positions = useMemo(() => (routeGeojson?.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]), [routeGeojson]);
  const fallback = [Number(activity.locationLat) || 52.2297, Number(activity.locationLng) || 21.0122];
  const start = positions[0] || fallback;
  const running = activity.activityType === 'running';
  const distance = activity.details?.actualDistanceKm || activity.details?.targetDistanceKm;
  return <div className="mini-map" aria-label="Mapa trasy OpenStreetMap">
    <MapContainer className="route-map-canvas" center={start} zoom={15} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <FitRoute positions={positions.length ? positions : [start]}/>
      {positions.length > 1 && <Polyline positions={positions} pathOptions={{ color:'#507f35', weight:5, opacity:.9 }}/>} 
      <CircleMarker center={start} radius={7} pathOptions={{ color:'#173a33', fillColor:'#c9f258', fillOpacity:1, weight:3 }}><Tooltip permanent direction="top">Start i meta</Tooltip></CircleMarker>
    </MapContainer>
    <span className="map-label">{running && distance ? `${distance} km · pętla OSRM` : activity.locationAddress}</span>
  </div>;
}
