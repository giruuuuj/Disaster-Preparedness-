import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff, TrendingUp, SafetyDivider, Emergency, Timeline } from "@mui/icons-material";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);
      const payload = res.data?.data || {};
      if (remember) {
        localStorage.setItem("token", payload.token || "");
        localStorage.setItem("user", JSON.stringify(payload));
      } else {
        sessionStorage.setItem("token", payload.token || "");
        sessionStorage.setItem("user", JSON.stringify(payload));
      }
      setUser(payload);
      navigate(payload.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    }

    setLoading(false);
  };

  const quickLogin = (email, password) => setFormData({ email, password });

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ minHeight: "100vh", alignItems: "center" }}>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h2" color="primary">
              Disaster Preparedness System
            </Typography>

            <Grid container spacing={2} sx={{ mt: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle1">Preparedness Score</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>65%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Timeline sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="subtitle1">Modules Completed</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: 'info.main' }}>8/12</Typography>
                    <Typography variant="body2" color="text.secondary">4 modules remaining</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SafetyDivider sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle1">Drills Completed</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: 'warning.main' }}>5</Typography>
                    <Typography variant="body2" color="text.secondary">3 drills scheduled</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Emergency sx={{ mr: 1, color: 'error.main' }} />
                      <Typography variant="subtitle1">Active Alerts</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: 'error.main' }}>2</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Quick Login (Testing)</Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Button fullWidth variant="contained" onClick={() => quickLogin("admin@example.com", "Admin@123")}>Admin</Button>
                </Grid>
                <Grid size={6}>
                  <Button fullWidth variant="contained" color="secondary" onClick={() => quickLogin("teacher@example.com", "Teacher@123")}>Teacher</Button>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={6} sx={{ p: 4 }}>
            <Typography variant="h4" textAlign="center">Login</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField label="Email" fullWidth sx={{ mb: 2 }} value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                sx={{ mb: 2 }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                sx={{ mb: 2 }}
                control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                label="Remember me"
              />

              <Button type="submit" fullWidth variant="contained" disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}>
                {loading ? "Signing In..." : "Login"}
              </Button>
            </form>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default Login;
