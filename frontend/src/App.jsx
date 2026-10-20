import { useState } from "react";
import Login from "./Login";
import { useEffect } from "react";
import api from "./api/axios";
import "leaflet/dist/leaflet.css";
import GPSMap from "./GPSMap";
import {
  Activity,
  AlertTriangle,
  Bell,
  CarFront,
  CheckCircle2,
  Cloud,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Radio,
  ShieldCheck,
  Thermometer,
  Wind,
  LifeBuoy,
  Clock3,
  ArrowUpRight,
} from "lucide-react";


const alerts = [
];

function StatCard({ title, value, note, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
      <h3 className="mt-5 text-3xl font-bold tracking-tight">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function SensorCard({ title, value, unit, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-800 p-3 text-cyan-400">
          <Icon size={21} />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("safepulse_token");
    return token ? { name: "User" } : null;
  });

  function handleLogout() {
    localStorage.removeItem("safepulse_token");
    setUser(null);
    setAlerts([]);
    setDevices([]);
    setSensorData(null);
    setSensorError("");
  }
  const [alerts, setAlerts] = useState([]);
  
const [devices, setDevices] = useState([]);
const [sensorData, setSensorData] = useState(null);
const [sensorError, setSensorError] = useState("");
const totalAlerts = alerts.length;

const accidentCount = alerts.filter(
  (alert) => (alert.alertType || "accident") === "accident"
).length;

const sosCount = alerts.filter(
  (alert) => alert.alertType === "sos"
).length;

const [alertsLoading, setAlertsLoading] = useState(true);
const [alertsError, setAlertsError] = useState("");

const [sendingAlert, setSendingAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState("");

async function sendManualAlert(type) {
  try {
    setSendingAlert(true);
    setAlertMessage("");

    const payload = {
      deviceId: "ESP32-001",
      vehicleNumber: "MH12AB1234",
      latitude: 19.174,
      longitude: 73.241,
      impactLevel: "high",
    };

    const response = await api.post(
      type === "sos" ? "/alerts/sos" : "/alerts",
      payload
    );

    setAlertMessage(response.data.message || "Alert created successfully!");

    const updated = await api.get("/alerts");
    setAlerts(updated.data.alerts ?? updated.data);
  } catch (error) {
    setAlertMessage(
      error.response?.data?.message || "Alert failed. Backend check karo."
    );
  } finally {
    setSendingAlert(false);
  }
}

async function resolveAlert(alertId) {
    try {
        await api.patch(`/alerts/${alertId}/status`, {
            status: "resolved"
        });

        const response = await api.get("/alerts");
        setAlerts(response.data.alerts || []);
        setAlertMessage("Alert resolved successfully.");
    } catch (error) {
        setAlertMessage(
            error.response?.data?.message ||
            "Failed to resolve alert."
        );
    }
}



async function deleteAlert(alertId) {
    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this alert?"
    );

    if (!confirmed) return;

    try {
        await api.delete(`/alerts/${alertId}`);

        const response = await api.get("/alerts");
        setAlerts(response.data.alerts || []);
        setAlertMessage("Alert deleted successfully.");
    } catch (error) {
        setAlertMessage(
            error.response?.data?.message ||
            "Failed to delete alert."
        );
    }
}

useEffect(() => {
  if (!user) return;

  let isActive = true;

  async function fetchAlerts() {
    try {
      const response = await api.get("/alerts");

      if (isActive) {
        setAlerts(response.data.alerts ?? response.data);
        setAlertsError("");
      }
    } catch (error) {
      if (isActive) {
        setAlertsError(
          error.response?.data?.message || "Alerts load nahi hue."
        );
      }
    } finally {
      if (isActive) {
        setAlertsLoading(false);
      }
    }
  }


  fetchAlerts();

  const intervalId = setInterval(fetchAlerts, 10000);

  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
}, [user]);

useEffect(() => {
    if (!user) return;

    let isActive = true;

    async function fetchDevices() {
        try {
            const response = await api.get("/devices");

            if (isActive) {
                setDevices(
                    response.data.devices || response.data || []
                );
                const device = (response.data.devices || response.data || [])[0];

if (device?.lastSensorData) {
  setSensorData(device.lastSensorData);
  setSensorError("");
} else {
  setSensorError("Sensor data abhi available nahi hai.");
}
            }
        } catch (error) {
            if (isActive) {
                console.error("Failed to load devices:", error);
            }
        }
    }

    fetchDevices();

    return () => {
        isActive = false;
    };
}, [user]);

useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
        try {
            const response = await api.get("/devices");

const deviceList =
    response.data.devices || response.data || [];

setDevices(deviceList);


const device = deviceList[0];

if (device?.lastSensorData) {
    setSensorData(device.lastSensorData);
    setSensorError("");
} else {
    setSensorData(null);
    setSensorError("Sensor data is not availabel.");
}
        } catch (error) {
            console.error("Failed to refresh devices:", error);
        }
    }, 10000);

    return () => clearInterval(interval);
}, [user]);


  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0b1120] p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">SafePulse</h1>
              <p className="text-xs text-slate-500">Vehicle Safety System</p>
            </div>
          </div>

          <p className="mb-3 mt-10 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Main menu
          </p>
          <nav className="space-y-2">
            <a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300">
              <LayoutDashboard size={19} /> Dashboard
            </a>
            <a href="#sensors" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <Activity size={19} /> Sensor monitoring
            </a>
            <a href="#alerts" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <Bell size={19} /> Accident & SOS alerts
            </a>
            <a href="#location" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <MapPin size={19} /> GPS location
            </a>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Radio size={18} className="text-emerald-400" />
              ESP32 Device
            </div>
          <p className="mt-3 text-xs text-slate-400">
    Device ID: {devices[0]?.deviceId || "No device registered"}
