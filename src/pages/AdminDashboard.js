// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Grid, Alert } from '@mui/material';
import API from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/dashboard/admin-stats');
        setStats(res.data?.data || null);
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load admin stats');
      }
    })();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h3" color="primary.main">{stats?.overview?.totalUsers ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6">Modules</Typography>
              <Typography variant="h3" color="info.main">{stats?.overview?.totalModules ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6">Drills</Typography>
              <Typography variant="h3" color="warning.main">{stats?.overview?.totalDrills ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6">Active Alerts</Typography>
              <Typography variant="h3" color="error.main">{stats?.activeAlerts ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Users by Role</Typography>
                {(stats?.usersByRole || []).map((r) => (
                  <Box key={r._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{r._id}</Typography>
                    <Typography>{r.count}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Popular Modules</Typography>
                {(stats?.popularModules || []).map((m) => (
                  <Box key={m._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{m.title}</Typography>
                    <Typography>{m.metadata?.views ?? 0} views</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
