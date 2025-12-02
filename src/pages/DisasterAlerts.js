// src/pages/DisasterAlerts.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  AlertTitle,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
  Notifications,
  NotificationsOff,
  LocationOn,
  Refresh,
  FilterList,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion'; // Add this import
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API, { fetchWeather, generateGemini, generateGeminiImage, searchGoogleImages, fetchGoogleAirQuality } from '../api';
import { io } from 'socket.io-client';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DisasterAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const [filter, setFilter] = useState('all');
  const [showMap, setShowMap] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newAlert, setNewAlert] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [geminiKeyOpen, setGeminiKeyOpen] = useState(false);
  const [geminiKeyValue, setGeminiKeyValue] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Explain today\'s alert situation in simple terms');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [weatherKeyStatus, setWeatherKeyStatus] = useState('unknown');
  const [geminiKeyStatus, setGeminiKeyStatus] = useState('unknown');
  const [aiMode, setAiMode] = useState('text');
  const [imageResponse, setImageResponse] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [imageSource, setImageSource] = useState('generate');
  const [imageResults, setImageResults] = useState([]);
  const [imageCount, setImageCount] = useState(3);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [googleKeyOpen, setGoogleKeyOpen] = useState(false);
  const [googleApiKeyValue, setGoogleApiKeyValue] = useState('');
  const [googleCxValue, setGoogleCxValue] = useState('');
  const [googleKeyStatus, setGoogleKeyStatus] = useState('unknown');
  const [googleApiKeyError, setGoogleApiKeyError] = useState('');
  const [googleCxError, setGoogleCxError] = useState('');
  const [aq, setAq] = useState(null);
  const [aqLoading, setAqLoading] = useState(false);
  const [aqError, setAqError] = useState(null);
  const [mapsKeyOpen, setMapsKeyOpen] = useState(false);
  const [mapsApiKeyValue, setMapsApiKeyValue] = useState('');
  const [mapsKeyStatus, setMapsKeyStatus] = useState('unknown');

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'earthquake':
        return 'error';
      case 'heatwave':
        return 'warning';
      case 'cyclone':
        return 'error';
      default:
        return 'info';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning />;
      case 'earthquake':
        return <ErrorIcon />;
      default:
        return <Info />;
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await API.get('/alerts', { params: { active: 'true', limit: 50 } });
        const list = (res.data?.data || []).map((a) => ({
          id: a._id,
          title: a.title,
          description: a.description,
          type: a.type,
          severity: a.severity,
          location: a.location?.name || 'Unknown',
          coordinates: a.location?.coordinates
            ? [a.location.coordinates.lat || 20.5937, a.location.coordinates.lng || 78.9629]
            : [20.5937, 78.9629],
          issued: a.issuedAt,
          expires: a.expiresAt,
          source: a.source,
          active: a.isActive,
        }));
        setAlerts(list);
      } catch (e) {
        // silently fail, keep UI functional
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : null;
    if (u?._id) socket.emit('join-user', u._id);
    if (u?.institution) socket.emit('join-institution', u.institution);

    socket.on('new-alert', (a) => {
      const mapped = {
        id: a._id,
        title: a.title,
        description: a.description,
        type: a.type,
        severity: a.severity,
        location: a.location?.name || 'Unknown',
        coordinates: a.location?.coordinates
          ? [a.location.coordinates.lat || 20.5937, a.location.coordinates.lng || 78.9629]
          : [20.5937, 78.9629],
        issued: a.issuedAt,
        expires: a.expiresAt,
        source: a.source,
        active: a.isActive,
      };
      setAlerts((prev) => [mapped, ...prev]);
      setToastMessage(`New alert: ${mapped.title}`);
      setToastOpen(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    let lat = 20.5937;
    let lon = 78.9629;
    try {
      await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lon = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 5000 }
          );
        } else {
          resolve();
        }
      });
      const key = process.env.REACT_APP_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key') || sessionStorage.getItem('openweather_api_key');
      if (!key) throw new Error('Missing OpenWeather API key');
      const data = await fetchWeather(lat, lon, key);
      setWeather({
        name: data.name,
        temp: Math.round(data.main?.temp),
        description: data.weather?.[0]?.description || '',
        icon: data.weather?.[0]?.icon || '',
        humidity: data.main?.humidity,
        wind: Math.round(data.wind?.speed || 0),
        lat,
        lon,
      });
    } catch (e) {
      setWeatherError(e.message || 'Unable to load weather');
      if ((e.message || '').includes('Invalid OpenWeather API key')) {
        setApiKeyValue(localStorage.getItem('openweather_api_key') || '');
        setApiKeyOpen(true);
      }
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleToggleNotifications = async (checked) => {
    setNotificationsEnabled(checked);
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      const u = stored ? JSON.parse(stored) : null;
      if (!u) return;
      const res = await API.put('/auth/update-profile', {
        preferences: {
          ...(u.preferences || {}),
          notifications: {
            ...(u.preferences?.notifications || {}),
            push: checked,
          },
        },
      });
      const updated = res.data?.data;
      if (updated) {
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore errors for now
    }
  };

  const openDetails = async (id) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await API.get(`/alerts/${id}`);
      setSelectedAlert(res.data?.data || null);
    } catch (e) {
      setDetailsError(e.response?.data?.message || 'Unable to load alert');
    } finally {
      setDetailsLoading(false);
    }
  };

  const geolocateMap = async () => {
    let lat = mapCenter[0];
    let lon = mapCenter[1];
    await new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            resolve();
          },
          () => resolve(),
          { timeout: 5000 }
        );
      } else {
        resolve();
      }
    });
    setMapCenter([lat, lon]);
    setMapZoom(10);
  };

  const handleCreateAlert = () => {
    setNewAlert({
      title: '',
      description: '',
      type: 'warning',
      severity: 'medium',
      location: '',
    });
  };

  const loadAlertsByLocation = async () => {
    try {
      let lat = 20.5937;
      let lon = 78.9629;
      await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lon = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 5000 }
          );
        } else {
          resolve();
        }
      });
      const res = await API.get('/alerts/location', { params: { lat, lng: lon, radius: 100 } });
      const list = (res.data?.data || []).map((a) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        type: a.type,
        severity: a.severity,
        location: a.location?.name || 'Nearby',
        coordinates: a.location?.coordinates
          ? [a.location.coordinates.lat || lat, a.location.coordinates.lng || lon]
          : [lat, lon],
        issued: a.issuedAt,
        expires: a.expiresAt,
        source: a.source,
        active: a.isActive,
      }));
      setAlerts(list);
      setMapCenter([lat, lon]);
      setMapZoom(10);
    } catch (e) {
      // ignore errors, keep existing list
    }
  };

  const handleCloseAlert = () => {
    setNewAlert(null);
  };

  const handleSaveAlert = async () => {
    if (newAlert?.title && newAlert?.description && newAlert?.location) {
      try {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        const u = stored ? JSON.parse(stored) : null;
        if (u && (u.role === 'admin' || u.role === 'teacher')) {
          const res = await API.post('/alerts', {
            title: newAlert.title,
            description: newAlert.description,
            type: newAlert.type,
            severity: newAlert.severity,
            location: {
              name: newAlert.location,
              coordinates: { lat: 20.5937, lng: 78.9629 },
              radius: 50,
            },
            recipients: { allUsers: true },
          });
          const a = res.data?.data;
          if (a) {
            const mapped = {
              id: a._id,
              title: a.title,
              description: a.description,
              type: a.type,
              severity: a.severity,
              location: a.location?.name || 'Unknown',
              coordinates: a.location?.coordinates
                ? [a.location.coordinates.lat || 20.5937, a.location.coordinates.lng || 78.9629]
                : [20.5937, 78.9629],
              issued: a.issuedAt,
              expires: a.expiresAt,
              source: a.source,
              active: a.isActive,
            };
            setAlerts((prev) => [mapped, ...prev]);
          }
        } else {
          const alert = {
            id: alerts.length + 1,
            ...newAlert,
            coordinates: [20.5937, 78.9629],
            issued: new Date().toISOString(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'system',
            active: true,
          };
          setAlerts((prev) => [alert, ...prev]);
        }
      } catch (e) {
        // ignore
      } finally {
        setNewAlert(null);
      }
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const activeFilterPass = filter === 'all' ? true : alert.active;
    const typeFilterPass = filterType === 'all' ? true : alert.type === filterType;
    const severityFilterPass = filterSeverity === 'all' ? true : alert.severity === filterSeverity;
    return activeFilterPass && typeFilterPass && severityFilterPass;
  });

  const hasWeatherKey = Boolean(process.env.REACT_APP_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key') || sessionStorage.getItem('openweather_api_key'));
  const hasGeminiKey = Boolean(process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key'));
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const hasGoogleKeys = Boolean(
    process.env.REACT_APP_GOOGLE_API_KEY ||
    process.env.REACT_APP_GOOGLE_CX ||
    localStorage.getItem('google_api_key') ||
    localStorage.getItem('google_cx') ||
    sessionStorage.getItem('google_api_key') ||
    sessionStorage.getItem('google_cx')
  );
  const hasMapsKey = Boolean(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || localStorage.getItem('google_maps_api_key') || sessionStorage.getItem('google_maps_api_key'));
  const weatherConnected = Boolean(weather && !weatherError);

  const runGemini = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const key = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key');
      if (!key) throw new Error('Missing Gemini API key');
      const text = await generateGemini(key, aiPrompt, aiModel);
      setAiResponse(text || '');
    } catch (e) {
      setAiError(e.message || 'AI request failed');
      if ((e.message || '').toLowerCase().includes('gemini')) {
        setGeminiKeyValue(localStorage.getItem('gemini_api_key') || '');
        setGeminiKeyOpen(true);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const runGeminiImage = async () => {
    setImageLoading(true);
    setImageError(null);
    try {
      const key = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key');
      if (!key) throw new Error('Missing Gemini API key');
      const img = await generateGeminiImage(key, aiPrompt, aiModel, imageMime);
      if (img?.mime && img.mime.startsWith('image/')) {
        setImageResponse(img);
      } else if (img?.mime === 'application/json' && img?.design) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 675;
          const ctx = canvas.getContext('2d');
          const bg = (img.design.backgroundColor || '#0d47a1');
          const accent = (img.design.accentColor || '#ffb300');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.15;
          for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(150 + i * 110, 120 + (i % 2) * 40, 80 + (i % 3) * 20, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 56px system-ui, sans-serif';
          const title = String(img.design.title || 'Emergency Preparedness');
          ctx.fillText(title, 60, 300);
          ctx.font = '400 28px system-ui, sans-serif';
          const subtitle = String(img.design.subtitle || 'Stay safe. Follow evacuation routes.');
          ctx.fillText(subtitle, 60, 350);
          const badges = Array.isArray(img.design.badges) ? img.design.badges.slice(0, 4) : [];
          let x = 60;
          let y = 420;
          badges.forEach((b) => {
            const text = String(b);
            ctx.fillStyle = accent;
            const w = ctx.measureText(text).width + 40;
            ctx.fillRect(x, y - 30, w, 40);
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 0.15;
            ctx.fillRect(x, y - 30, w, 40);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 20px system-ui, sans-serif';
            ctx.fillText(text, x + 20, y - 5);
            x += w + 20;
            if (x > canvas.width - 200) { x = 60; y += 60; }
          });
          const dataUrl = canvas.toDataURL(imageMime);
          const data = dataUrl.split(',')[1];
          setImageResponse({ mime: imageMime, data });
        } catch (err) {
          setImageError('Failed to render image');
        }
      } else {
        setImageError('No image data returned');
      }
    } catch (e) {
      setImageError(e.message || 'Image request failed');
      if ((e.message || '').toLowerCase().includes('gemini')) {
        setGeminiKeyValue(localStorage.getItem('gemini_api_key') || '');
        setGeminiKeyOpen(true);
      }
    } finally {
      setImageLoading(false);
    }
  };

  const runGoogleImageSearch = async () => {
    setImageLoading(true);
    setImageError(null);
    setImageResults([]);
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || localStorage.getItem('google_api_key') || sessionStorage.getItem('google_api_key');
      const cx = process.env.REACT_APP_GOOGLE_CX || localStorage.getItem('google_cx') || sessionStorage.getItem('google_cx');
      if (!apiKey || !cx) {
        setImageError('Missing Google API key or CSE ID');
        setGoogleApiKeyValue(localStorage.getItem('google_api_key') || '');
        setGoogleCxValue(localStorage.getItem('google_cx') || '');
        setGoogleKeyOpen(true);
        return;
      }
      const results = await searchGoogleImages(apiKey, cx, aiPrompt, imageCount);
      if (Array.isArray(results) && results.length) {
        setImageResults(results);
      } else {
        setImageError('No images found');
      }
    } catch (e) {
      const msg = e.message || 'Image search failed';
      setImageError(msg);
      if (msg.toLowerCase().includes('google')) {
        setGoogleApiKeyValue(localStorage.getItem('google_api_key') || '');
        setGoogleCxValue(localStorage.getItem('google_cx') || '');
        setGoogleKeyOpen(true);
      }
      if (/invalid.*api key/i.test(msg)) {
        setGoogleKeyStatus('invalid');
        setGoogleApiKeyError('API key invalid or unauthorized');
      }
      if (/invalid.*cse id|invalid custom search engine id/i.test(msg)) {
        setGoogleKeyStatus('invalid');
        setGoogleCxError('CSE ID invalid');
      }
      if (/quota|rate limit/i.test(msg)) {
        setGoogleKeyStatus('invalid');
      }
    } finally {
      setImageLoading(false);
    }
  };

  const loadAirQuality = async () => {
    setAqLoading(true);
    setAqError(null);
    let lat = 20.5937;
    let lon = 78.9629;
    try {
      await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => { lat = pos.coords.latitude; lon = pos.coords.longitude; resolve(); },
            () => resolve(),
            { timeout: 5000 }
          );
        } else { resolve(); }
      });
      const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || localStorage.getItem('google_maps_api_key') || sessionStorage.getItem('google_maps_api_key');
      if (!key) throw new Error('Missing Google Maps API key');
      const data = await fetchGoogleAirQuality(key, lat, lon, 'us');
      setAq(data);
    } catch (e) {
      setAqError(e.message || 'Unable to load air quality');
      if ((e.message || '').toLowerCase().includes('maps api')) {
        setMapsApiKeyValue(localStorage.getItem('google_maps_api_key') || '');
        setMapsKeyOpen(true);
      }
    } finally {
      setAqLoading(false);
    }
  };

  const importSelectedImage = async () => {
    try {
      if (!selectedImageUrl) return;
      setImageLoading(true);
      setImageError(null);
      const res = await fetch(selectedImageUrl, { mode: 'cors' });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = String(reader.result || '');
        const parts = dataUrl.split(',');
        const b64 = parts[1] || '';
        setImageResponse({ mime: blob.type || 'image/jpeg', data: b64 });
        setImageSource('generate');
        setImageLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setImageError('Unable to import selected image');
      setImageLoading(false);
    }
  };

  const testWeatherKey = async (keyOverride) => {
    try {
      const key = (keyOverride || apiKeyValue || process.env.REACT_APP_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key') || sessionStorage.getItem('openweather_api_key') || '').trim();
      if (!key) { setWeatherKeyStatus('unknown'); return; }
      await fetchWeather(20.5937, 78.9629, key);
      setWeatherKeyStatus('connected');
    } catch (e) {
      setWeatherKeyStatus('invalid');
    }
  };

  const testGeminiKey = async (keyOverride) => {
    try {
      const key = (keyOverride || geminiKeyValue || process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key') || '').trim();
      if (!key) { setGeminiKeyStatus('unknown'); return; }
      await generateGemini(key, 'Say hello', aiModel);
      setGeminiKeyStatus('connected');
    } catch (e) {
      setGeminiKeyStatus('invalid');
    }
  };

  const renderAiResponse = (text) => {
    const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim().length);
    const blocks = [];
    let currentList = [];
    lines.forEach((l) => {
      if (/^\s*(\*|-|•)\s+/.test(l)) {
        currentList.push(l.replace(/^\s*(\*|-|•)\s+/, ''));
      } else {
        if (currentList.length) {
          blocks.push({ type: 'list', items: currentList });
          currentList = [];
        }
        blocks.push({ type: 'p', text: l });
      }
    });
    if (currentList.length) blocks.push({ type: 'list', items: currentList });
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {blocks.map((b, i) => (
          b.type === 'list' ? (
            <List dense key={i} sx={{ pt: 0 }}>
              {b.items.map((it, j) => (
                <ListItem key={j} sx={{ py: 0 }}>
                  <ListItemText primary={it} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography key={i} variant="body2" sx={{ whiteSpace: 'pre-line' }}>{b.text}</Typography>
          )
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Disaster Alerts & Warnings</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {notificationsEnabled ? <Notifications /> : <NotificationsOff />}
                Alerts
              </Box>
            }
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilter(filter === 'all' ? 'active' : 'all')}
          >
            Filter
          </Button>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="earthquake">Earthquake</MenuItem>
              <MenuItem value="flood">Flood</MenuItem>
              <MenuItem value="fire">Fire</MenuItem>
              <MenuItem value="cyclone">Cyclone</MenuItem>
              <MenuItem value="heatwave">Heatwave</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={filterSeverity}
              label="Severity"
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={loadAlertsByLocation}
          >
            My Region
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateAlert}
          >
            Create Alert
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3, mb: 3, borderRadius: 2, color: 'common.white', background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {weather?.icon && (
              <img alt="" src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} style={{ width: 72, height: 72 }} />
            )}
            <Box>
              <Typography variant="h5">Current Weather</Typography>
              {weatherLoading ? (
                <Typography variant="body2">Loading...</Typography>
              ) : weather ? (
                <Typography variant="body1">{weather.temp}°C • {weather.description} • {weather.name}</Typography>
              ) : (
                <Typography variant="body2">Weather unavailable</Typography>
              )}
            </Box>
          </Box>
          {hasWeatherKey ? (
            <Chip label={weatherConnected ? 'API Connected' : 'API Configured'} color={weatherConnected ? 'success' : 'default'} size="small" />
          ) : (
            <Button variant="contained" color="secondary" onClick={() => { setApiKeyValue(localStorage.getItem('openweather_api_key') || ''); setApiKeyOpen(true); }}>
              Set API Key
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom>AI Assistant</Typography>
                <Chip label={aiModel} size="small" />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Ask about alerts, weather, or safety tips"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                {aiMode === 'text' ? (
                  <Button variant="contained" onClick={runGemini} disabled={aiLoading}>
                    {aiLoading ? 'Thinking…' : 'Ask AI'}
                  </Button>
                ) : (
                  imageSource === 'generate' ? (
                    <Button variant="contained" onClick={runGeminiImage} disabled={imageLoading}>
                      {imageLoading ? 'Generating…' : 'Generate Image'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={runGoogleImageSearch} disabled={imageLoading}>
                      {imageLoading ? 'Searching…' : 'Search Images'}
                    </Button>
                  )
                )}
              </Box>
              {!hasGeminiKey && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => { setGeminiKeyValue(localStorage.getItem('gemini_api_key') || ''); setGeminiKeyOpen(true); }}>
                    Set Gemini Key
                  </Button>
                </Box>
              )}
              {aiMode === 'image' && imageSource === 'search' && !hasGoogleKeys && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => { setGoogleApiKeyValue(localStorage.getItem('google_api_key') || ''); setGoogleCxValue(localStorage.getItem('google_cx') || ''); setGoogleKeyOpen(true); }}>
                    Set Google Keys
                  </Button>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>AI Model</InputLabel>
                  <Select value={aiModel} label="AI Model" onChange={(e) => setAiModel(e.target.value)}>
                    <MenuItem value="gemini-2.0-flash">gemini-2.0-flash</MenuItem>
                    <MenuItem value="gemini-2.0-pro">gemini-2.0-pro</MenuItem>
                    <MenuItem value="gemini-1.5-flash">gemini-1.5-flash</MenuItem>
                    <MenuItem value="gemini-1.5-pro">gemini-1.5-pro</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select value={aiMode} label="Mode" onChange={(e) => setAiMode(e.target.value)}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="image">Image</MenuItem>
                  </Select>
                </FormControl>
                {aiMode === 'image' && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Source</InputLabel>
                      <Select value={imageSource} label="Source" onChange={(e) => setImageSource(e.target.value)}>
                        <MenuItem value="generate">AI Generate</MenuItem>
                        <MenuItem value="search">Google Images</MenuItem>
                      </Select>
                    </FormControl>
                    {imageSource === 'search' && (
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Count</InputLabel>
                        <Select value={imageCount} label="Count" onChange={(e) => setImageCount(Number(e.target.value))}>
                          <MenuItem value={2}>2</MenuItem>
                          <MenuItem value={3}>3</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                    {imageSource === 'generate' && (
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Format</InputLabel>
                        <Select value={imageMime} label="Format" onChange={(e) => setImageMime(e.target.value)}>
                          <MenuItem value="image/png">image/png</MenuItem>
                          <MenuItem value="image/jpeg">image/jpeg</MenuItem>
                          <MenuItem value="image/webp">image/webp</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </Box>
              {aiMode === 'text' ? (
                aiError ? (
                  <Alert sx={{ mt: 2 }} severity="warning">{aiError}</Alert>
                ) : aiResponse ? (
                  <Box sx={{ mt: 2 }}>
                    {renderAiResponse(aiResponse)}
                  </Box>
                ) : null
              ) : (
                imageSource === 'generate' ? (
                  imageError ? (
                    <Alert sx={{ mt: 2 }} severity="warning">{imageError}</Alert>
                  ) : imageResponse ? (
                    <Box sx={{ mt: 2 }}>
                      <img alt="AI generated" src={`data:${imageResponse.mime};base64,${imageResponse.data}`} style={{ maxWidth: '100%', borderRadius: 8 }} />
                    </Box>
                  ) : null
                ) : (
                  imageError ? (
                    <Alert sx={{ mt: 2 }} severity="warning">{imageError}</Alert>
                  ) : (
                    <>
                      {imageResults && imageResults.length ? (
                        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                          {imageResults.map((r, i) => (
                            <Box key={i} sx={{ border: selectedImageUrl === r.url ? '2px solid #1976d2' : '2px solid transparent', borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedImageUrl(r.url)}>
                              <img alt={r.title || 'Search result'} src={r.thumbnail || r.url} style={{ width: '100%', display: 'block' }} />
                            </Box>
                          ))}
                        </Box>
                      ) : null}
                      {selectedImageUrl ? (
                        <>
                          <Box sx={{ mt: 2 }}>
                            <img alt="Selected" src={selectedImageUrl} style={{ maxWidth: '100%', borderRadius: 8 }} />
                          </Box>
                          <Box sx={{ mt: 1 }}>
                            <Button variant="contained" onClick={importSelectedImage} disabled={imageLoading}>Use Selected Image</Button>
                          </Box>
                        </>
                      ) : null}
                    </>
                  )
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Weather
              </Typography>
              {weatherLoading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : weatherError ? (
                <Box>
                  <Alert severity="warning">{weatherError}</Alert>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => {
                      setApiKeyValue(localStorage.getItem('openweather_api_key') || '');
                      setApiKeyOpen(true);
                    }}>Set API Key</Button>
                  </Box>
                </Box>
              ) : weather ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {weather.icon && (
                    <img
                      alt=""
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      style={{ width: 64, height: 64 }}
                    />
                  )}
                  <Box>
                    <Typography variant="h3">{weather.temp}°C</Typography>
                    <Typography variant="body2">{weather.description} • {weather.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Humidity {weather.humidity}% • Wind {weather.wind} m/s
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Weather unavailable</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Map View */}
        {showMap && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Alert Locations</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => setShowMap(!showMap)} size="small">
                      <FilterList />
                    </IconButton>
                    <IconButton onClick={geolocateMap} size="small">
                      <LocationOn />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                  <MapContainer
                    key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {alerts.map((alert) => (
                      <Marker key={alert.id} position={alert.coordinates}>
                        <Popup>
                          <Typography variant="subtitle2" gutterBottom>
                            {alert.title}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {alert.description}
                          </Typography>
                          <Chip
                            label={alert.type}
                            size="small"
                            color={getAlertColor(alert.type)}
                          />
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Alerts List */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Active Alerts ({filteredAlerts.length})
          </Typography>
          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity={getAlertColor(alert.type)}
                sx={{ mb: 2 }}
                icon={getAlertIcon(alert.type)}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={alert.severity}
                      size="small"
                      color={alert.severity === 'high' ? 'error' : 'warning'}
                    />
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => openDetails(alert.id)}
                    >
                      Details
                    </Button>
                  </Box>
                }
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <Typography variant="body2">
                  {alert.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                    {alert.location}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Issued: {new Date(alert.issued).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expires: {new Date(alert.expires).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: {alert.source}
                  </Typography>
                </Box>
              </Alert>
            </motion.div>
          ))}
        </Grid>
      </Grid>

      <Dialog open={apiKeyOpen} onClose={() => setApiKeyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>OpenWeather API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API Key"
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Chip label={hasWeatherKey ? 'Configured' : 'Not Configured'} size="small" />
            <Chip label={weatherKeyStatus === 'connected' ? 'Connected' : weatherKeyStatus === 'invalid' ? 'Invalid' : 'Unknown'} color={weatherKeyStatus === 'connected' ? 'success' : weatherKeyStatus === 'invalid' ? 'error' : 'default'} size="small" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => setApiKeyValue(process.env.REACT_APP_OPENWEATHER_API_KEY || '')}>Use Env Key</Button>
            <Button variant="outlined" onClick={() => setApiKeyValue(localStorage.getItem('openweather_api_key') || sessionStorage.getItem('openweather_api_key') || '')}>Use Stored Key</Button>
            <Button variant="outlined" color="error" onClick={() => { localStorage.removeItem('openweather_api_key'); sessionStorage.removeItem('openweather_api_key'); setApiKeyValue(''); setWeatherKeyStatus('unknown'); }}>Clear Key</Button>
            <Button variant="contained" onClick={() => testWeatherKey()}>Test Key</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              localStorage.setItem('openweather_api_key', apiKeyValue.trim());
              setApiKeyOpen(false);
              await loadWeather();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={googleKeyOpen} onClose={() => setGoogleKeyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Google Image Search Keys</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Google API Key"
            value={googleApiKeyValue}
            onChange={(e) => { setGoogleApiKeyValue(e.target.value); if (googleApiKeyError) setGoogleApiKeyError(''); }}
            sx={{ mb: 2 }}
            error={Boolean(googleApiKeyError)}
            helperText={googleApiKeyError || ''}
          />
          <TextField
            fullWidth
            label="Custom Search Engine ID (cx)"
            value={googleCxValue}
            onChange={(e) => { setGoogleCxValue(e.target.value); if (googleCxError) setGoogleCxError(''); }}
            error={Boolean(googleCxError)}
            helperText={googleCxError || ''}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Chip label={hasGoogleKeys ? 'Configured' : 'Not Configured'} size="small" />
            <Chip label={googleKeyStatus === 'connected' ? 'Connected' : googleKeyStatus === 'invalid' ? 'Invalid' : 'Unknown'} color={googleKeyStatus === 'connected' ? 'success' : googleKeyStatus === 'invalid' ? 'error' : 'default'} size="small" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => { setGoogleApiKeyValue(process.env.REACT_APP_GOOGLE_API_KEY || ''); setGoogleCxValue(process.env.REACT_APP_GOOGLE_CX || ''); }}>Use Env Keys</Button>
            <Button variant="outlined" onClick={() => { setGoogleApiKeyValue(localStorage.getItem('google_api_key') || sessionStorage.getItem('google_api_key') || ''); setGoogleCxValue(localStorage.getItem('google_cx') || sessionStorage.getItem('google_cx') || ''); }}>Use Stored Keys</Button>
            <Button variant="outlined" color="error" onClick={() => { localStorage.removeItem('google_api_key'); localStorage.removeItem('google_cx'); sessionStorage.removeItem('google_api_key'); sessionStorage.removeItem('google_cx'); setGoogleApiKeyValue(''); setGoogleCxValue(''); setGoogleKeyStatus('unknown'); }}>Clear Keys</Button>
            <Button variant="contained" onClick={async () => { try { const r = await searchGoogleImages(googleApiKeyValue.trim(), googleCxValue.trim(), 'test', 1); setGoogleKeyStatus(Array.isArray(r) ? 'connected' : 'invalid'); } catch (err) { setGoogleKeyStatus('invalid'); setGoogleApiKeyError(googleApiKeyValue.trim() ? '' : 'API key required'); setGoogleCxError(googleCxValue.trim() ? '' : 'CSE ID required'); } }}>Test Keys</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoogleKeyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const key = googleApiKeyValue.trim();
              const cx = googleCxValue.trim();
              let valid = true;
              if (!key) { setGoogleApiKeyError('API key required'); valid = false; }
              if (!cx) { setGoogleCxError('CSE ID required'); valid = false; }
              if (!valid) return;
              localStorage.setItem('google_api_key', key);
              localStorage.setItem('google_cx', cx);
              setGoogleKeyOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={geminiKeyOpen} onClose={() => setGeminiKeyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Gemini API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API Key"
            value={geminiKeyValue}
            onChange={(e) => setGeminiKeyValue(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Chip label={hasGeminiKey ? 'Configured' : 'Not Configured'} size="small" />
            <Chip label={geminiKeyStatus === 'connected' ? 'Connected' : geminiKeyStatus === 'invalid' ? 'Invalid' : 'Unknown'} color={geminiKeyStatus === 'connected' ? 'success' : geminiKeyStatus === 'invalid' ? 'error' : 'default'} size="small" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => setGeminiKeyValue(process.env.REACT_APP_GEMINI_API_KEY || '')}>Use Env Key</Button>
            <Button variant="outlined" onClick={() => setGeminiKeyValue(localStorage.getItem('gemini_api_key') || sessionStorage.getItem('gemini_api_key') || '')}>Use Stored Key</Button>
            <Button variant="outlined" color="error" onClick={() => { localStorage.removeItem('gemini_api_key'); sessionStorage.removeItem('gemini_api_key'); setGeminiKeyValue(''); setGeminiKeyStatus('unknown'); }}>Clear Key</Button>
            <Button variant="contained" onClick={() => testGeminiKey()}>Test Key</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeminiKeyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              localStorage.setItem('gemini_api_key', geminiKeyValue.trim());
              setGeminiKeyOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          ) : detailsError ? (
            <Alert severity="error">{detailsError}</Alert>
          ) : selectedAlert ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{selectedAlert.title}</Typography>
              <Typography variant="body2">{selectedAlert.description}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={selectedAlert.type} size="small" color={getAlertColor(selectedAlert.type)} />
                <Chip label={selectedAlert.severity} size="small" color={selectedAlert.severity === 'high' ? 'error' : 'warning'} />
              </Box>
              <Typography variant="caption" color="text.secondary">Source: {selectedAlert.source}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No details</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                if (selectedAlert?._id) await API.post(`/alerts/${selectedAlert._id}/acknowledge`);
                setDetailsOpen(false);
              } catch (e) {}
            }}
          >
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toastOpen} onClose={() => setToastOpen(false)}>
        <DialogTitle>{toastMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setToastOpen(false)}>Dismiss</Button>
        </DialogActions>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={Boolean(newAlert)} onClose={handleCloseAlert} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Alert</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alert Title"
                value={newAlert?.title || ''}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newAlert?.description || ''}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Alert Type</InputLabel>
                <Select
                  value={newAlert?.type || 'warning'}
                  label="Alert Type"
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                >
                  <MenuItem value="warning">Weather Warning</MenuItem>
                  <MenuItem value="earthquake">Earthquake</MenuItem>
                  <MenuItem value="flood">Flood</MenuItem>
                  <MenuItem value="fire">Fire</MenuItem>
                  <MenuItem value="cyclone">Cyclone</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newAlert?.severity || 'medium'}
                  label="Severity"
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newAlert?.location || ''}
                onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlert}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAlert}>
            Create Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Stats */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Alert Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Alerts
                </Typography>
                <Typography variant="h3" color="warning.main">
                  {alerts.filter(a => a.active).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  High Severity
                </Typography>
                <Typography variant="h3" color="error.main">
                  {alerts.filter(a => a.severity === 'high').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h3" color="info.main">
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Time
                </Typography>
                <Typography variant="h3" color="success.main">
                  15m
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DisasterAlerts;
