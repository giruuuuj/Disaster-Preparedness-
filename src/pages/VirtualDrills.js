// src/pages/VirtualDrills.js
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Replay,
  Timer,
  Warning,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drills = [
  {
    id: 1,
    title: 'Earthquake Evacuation Drill',
    description: 'Simulate an earthquake scenario and practice evacuation procedures',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'earthquake',
    difficulty: 'Beginner',
    duration: '10 min',
    completed: true,
    score: 95,
    steps: [
      'Drop down onto your hands and knees',
      'Cover your head and neck under a sturdy table',
      'Hold on until shaking stops',
      'Evacuate to designated safe zone',
      'Account for all personnel',
    ],
  },
  {
    id: 2,
    title: 'Fire Emergency Drill',
    description: 'Practice fire evacuation and use of fire extinguishers',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'fire',
    difficulty: 'Intermediate',
    duration: '15 min',
    completed: false,
    score: null,
    steps: [
      'Activate nearest fire alarm',
      'Evacuate using nearest exit',
      'Meet at assembly point',
      'Practice fire extinguisher use',
      'Conduct head count',
    ],
  },
  {
    id: 3,
    title: 'Flood Response Simulation',
    description: 'Learn flood response procedures and safe evacuation routes',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800',
    type: 'flood',
    difficulty: 'Advanced',
    duration: '20 min',
    completed: false,
    score: null,
    steps: [
      'Monitor water levels',
      'Move to higher ground',
      'Avoid walking through floodwaters',
      'Use designated evacuation routes',
      'Account for all individuals',
    ],
  },
];

const VirtualDrills = () => {
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const handleDrillClick = (drill) => {
    setSelectedDrill(drill);
    setActiveStep(0);
    setIsRunning(false);
    setTimeLeft(drill.duration === '10 min' ? 600 : drill.duration === '15 min' ? 900 : 1200);
  };

  const handleClose = () => {
    setSelectedDrill(null);
    setIsRunning(false);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsRunning(false);
    setTimeLeft(selectedDrill.duration === '10 min' ? 600 : selectedDrill.duration === '15 min' ? 900 : 1200);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  React.useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'earthquake':
        return 'warning';
      case 'fire':
        return 'error';
      case 'flood':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Virtual Disaster Drills
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        Practice disaster response in a safe virtual environment. Complete drills to improve your preparedness score.
      </Alert>

      <Grid container spacing={3}>
        {drills.map((drill) => (
          <Grid item xs={12} sm={6} md={4} key={drill.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => handleDrillClick(drill)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={drill.image}
                  alt={drill.title}
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
                      {drill.title}
                    </Typography>
                    <Chip
                      label={drill.type}
                      size="small"
                      color={getTypeColor(drill.type)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {drill.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={drill.difficulty}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      <Timer fontSize="small" sx={{ mr: 0.5 }} />
                      {drill.duration}
                    </Typography>
                    {drill.completed && (
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                        <CheckCircle color="success" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="success.main">
                          Score: {drill.score}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrow />}
                  sx={{ mt: 'auto' }}
                >
                  {drill.completed ? 'Retry Drill' : 'Start Drill'}
                </Button>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Drill Simulation Dialog */}
      <Dialog
        open={Boolean(selectedDrill)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedDrill?.title}
              <Chip
                label={selectedDrill?.type}
                color={getTypeColor(selectedDrill?.type)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer />
              <Typography variant="h6">{formatTime(timeLeft)}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Important:</strong> This is a simulation. In real emergencies, follow official guidelines and evacuate immediately.
            </Typography>
          </Alert>

          <Stepper activeStep={activeStep} orientation="vertical">
            {selectedDrill?.steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  optional={
                    index === activeStep ? (
                      <Typography variant="caption">Current Step</Typography>
                    ) : null
                  }
                >
                  <Typography variant="body1">{step}</Typography>
                </StepLabel>
                <StepContent>
                  {index === activeStep && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Follow the instructions carefully. When ready, proceed to next step.
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForward />}
                        >
                          {index === selectedDrill.steps.length - 1 ? 'Complete' : 'Next Step'}
                        </Button>
                        <Button onClick={handleBack} disabled={index === 0}>
                          Back
                        </Button>
                      </Box>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === selectedDrill?.steps.length && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Drill Completed!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Great job! You've successfully completed the {selectedDrill?.title}.
              </Typography>
              <Typography variant="h6" color="primary">
                Score: 92%
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Simulation Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(activeStep / (selectedDrill?.steps.length || 1)) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={isRunning ? handlePause : handleStart}
              color="primary"
              disabled={activeStep === selectedDrill?.steps.length}
            >
              {isRunning ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleReset} color="secondary">
              <Replay />
            </IconButton>
          </Box>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="contained" onClick={handleClose}>
            Complete Drill
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Drill Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={33}
                  sx={{ height: 20, borderRadius: 2, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  1 of 3 drills completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Score
                </Typography>
                <Typography variant="h3" color="primary">
                  95%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on completed drills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default VirtualDrills;