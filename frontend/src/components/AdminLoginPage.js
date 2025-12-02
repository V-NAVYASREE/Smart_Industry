import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const AdminLoginPage = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (adminId === 'admin' && password === 'admin123') {
      localStorage.setItem('role', 'admin');
      localStorage.setItem('admin_logged_in', 'true');
      navigate('/admin-dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <TextField
          fullWidth
          label="Admin ID"
          sx={{ mb: 2 }}
          value={adminId}
          onChange={e => setAdminId(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          sx={{ mb: 2 }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default AdminLoginPage;