</p>

<p className="mt-1 text-xs text-slate-400">
    Vehicle: {devices[0]?.vehicleNumber || "No vehicle registered"}
</p>

<p className="mt-3 text-xs text-amber-300">
    Connection: {devices.length === 0
    ? "Not registered"
    : devices[0].lastSeen &&
      Date.now() - new Date(devices[0].lastSeen).getTime() < 30000
        ? "Online"
        : "Offline"}
</p>
          </div>
        </aside>

        <main id="dashboard" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-cyan-400">VEHICLE SAFETY MONITORING</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Dashboard Overview</h2>
              <p className="mt-2 text-sm text-slate-400">
                Monitor your vehicle and review safety alerts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-lg shadow-black/10">
                <div className="rounded-lg bg-cyan-400/10 p-2">
                  <CarFront size={21} className="text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Registered vehicle</p>
                  <p className="text-sm font-semibold">{devices[0]?.vehicleNumber || "MH12AB1234"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                title="Logout from SafePulse"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </header>   
<section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
  <h3 className="text-lg font-bold">Manual Emergency Alerts</h3>
  <p className="mt-1 text-sm text-slate-400">
     Accident & SOS alert trigger System
  </p>

  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={() => sendManualAlert("accident")}
      disabled={sendingAlert}
      className="rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
    >
      {sendingAlert ? "Sending..." : "🚨 Accident Alert"}
    </button>

    <button
      onClick={() => sendManualAlert("sos")}
      disabled={sendingAlert}
      className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
    >
      {sendingAlert ? "Sending..." : "🆘 SOS Alert"}
    </button>
  </div>

  {alertMessage && (
    <p className="mt-3 text-sm text-cyan-300">{alertMessage}</p>
  )}
</section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Alerts" value={totalAlerts} note="Alerts saved in backend" icon={Bell} color="bg-blue-400/10 text-blue-300" />
            <StatCard title="Accident Alerts" value={accidentCount} note="Accident records" icon={AlertTriangle} color="bg-rose-400/10 text-rose-300" />
            <StatCard title="SOS Alerts" value={sosCount} note="SOS records" icon={LifeBuoy} color="bg-amber-400/10 text-amber-300" />
            <StatCard title="Device" value="ESP32" note="Backend tested successfully" icon={Radio} color="bg-emerald-400/10 text-emerald-300" />
          </section>

          <section id="sensors" className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Sensor Monitoring</h3>
                <p className="mt-1 text-sm text-slate-500">
  Live readings from your ESP32 sensors
</p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${sensorData ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sensorData ? "bg-emerald-400" : "bg-amber-400"}`} />
                {sensorData ? "LIVE DATA" : "WAITING FOR DATA"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              
<SensorCard title="Acceleration" value={sensorData?.acceleration ?? "--"} unit="g" icon={Gauge} description="MPU6050" />
<SensorCard title="Rotation" value={sensorData?.rotation ?? "--"} unit="°/s" icon={Activity} description="Gyroscope" />
<SensorCard title="Temperature" value={sensorData?.temperature ?? "--"} unit="°C" icon={Thermometer} description="DHT11" />
<SensorCard title="Smoke Level" value={sensorData?.smoke ?? "--"} unit="ADC" icon={Wind} description="MQ-2 sensor" />

            </div>
            <p className="mt-3 text-right text-xs text-slate-500">
              {sensorData?.updatedAt
                ? `Last updated: ${new Date(sensorData.updatedAt).toLocaleTimeString()}`
                : sensorError || "Waiting for the first sensor update..."}
            </p>
          </section>

          <section className="mt-10 grid gap-5 xl:grid-cols-3">
            <div id="alerts" className="rounded-2xl border border-slate-800 bg-slate-900/80 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
                <div>
                  <h3 className="text-lg font-bold">Recent Alerts</h3>
                  <p className="mt-1 text-sm text-slate-500">Example records from your successful API tests</p>
                </div>
                <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">Latest tests</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-950/60 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Vehicle / ID</th>
                      <th className="px-5 py-4">Alert type</th>
                      <th className="px-5 py-4">Location</th>
                      <th className="px-5 py-4">Smoke / Gas</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  
<tbody>
  {alertsLoading ? (
    <tr>
      <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
        Loading alerts...
      </td>
    </tr>
  ) : alertsError ? (
    <tr>
      <td colSpan={4} className="px-5 py-8 text-center text-rose-300">
        {alertsError}
      </td>
    </tr>
  ) : alerts.length === 0 ? (
    <tr>
      <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
        No alerts found.
      </td>
    </tr>
  ) : (
    alerts.map((alert) => (
      <tr key={alert._id} className="border-t border-slate-800">
        <td className="px-5 py-4">
          <p className="font-medium">{alert.vehicleNumber}</p>
          <p className="mt-1 text-xs text-slate-500">
            {alert._id}
          </p>
        </td>
        <td className="px-5 py-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs ${
              alert.alertType === "sos"
                ? "bg-amber-400/10 text-amber-300"
                : "bg-rose-400/10 text-rose-300"
            }`}
          >
            {alert.alertType || "accident"}
          </span>
        </td>
        <td className="px-5 py-4 text-slate-400">
  {alert.latitude != null && alert.longitude != null ? (
    <a
      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-400 underline"
    >
      View Location
    </a>
  ) : (
    "Location unavailable"
  )}
