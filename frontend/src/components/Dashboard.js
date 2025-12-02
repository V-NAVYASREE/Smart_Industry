import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, Grid, Box, CircularProgress,
  Fade, Chip
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend
} from 'recharts';
import { styled } from '@mui/system';

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
}));

const getRiskColor = (level) => {
  switch (level) {
    case 'Critical': return '#d32f2f';
    case 'High': return '#f57c00';
    case 'Moderate': return '#1976d2';
    case 'Low': return '#388e3c';
    default: return '#616161';
  }
};

const Dashboard = ({ darkMode }) => {
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://10.22.200.148:5001/api/latest');

        if (res.data && res.data.temperature !== undefined) {
          const newEntry = {
            ...res.data,
            id: Date.now(),
            timestamp: res.data.timestamp || new Date().toISOString()
          };

          setSensorData(res.data);
          setHistory(prev => [...prev.slice(-19), newEntry]);
          setLoading(false);
        } else {
          throw new Error('No sensor data found');
        }
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('❌ Failed to fetch sensor data.');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderCard = (label, value, unit, color) => (
    <Grid item xs={12} sm={6} md={3} key={label}>
      <Fade in timeout={500}>
        <Card
          sx={{
            backgroundColor: darkMode ? '#2E3B55' : '#F1F8E9',
            borderLeft: `6px solid ${color}`,
            borderRadius: 3,
            boxShadow: 4,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.03)' },
            minHeight: 120,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value ?? '--'} {unit}
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const riskColor = getRiskColor(sensorData.risk_level);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={600}>
        Smart Industry Dashboard
      </Typography>

      <Chip
        label={`Real-Time Monitoring | Risk: ${sensorData.risk_level}`}
        color="default"
        sx={{
          mb: 4,
          fontSize: '1rem',
          fontWeight: 'bold',
          backgroundColor: riskColor,
          color: '#fff'
        }}
      />

      <Grid container spacing={3}>
        {renderCard('Temperature', sensorData.temperature, '°C', '#FF8C00')}
        {renderCard('Humidity', sensorData.humidity, '%', '#1976D2')}
        {renderCard('CO', sensorData.co, 'ppm', '#D32F2F')}
        {renderCard('VOC', sensorData.voc, 'ppm', '#7B1FA2')}
        {renderCard('PM1.0', sensorData.pm1, 'µg/m³', '#388E3C')}
        {renderCard('PM2.5', sensorData.pm25, 'µg/m³', '#F57C00')}
        {renderCard('PM10', sensorData.pm10, 'µg/m³', '#0288D1')}
        {renderCard('Risk Level', sensorData.risk_level, '', riskColor)}
      </Grid>

      <Typography variant="body1" sx={{ mt: 4 }}>
        Last Updated: {new Date(sensorData.timestamp).toLocaleString()}
      </Typography>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Sensor Trends (Temperature & CO)
        </Typography>

        <ChartContainer>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#FF8C00"
                strokeWidth={3}
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="co"
                stroke="#D32F2F"
                strokeWidth={3}
                name="CO (ppm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;
