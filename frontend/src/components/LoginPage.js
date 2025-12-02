import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [workerId, setWorkerId] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('1C:69:20:A5:07:24'); // Default device ID
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Login API
      const response = await axios.post('http://localhost:5001/login', { worker_id: workerId, password });

      if (response.status === 200 && response.data.message === 'Login successful') {
        localStorage.setItem('worker_id', workerId);

        try {
          // Assign Device API
          await axios.post('http://localhost:5001/assign_user', {
            device_id: deviceId,
            user_id: workerId
          });

          setSuccess('Login and device mapping successful!');
          navigate(`/personalized-alerts/${workerId}`);
        } catch (deviceError) {
          console.error(deviceError);
          setError('Login successful but device mapping failed.');
        }
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 4, boxShadow: 4, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>Worker Login</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          margin="normal"
          label="Worker ID"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, backgroundColor: '#0D47A1', '&:hover': { backgroundColor: '#1565C0' } }}
        >
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginPage;