</td>
<td className="px-5 py-4">
  <span className={
    alert.smokeDetected === true
      ? "text-red-400 font-bold"
      : "text-emerald-400 font-bold"
  }>
    {alert.smokeDetected === true ? "YES" : "NO"}
  </span>
</td>
<td className="px-5 py-4">
    <div className="flex items-center gap-2">
        <span className={
            alert.status === "resolved"
                ? "text-emerald-400"
                : "text-amber-300"
        }>
            {alert.status}
        </span>

        {alert.status !== "resolved" && (
            <button
                onClick={() => resolveAlert(alert._id)}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
            >
                Resolve
            </button>
        )}

        <button
            onClick={() => deleteAlert(alert._id)}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-500"
        >
            Delete
        </button>
    </div>
</td>

      </tr>
    ))
  )}
</tbody>

                </table>
              </div>
              <p className="px-5 py-4 text-xs text-slate-500">
               Alerts are fetched from your SafePulse backend. 
              </p>
            </div>

            <div id="location" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">GPS Location</h3>
                <MapPin className="text-cyan-300" size={21} />
              </div>
              
<GPSMap alerts={alerts} device={devices[0]} />

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-800/60 p-3">
                <Cloud size={18} className="mt-0.5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Backend connection</p>
                  <p className="mt-1 text-xs text-slate-500">Live alerts synced with SafePulse backend.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 py-5 text-xs text-slate-500">
            <span>SafePulse · IoT Vehicle Safety Project</span>
            <span className="flex items-center gap-2"><Clock3 size={14} /> Frontend preview</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
