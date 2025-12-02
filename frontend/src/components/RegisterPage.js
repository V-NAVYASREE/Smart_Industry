import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    worker_id: '',
    password: '',
    name: '',
    dob: '',
    health_condition: '',
    work_environment: '',
    email: '',
    phone_number: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const ws = useRef(null); // WebSocket reference

  useEffect(() => {
    // Connect to the WebSocket server (adjust IP if not localhost)
    ws.current = new WebSocket('ws://localhost:8765');

    ws.current.onopen = () => {
      console.log('WebSocket connected from RegisterPage');
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.current.close(); // Cleanup on unmount
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/register', formData);

      if (response.status === 200 && response.data.message === 'Registration successful') {
        setSuccess('✅ Registration successful! You can now log in.');

        // Send WebSocket event
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            event: 'new_registration',
            data: {
              worker_id: formData.worker_id,
              name: formData.name,
              email: formData.email
            }
          }));
        }

        // Reset form
        setFormData({
          worker_id: '',
          password: '',
          name: '',
          dob: '',
          health_condition: '',
          work_environment: '',
          email: '',
          phone_number: ''
        });
      } else {
        setError(response.data.message || '❌ Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setError('❌ Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, p: 4, boxShadow: 3, borderRadius: 3, backgroundColor: '#F7F9FC' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 600 }}>
        Worker Registration
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField label="Worker ID" name="worker_id" value={formData.worker_id} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
        <TextField label="Health Condition" name="health_condition" value={formData.health_condition} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Work Environment" name="work_environment" value={formData.work_environment} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} fullWidth margin="normal" required />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterPage;
