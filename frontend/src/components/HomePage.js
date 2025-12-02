import React from 'react';
import Dashboard from './Dashboard';
import { Link } from 'react-router-dom';
import { Button, Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { PersonAdd, Login, NotificationsActive, Person } from '@mui/icons-material';

const HomePage = () => {
  const workerId = localStorage.getItem('worker_id') || 'default_worker';

  const buttonData = [
    { label: 'Register', color: 'primary', path: '/register', icon: <PersonAdd /> },
    { label: 'Login', color: 'success', path: '/login', icon: <Login /> },
    { label: 'Live Alerts', color: 'warning', path: '/alerts', icon: <NotificationsActive /> },
    { label: 'Personalized Alerts', color: 'error', path: `/personalized-alerts/${workerId}`, icon: <Person /> }
  ];

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            mb: 5,
            backgroundColor: '#E3F2FD',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Smart Industry Dashboard
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
            Real-Time Industrial Safety Monitoring System
          </Typography>
          <Divider />
        </Paper>
      </motion.div>

      {/* Dashboard Section */}
      <Dashboard />

      {/* Navigation Buttons Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {buttonData.map((btn, index) => (
            <Grid item key={index}>
              <Link to={btn.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-block' }}
                >
                  <Button
                    variant="contained"
                    color={btn.color}
                    size="large"
                    startIcon={btn.icon}
                    sx={{
                      borderRadius: 3,
                      px: 5,
                      py: 2,
                      fontSize: '1.1rem',
                      boxShadow: 3,
                      textTransform: 'none',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    {btn.label}
                  </Button>
                </motion.div>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
