// src/components/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSelection = (role) => {
    localStorage.setItem('role', role);
    if (role === 'worker') {
      navigate('/worker-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-login');
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom>Welcome to Smart Industry</Typography>
        <Typography variant="h6" gutterBottom>Select Your Role</Typography>
      </Paper>

      <Button variant="contained" color="primary" onClick={() => handleSelection('worker')} sx={{ m: 2, px: 4, py: 2 }}>
        Worker
      </Button>
      <Button variant="contained" color="secondary" onClick={() => handleSelection('admin')} sx={{ m: 2, px: 4, py: 2 }}>
        Admin
      </Button>
    </Box>
  );
};

export default LandingPage;
