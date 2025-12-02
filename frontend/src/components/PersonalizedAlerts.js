import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PersonalizedAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [sensorTrend, setSensorTrend] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const workerId = localStorage.getItem("worker_id");
  const wsRef = useRef(null);
  const audioRef = useRef(new Audio("/alert.mp3"));

  const handleInteraction = () => setUserInteracted(true);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return `${dayjs(timestamp).fromNow()} (${dayjs(timestamp).format("HH:mm:ss")})`;
  };

  useEffect(() => {
    window.addEventListener("click", handleInteraction);
    return () => window.removeEventListener("click", handleInteraction);
  }, []);

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connect = () => {
      ws = new WebSocket("ws://10.22.200.148:8000/ws/worker");
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("✅ WebSocket connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.worker_id === workerId) {
          setWorkerProfile(data.worker_profile);
          setAlerts((prev) => [data, ...prev.slice(0, 9)]); // limit to last 10 alerts
          setSensorTrend((prev) => [...prev.slice(-29), { ...data.sensor_data, timestamp: data.timestamp }]);

          if (userInteracted && audioRef.current) {
            audioRef.current.play().catch((err) => console.warn("🔇 Audio play blocked", err));
          }

          toast.warn(`⚠️ ${data.personalized_advice || "Health Alert!"}`, { autoClose: 5000 });
        }
      };

      ws.onclose = () => {
        console.log("❌ WebSocket disconnected. Retrying...");
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [workerId, userInteracted]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom color="primary">
        Personalized Health Alerts
      </Typography>

      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6">👷 Worker Profile</Typography>
          <Divider sx={{ my: 1 }} />
          {workerProfile ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography>Name: {workerProfile.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Age: {workerProfile.age ?? "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Health: {workerProfile.health_condition ?? "N/A"}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No worker profile available.
            </Typography>
          )}
        </CardContent>
      </Card>

      {alerts.map((alert, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" color="error">
              ⚠️ {alert.personalized_advice || "Health risk detected"}
            </Typography>
            <Chip label={`Risk Level: ${alert.risk_level}`} color="warning" sx={{ mt: 1 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              ⏱️ {formatDate(alert.timestamp)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              PM2.5: {alert.sensor_data?.pm25} µg/m³ | CO: {alert.sensor_data?.co} ppm | VOC: {alert.sensor_data?.voc} ppm
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6">📊 Sensor Trends</Typography>
          {sensorTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorTrend}>
                <XAxis dataKey="timestamp" tickFormatter={(tick) => dayjs(tick).format("HH:mm")} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ef5350" name="Temp (°C)" />
                <Line type="monotone" dataKey="co" stroke="#ff9800" name="CO (ppm)" />
                <Line type="monotone" dataKey="pm25" stroke="#1976d2" name="PM2.5 (µg/m³)" />
                <Line type="monotone" dataKey="voc" stroke="#7b1fa2" name="VOC (ppm)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No sensor data yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonalizedAlerts;
