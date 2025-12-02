// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  SafetyDivider,
  Emergency,
  Warning,
  PlayArrow,
  MenuBook,
  NotificationsActive,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [preparednessScore, setPreparednessScore] = useState(65);
  const [upcomingDrills, setUpcomingDrills] = useState([
    { id: 1, name: 'Earthquake Drill', date: '2024-03-15', type: 'earthquake' },
    { id: 2, name: 'Fire Safety Drill', date: '2024-03-22', type: 'fire' },
    { id: 3, name: 'Flood Preparedness', date: '2024-04-05', type: 'flood' },
  ]);

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, message: 'Heavy rainfall warning in your region', type: 'warning', time: '2 hours ago' },
    { id: 2, message: 'Earthquake drill scheduled tomorrow', type: 'info', time: '1 day ago' },
  ]);
  const [user, setUser] = useState(null);
  const [systemStatus, setSystemStatus] = useState('unknown');

  useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/system/status');
        setSystemStatus(res.data?.data?.db || 'unknown');
      } catch {
        setSystemStatus('unknown');
      }
    })();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Preparedness Score',
        data: [45, 52, 58, 62, 65, 68],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Preparedness Progress',
      },
    },
  };

  const getDisasterIcon = (type) => {
    switch (type) {
      case 'earthquake':
        return <Emergency color="warning" />;
      case 'fire':
        return <Warning color="error" />;
      case 'flood':
        return <SafetyDivider color="info" />;
      default:
        return <Timeline color="action" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {user ? `Welcome back, ${user.name}` : 'Disaster Preparedness Dashboard'}
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Role: {user.role} • System: {systemStatus}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<MenuBook />} onClick={() => navigate('/education')}>
            Continue Learning
          </Button>
          <Button variant="outlined" startIcon={<PlayArrow />} onClick={() => navigate('/drills')}>
            Start Drill
          </Button>
          <Button variant="text" startIcon={<NotificationsActive />} onClick={() => navigate('/alerts')}>
            View Alerts
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Preparedness Score</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'primary.main' }}>
                {preparednessScore}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={preparednessScore}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Modules Completed</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'info.main' }}>
                8/12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4 modules remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SafetyDivider sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Drills Completed</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'warning.main' }}>
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3 drills scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Emergency sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Active Alerts</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'error.main' }}>
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In your region
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Line options={chartOptions} data={chartData} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Drills
            </Typography>
            {upcomingDrills.map((drill) => (
              <Box
                key={drill.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getDisasterIcon(drill.type)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1">{drill.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(drill.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={drill.type}
                  size="small"
                  color={
                    drill.type === 'earthquake'
                      ? 'warning'
                      : drill.type === 'fire'
                      ? 'error'
                      : 'info'
                  }
                />
              </Box>
            ))}
            <Button variant="outlined" fullWidth>
              View All Drills
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            {recentAlerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type}
                sx={{ mb: 2 }}
                action={
                  <Typography variant="caption" color="text.secondary">
                    {alert.time}
                  </Typography>
                }
              >
                {alert.message}
              </Alert>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
