import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4D4D', '#A569BD', '#E67E22', '#5DADE2'];

// List of all metrics to show
const metrics = ['pm10', 'pm25', 'pm1', 'co', 'voc', 'temperature'];

const Comparisons = () => {
  const [sensorData, setSensorData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('pm25');

  // Fetch all registered workers (must return full list, including offline workers)
  useEffect(() => {
    axios.get('http://localhost:5001/api/workers')
      .then(res => setWorkers(res.data))
      .catch(err => console.error('Error fetching workers:', err));
  }, []);

  // Fetch all past sensor data (historical)
  useEffect(() => {
    axios.get('http://localhost:5001/api/sensor_data')
      .then(res => setSensorData(res.data))
      .catch(err => console.error('Error fetching sensor data:', err));
  }, []);

  // Group sensor data by user_id and calculate average metrics per user
  const groupedData = sensorData.reduce((acc, entry) => {
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = {
        userId: entry.user_id,
        pm10: [],
        pm25: [],
        pm1: [],
        co: [],
        voc: [],
        temperature: []
      };
    }
    acc[entry.user_id].pm10.push(entry.pm10 || 0);
    acc[entry.user_id].pm25.push(entry.pm25 || 0);
    acc[entry.user_id].pm1.push(entry.pm1 || 0);
    acc[entry.user_id].co.push(entry.co || 0);
    acc[entry.user_id].voc.push(entry.voc || 0);
    acc[entry.user_id].temperature.push(entry.temperature || 0);
    return acc;
  }, {});

  // Calculate average per metric per worker
  const avgData = Object.values(groupedData).map(user => {
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return {
      userId: user.userId,
      pm10: parseFloat(avg(user.pm10).toFixed(2)),
      pm25: parseFloat(avg(user.pm25).toFixed(2)),
      pm1: parseFloat(avg(user.pm1).toFixed(2)),
      co: parseFloat(avg(user.co).toFixed(2)),
      voc: parseFloat(avg(user.voc).toFixed(2)),
      temperature: parseFloat(avg(user.temperature).toFixed(2)),
    };
  });

  // Filter data by selected worker or show all
  const filteredData = selectedWorkerId === 'all'
    ? avgData
    : avgData.filter(d => d.userId === selectedWorkerId);

  // Pie chart data based on filtered users for selected metric
  const pieData = filteredData.map(user => ({
    name: workers.find(w => w.id === user.userId)?.name || user.userId,
    value: user[selectedMetric]
  }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Worker Safety Comparisons (Historical Data)
      </Typography>

      <FormControl sx={{ minWidth: 220, my: 3, mr: 3 }}>
        <InputLabel>Worker</InputLabel>
        <Select
          value={selectedWorkerId}
          label="Worker"
          onChange={(e) => setSelectedWorkerId(e.target.value)}
        >
          <MenuItem value="all">All Workers</MenuItem>
          {workers.map(worker => (
            <MenuItem key={worker.id} value={worker.id}>
              {worker.name || worker.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 180, my: 3 }}>
        <InputLabel>Metric</InputLabel>
        <Select
          value={selectedMetric}
          label="Metric"
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {metrics.map(metric => (
            <MenuItem key={metric} value={metric}>
              {metric.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={4}>
        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average {selectedMetric.toUpperCase()} Levels {selectedWorkerId === 'all' ? 'per Worker' : `for ${workers.find(w => w.id === selectedWorkerId)?.name || selectedWorkerId}`}
              </Typography>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={filteredData}
                  margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
                >
                  <XAxis dataKey="userId" tick={{ fontWeight: 'bold' }} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey={selectedMetric}
                    fill={COLORS[metrics.indexOf(selectedMetric) % COLORS.length]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedMetric.toUpperCase()} Distribution {selectedWorkerId === 'all' ? '' : `for ${workers.find(w => w.id === selectedWorkerId)?.name || selectedWorkerId}`}
              </Typography>
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={160}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Comparisons;

