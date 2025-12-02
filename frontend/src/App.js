import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Pages & components
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import AlertPage from './components/AlertPage';
import PersonalizedAlerts from './components/PersonalizedAlerts';
import AdminLoginPage from './components/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
// App.js (good)
import WorkerGraphs from './components/admin/WorkerGraphs';
import GlobalTrends from './components/admin/GlobalTrends';
import Comparisons from './components/admin/Comparisons';
import AlertsHistory from './components/admin/AlertsHistory';

// Dummy placeholders for admin nested pages



function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const theme = createTheme({
    palette: { mode: darkMode ? 'dark' : 'light' },
  });

  // Navigation for top bar
  let navItems = [{ label: 'Home', path: '/' }];

  if (role === 'worker') {
    navItems.push({ label: 'Live Alerts', path: '/alerts' });
    navItems.push({
      label: 'Personalized Alerts',
      path: `/personalized-alerts/${localStorage.getItem('worker_id') || 'default_worker'}`,
    });
  } else if (role === 'admin') {
    navItems.push({ label: 'Admin Dashboard', path: '/admin-dashboard' });
  } else {
    navItems.push({ label: 'Register', path: '/register' });
    navItems.push({ label: 'Login', path: '/login' });
    navItems.push({ label: 'Admin Login', path: '/admin-login' });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" sx={{ backgroundColor: darkMode ? '#212121' : '#0D47A1', mb: 4 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Smart Industry Dashboard
            </Typography>

            {navItems.map((item, idx) => (
              <Button key={idx} color="inherit" component={Link} to={item.path} sx={{ mx: 1 }}>
                {item.label}
              </Button>
            ))}

            {role && (
              <Button color="inherit" onClick={handleLogout} sx={{ mx: 1 }}>
                Logout
              </Button>
            )}

            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, backgroundColor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/alerts" element={<AlertPage />} />
              <Route path="/personalized-alerts/:workerId" element={<PersonalizedAlerts />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />

              {/* Protected Admin routes with sidebar */}
              <Route
                path="/admin-dashboard/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="worker-graphs" element={<WorkerGraphs />} />
                <Route path="global-trends" element={<GlobalTrends />} />
                <Route path="comparisons" element={<Comparisons />} />
                <Route path="alerts-history" element={<AlertsHistory />} />
                {/* Add more admin nested routes here */}
              </Route>

              {/* Worker dashboard */}
              <Route path="/worker-dashboard" element={<HomePage />} />

              {/* Redirect any unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </Box>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? 'dark' : 'light'}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
