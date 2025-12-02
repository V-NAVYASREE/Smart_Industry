import { useEffect, useState, useRef } from 'react';
import { Typography, Box, Chip, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const getColor = (risk) => {
  switch (risk) {
    case 'Critical': return '#d32f2f';
    case 'High': return '#f57c00';
    case 'Moderate': return '#1976d2';
    case 'Low': return '#388e3c';
    default: return '#616161';
  }
};

const getBgColor = (risk) => {
  switch (risk) {
    case 'Critical': return '#ffebee';
    case 'High': return '#fff3e0';
    case 'Moderate': return '#e3f2fd';
    case 'Low': return '#e8f5e9';
    default: return '#eeeeee';
  }
};

const AlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/worker');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'alert') {
          setAlerts((prev) => [msg, ...prev]);
          toast.warn(`🚨 ${msg.risk_level} Risk Alert for Worker ${msg.worker_id || ''}`);
        }
      } catch (error) {
        console.error('WebSocket Parse Error:', error);
      }
    };

    ws.onerror = (err) => console.error('WebSocket Error:', err);

    return () => ws.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [alerts]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        🔴 Live Safety Alerts
      </Typography>

      {alerts.length === 0 ? (
        <Typography color="text.secondary">No alerts yet. Monitoring in progress...</Typography>
      ) : (
        <Stack spacing={2}>
          {alerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  backgroundColor: getBgColor(alert.risk_level),
                  borderLeft: `6px solid ${getColor(alert.risk_level)}`,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: getColor(alert.risk_level) }}>
                  {alert.risk_level} Alert
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  <Chip label={`Temp: ${alert.details?.temperature ?? '-'}°C`} />
                  <Chip label={`CO: ${alert.details?.co ?? '-'} ppm`} />
                  <Chip label={`PM2.5: ${alert.details?.pm25 ?? '-'} µg/m³`} />
                  {alert.details?.voc && <Chip label={`VOC: ${alert.details.voc} ppm`} />}
                  {alert.details?.humidity && <Chip label={`Humidity: ${alert.details.humidity}%`} />}
                </Stack>
              </Box>
            </motion.div>
          ))}
          <div ref={bottomRef}></div>
        </Stack>
      )}
    </Box>
  );
};

export default AlertPage;
