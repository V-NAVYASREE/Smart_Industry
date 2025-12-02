import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Typography, Box, Paper, MenuItem, Select, FormControl, InputLabel, Card, CardContent
} from '@mui/material';
import { motion } from 'framer-motion';

const sensors = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#FF6F61' },
  { key: 'humidity', label: 'Humidity (%)', color: '#4CAF50' },
  { key: 'pm1', label: 'PM1.0 (µg/m³)', color: '#3F51B5' },
  { key: 'pm25', label: 'PM2.5 (µg/m³)', color: '#FF9800' },
  { key: 'pm10', label: 'PM10 (µg/m³)', color: '#9C27B0' }
];

const WorkerGraphs = () => {
  const [data, setData] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('temperature');

  useEffect(() => {
    const socket = new WebSocket("ws://10.22.200.148:5001/ws/admin");

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sensor_data && message.user_id) {
        setData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            ...message.sensor_data,
            worker_id: message.user_id
          }];
          return newData.length > 100 ? newData.slice(-100) : newData;
        });
      }
    };

    return () => socket.close();
  }, []);

  const currentSensor = sensors.find(s => s.key === selectedSensor);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      p: 4
    }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center', mb: 4 }}>
          Live Sensor Dashboard
        </Typography>
      </motion.div>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <FormControl sx={{
          minWidth: 300,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}>
          <InputLabel>Select Sensor</InputLabel>
          <Select
            value={selectedSensor}
            label="Select Sensor"
            onChange={(e) => setSelectedSensor(e.target.value)}
          >
            {sensors.map(sensor => (
              <MenuItem key={sensor.key} value={sensor.key}>
                {sensor.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {data.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#fff' }}>
          Waiting for live sensor data...
        </Typography>
      ) : (
        <Card sx={{
          p: 3,
          boxShadow: 10,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
              {currentSensor.label} Graph
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="timestamp" tick={{ fill: '#333' }} />
                <YAxis tick={{ fill: '#333' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={currentSensor.key}
                  stroke={currentSensor.color}
                  name={currentSensor.label}
                  dot={false}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WorkerGraphs;
