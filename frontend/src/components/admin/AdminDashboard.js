import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Snackbar, Alert as MuiAlert, Paper } from '@mui/material';
import axios from 'axios';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Helper to calculate age from DOB
const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const AdminDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/workers')
      .then(res => setWorkers(res.data))
      .catch(console.error);

    const ws = new WebSocket('ws://192.168.118.148:8000/ws/admin'); // make sure the /admin role matches

    ws.onopen = () => console.log('✅ WebSocket connected');

    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      const role = localStorage.getItem('user_role');

      if (role === 'admin' && alert.risk_level === 'Unsafe') {
        setAlerts(prev => [alert, ...prev]);
        setSnackbarMessage(`⚠️ ALERT: ${alert.alert} for ${alert.user_name}`);
        setSnackbarOpen(true);
      }
    };

    ws.onclose = () => console.log('❌ WebSocket disconnected');

    return () => ws.close();
  }, []);

  return (
    <Box sx={{
      p: 4,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
      color: '#e0e0e0',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textShadow: '2px 2px 6px #000000' }}>
        Admin Dashboard
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#ffb300', fontWeight: '600', letterSpacing: 1 }}>
        Live Unsafe Alerts (All Workers)
      </Typography>

      {alerts.length === 0 ? (
        <Typography sx={{ fontSize: '1.1rem', color: '#ffc107' }}>
          No unsafe alerts yet.
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {alerts.map((alert, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper elevation={8} sx={{
                p: 2,
                borderLeft: '6px solid #ff5252',
                backgroundColor: '#3b3f52',
                color: '#ffcccb',
                boxShadow: '0 8px 20px rgba(255, 82, 82, 0.3)',
                '&:hover': { boxShadow: '0 12px 30px rgba(255, 82, 82, 0.5)' },
                transition: 'box-shadow 0.3s ease-in-out',
              }}>
                <Typography variant="h6" sx={{ fontWeight: '700', mb: 1 }}>
                  {alert.user_name} <span style={{ fontWeight: '400', fontSize: '0.9rem', color: '#ff8a80' }}>({alert.user_id})</span>
                </Typography>
                <Typography sx={{ fontSize: '1rem' }}>
                  {alert.alert}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#81d4fa', fontWeight: '600', letterSpacing: 1 }}>
        Registered Workers
      </Typography>

      <Grid container spacing={3}>
        {workers.map(worker => (
          <Grid item xs={12} md={6} lg={4} key={worker.worker_id}>
            <Paper elevation={6} sx={{
              p: 3,
              backgroundColor: '#394867',
              color: '#dbe9f4',
              borderRadius: 3,
              boxShadow: '0 6px 15px rgba(57, 72, 103, 0.7)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.03)' },
            }}>
              <Typography variant="h6" sx={{ fontWeight: '700', mb: 1 }}>
                {worker.name} <span style={{ fontWeight: '400', fontSize: '0.9rem', color: '#a0c4ff' }}>({worker.worker_id})</span>
              </Typography>
              <Typography>DOB: {worker.dob}</Typography>
              <Typography>Age: {calculateAge(worker.dob)} years</Typography>
              <Typography>Environment: {worker.work_environment}</Typography>
              <Typography>Email: {worker.email || <em>Not Provided</em>}</Typography>
              <Typography>Phone: {worker.phone_number || <em>Not Provided</em>}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
