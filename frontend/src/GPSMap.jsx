
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import { useEffect } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}
export default function GPSMap({ alerts = [], device }) {
  const locatedAlerts = alerts.filter(
    (alert) =>
      Number.isFinite(Number(alert.latitude)) &&
      Number.isFinite(Number(alert.longitude)) &&
      alert.latitude !== null &&
      alert.longitude !== null
  );

  const latest = locatedAlerts[0];
  


const deviceLat = Number(device?.lastLocation?.latitude);
const deviceLng = Number(device?.lastLocation?.longitude);

const hasDeviceLocation =
  device?.lastLocation?.latitude != null &&
  device?.lastLocation?.longitude != null &&
  Number.isFinite(deviceLat) &&
  Number.isFinite(deviceLng);

const center = hasDeviceLocation
  ? [deviceLat, deviceLng]
  : latest
    ? [Number(latest.latitude), Number(latest.longitude)]
    : [19.174581, 73.241406];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "320px", width: "100%" }}
      >
        <RecenterMap center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasDeviceLocation && (
  <Marker
    position={[deviceLat, deviceLng]}
    icon={markerIcon}
  >
    <Popup>
      <strong>Current Vehicle Location</strong>
      <br />
      Device: {device.deviceId}
      <br />
      Vehicle: {device.vehicleNumber}
      <br />
      Latitude: {deviceLat}
      <br />
      Longitude: {deviceLng}
    </Popup>
  </Marker>
)}
        {locatedAlerts.map((alert) => (
          <Marker
            key={alert._id}
            position={[Number(alert.latitude), Number(alert.longitude)]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{alert.alertType || "accident"}</strong>
              <br />
              Vehicle: {alert.vehicleNumber}
              <br />
              Status: {alert.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <p className="bg-slate-950 px-4 py-3 text-xs text-slate-400">
        {locatedAlerts.length > 0
          ? `${locatedAlerts.length} alert location(s) available`
          : "No GPS coordinates available yet."}
      </p>
    </div>
  );
}

