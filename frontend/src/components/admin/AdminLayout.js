import React from 'react';
import { Box, Drawer, List, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { label: 'Dashboard Home', path: '/admin-dashboard' },
  { label: 'Worker Graphs', path: '/admin-dashboard/worker-graphs' },
  { label: 'Global Trends', path: '/admin-dashboard/global-trends' },
  { label: 'Comparative Analysis', path: '/admin-dashboard/comparisons' },
  { label: 'Alerts & History', path: '/admin-dashboard/alerts-history' },
  
];

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0D47A1',
            color: 'white',
          },
        }}
      >
        <Toolbar />
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Admin Panel
        </Typography>
        <List>
          {menuItems.map((item, index) => (
            <ListItem
              button
              key={index}
              component={Link}
              to={item.path}
              sx={{ color: 'white' }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
