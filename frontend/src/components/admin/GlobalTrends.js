import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Typography, Box, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const COLORS = ['#FF6F61', '#4CAF50', '#3F51B5', '#FF9800', '#9C27B0'];

const GlobalTrends = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://10.22.200.148:5001/api/sensor_data');
        const json = await response.json();
        setData(json.reverse());
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Worker-wise average calculation
  const workerSensorSums = {};
  const workerCounts = {};

  data.forEach(entry => {
    const worker = entry.user_id;

    if (!workerSensorSums[worker]) {
      workerSensorSums[worker] = { temperature: 0, humidity: 0, pm1: 0, pm25: 0, pm10: 0 };
      workerCounts[worker] = 0;
    }

    workerSensorSums[worker].temperature += entry.temperature;
    workerSensorSums[worker].humidity += entry.humidity;
    workerSensorSums[worker].pm1 += entry.pm1;
    workerSensorSums[worker].pm25 += entry.pm25;
    workerSensorSums[worker].pm10 += entry.pm10;
    workerCounts[worker] += 1;
  });

  const barChartData = Object.keys(workerSensorSums).map(worker => ({
    worker,
    temperature: (workerSensorSums[worker].temperature / workerCounts[worker]).toFixed(2),
    humidity: (workerSensorSums[worker].humidity / workerCounts[worker]).toFixed(2),
    pm1: (workerSensorSums[worker].pm1 / workerCounts[worker]).toFixed(2),
    pm25: (workerSensorSums[worker].pm25 / workerCounts[worker]).toFixed(2),
    pm10: (workerSensorSums[worker].pm10 / workerCounts[worker]).toFixed(2)
  }));

  // Pie chart overall average calculation
  let totalTemp = 0, totalHum = 0, totalPm1 = 0, totalPm25 = 0, totalPm10 = 0;
  let totalEntries = data.length;

  data.forEach(entry => {
    totalTemp += entry.temperature;
    totalHum += entry.humidity;
    totalPm1 += entry.pm1;
    totalPm25 += entry.pm25;
    totalPm10 += entry.pm10;
  });

  const pieData = [
    { name: 'Temperature', value: totalTemp },
    { name: 'Humidity', value: totalHum },
    { name: 'PM1.0', value: totalPm1 },
    { name: 'PM2.5', value: totalPm25 },
    { name: 'PM10', value: totalPm10 },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)', p: 4 }}>
      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center', mb: 4 }}>
          Global Trends: Sensor Analysis
        </Typography>
      </motion.div>

      {data.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#333' }}>
          Loading sensor data...
        </Typography>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <Grid container spacing={4} justifyContent="center">

            {/* Bar Chart */}
            <Grid item xs={12} md={10}>
              <Card sx={{
                p: 3, boxShadow: 10, borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    Worker-wise Sensor Averages
                  </Typography>

                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="worker" tick={{ fill: '#333' }} />
                      <YAxis tick={{ fill: '#333' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="temperature" fill="#FF6F61" name="Temperature (°C)" />
                      <Bar dataKey="humidity" fill="#4CAF50" name="Humidity (%)" />
                      <Bar dataKey="pm1" fill="#3F51B5" name="PM1.0 (µg/m³)" />
                      <Bar dataKey="pm25" fill="#FF9800" name="PM2.5 (µg/m³)" />
                      <Bar dataKey="pm10" fill="#9C27B0" name="PM10 (µg/m³)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 3, boxShadow: 10, borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                    Overall Sensor Proportion
                  </Typography>

                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Combined Line Graph */}
            <Grid item xs={12} md={10}>
              <Card sx={{
                p: 3, boxShadow: 10, borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    Combined Sensor Trends
                  </Typography>

                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={data.slice(0, 100)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tick={{ fill: '#333' }} />
                      <YAxis tick={{ fill: '#333' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#FF6F61" name="Temperature" dot={false} />
                      <Line type="monotone" dataKey="humidity" stroke="#4CAF50" name="Humidity" dot={false} />
                      <Line type="monotone" dataKey="pm1" stroke="#3F51B5" name="PM1.0" dot={false} />
                      <Line type="monotone" dataKey="pm25" stroke="#FF9800" name="PM2.5" dot={false} />
                      <Line type="monotone" dataKey="pm10" stroke="#9C27B0" name="PM10" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default GlobalTrends;
