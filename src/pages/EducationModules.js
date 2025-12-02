// src/pages/EducationModules.js
import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Lock,
  Book,
  Quiz,
  VideoLibrary,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const modules = [
  {
    id: 1,
    title: 'Earthquake Safety',
    description: 'Learn how to stay safe during earthquakes, including Drop, Cover, and Hold On techniques.',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'earthquake',
    duration: '45 min',
    progress: 100,
    completed: true,
    lessons: [
      { id: 1, title: 'Introduction to Earthquakes', type: 'video', duration: '10 min', completed: true },
      { id: 2, title: 'Safety Protocols', type: 'reading', duration: '15 min', completed: true },
      { id: 3, title: 'Practice Quiz', type: 'quiz', duration: '20 min', completed: true },
    ],
  },
  {
    id: 2,
    title: 'Fire Emergency Response',
    description: 'Essential knowledge for fire prevention and emergency evacuation procedures.',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w-800',
    type: 'fire',
    duration: '60 min',
    progress: 75,
    completed: false,
    lessons: [
      { id: 1, title: 'Fire Prevention', type: 'reading', duration: '20 min', completed: true },
      { id: 2, title: 'Evacuation Procedures', type: 'video', duration: '25 min', completed: true },
      { id: 3, title: 'Fire Extinguisher Usage', type: 'quiz', duration: '15 min', completed: false },
    ],
  },
  {
    id: 3,
    title: 'Flood Preparedness',
    description: 'How to prepare for, respond to, and recover from flood emergencies.',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'flood',
    duration: '50 min',
    progress: 30,
    completed: false,
    lessons: [
      { id: 1, title: 'Flood Risk Assessment', type: 'video', duration: '15 min', completed: true },
      { id: 2, title: 'Safety Measures', type: 'reading', duration: '20 min', completed: false },
      { id: 3, title: 'Emergency Kit Preparation', type: 'quiz', duration: '15 min', completed: false },
    ],
  },
  {
    id: 4,
    title: 'First Aid Basics',
    description: 'Essential first aid skills for common injuries during disasters.',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'first-aid',
    duration: '75 min',
    progress: 0,
    completed: false,
    locked: true,
    lessons: [],
  },
];

const getPointsForModule = (module) => {
  const base = 50;
  const progressPoints = Math.round(module.progress || 0);
  const lessonBonus = (module.lessons || []).filter((l) => l.completed).length * 10;
  return base + progressPoints + lessonBonus;
};

const getBadge = (module) => {
  if (module.completed) return 'Champion';
  if ((module.progress || 0) >= 75) return 'Advanced';
  if ((module.progress || 0) >= 30) return 'Learner';
  return null;
};

const EducationModules = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleModuleClick = (module) => {
    if (!module.locked) {
      setSelectedModule(module);
    }
  };

  const handleClose = () => {
    setSelectedModule(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'earthquake':
        return 'warning';
      case 'fire':
        return 'error';
      case 'flood':
        return 'info';
      case 'first-aid':
        return 'success';
      default:
        return 'default';
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoLibrary color="primary" />;
      case 'reading':
        return <Book color="secondary" />;
      case 'quiz':
        return <Quiz color="success" />;
      default:
        return <Book />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Disaster Education Modules
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="All Modules" />
        <Tab label="In Progress" />
        <Tab label="Completed" />
        <Tab label="Locked" />
      </Tabs>

      <Grid container spacing={3}>
        {modules
          .filter((module) => {
            if (tabValue === 1) return module.progress > 0 && module.progress < 100;
            if (tabValue === 2) return module.completed;
            if (tabValue === 3) return module.locked;
            return true;
          })
          .map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: module.locked ? 'not-allowed' : 'pointer',
                    opacity: module.locked ? 0.7 : 1,
                    position: 'relative',
                  }}
                  onClick={() => handleModuleClick(module)}
                >
                  {module.locked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                      }}
                    >
                      <Lock color="disabled" />
                    </Box>
                  )}
                  {!module.locked && getBadge(module) && (
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                      <Chip label={getBadge(module)} color="success" size="small" />
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    height="140"
                    image={module.image}
                    alt={module.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {module.title}
                      </Typography>
                      <Chip
                        label={module.type}
                        size="small"
                        color={getTypeColor(module.type)}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {module.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {module.duration}
                      </Typography>
                      <Chip label={`${getPointsForModule(module)} pts`} size="small" color="secondary" sx={{ ml: 'auto' }} />
                      {module.completed && (
                        <CheckCircle
                          color="success"
                          sx={{ ml: 'auto', fontSize: 20 }}
                        />
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={module.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, textAlign: 'center' }}
                    >
                      {module.progress}% Complete
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={module.locked}
                    startIcon={<PlayArrow />}
                    sx={{ mt: 'auto' }}
                  >
                    {module.locked ? 'Locked' : module.completed ? 'Review' : 'Continue'}
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
      </Grid>

      {/* Module Detail Dialog */}
      <Dialog
        open={Boolean(selectedModule)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedModule?.title}
            <Chip
              label={selectedModule?.type}
              color={getTypeColor(selectedModule?.type)}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            {selectedModule?.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Lessons
          </Typography>
          
          {selectedModule?.lessons?.map((lesson, index) => (
            <Box
              key={lesson.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: lesson.completed ? 'success.light' : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {index + 1}.
                </Typography>
                {getLessonIcon(lesson.type)}
                <Box>
                  <Typography variant="body1">{lesson.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lesson.type} • {lesson.duration}
                  </Typography>
                </Box>
              </Box>
              {lesson.completed ? (
                <CheckCircle color="success" />
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrow />}
                >
                  Start
                </Button>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="contained" onClick={handleClose}>
            Start Module
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationModules;
