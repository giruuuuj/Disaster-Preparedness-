import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';

const ProblemImpact = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Problem & Impact
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Problem Description
              </Typography>
              <Typography variant="body1" paragraph>
                In India, schools and colleges are often unprepared for natural disasters such as earthquakes, floods, and fires. While emergency guidelines exist on paper, there is a lack of structured disaster management education integrated into the curriculum. Institutions lack digital tools to simulate disaster scenarios or conduct virtual drills to train students and staff on safety protocols.
              </Typography>
              <Typography variant="body1" paragraph>
                Furthermore, there’s a gap in localized awareness—many students are unaware of how to react during disasters specific to their region. Manual drills, where they occur, are infrequent and often poorly coordinated, failing to instill practical preparedness.
              </Typography>

              <Typography variant="h6" gutterBottom>
                Impact / Why this needs to be solved
              </Typography>
              <Typography variant="body1" paragraph>
                Lack of awareness and preparedness leads to panic, chaos, and potentially fatal outcomes during emergencies. By integrating disaster education into regular learning, institutions can equip students and staff with life-saving knowledge and skills. This is especially critical in areas prone to natural calamities.
              </Typography>
              <Typography variant="body1" paragraph>
                Empowering young people with this knowledge not only makes campuses safer but also contributes to a more disaster-resilient society.
              </Typography>

              <Typography variant="h6" gutterBottom>
                Expected Outcomes
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">Digital Platform</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Interactive disaster education modules, region-specific alerts, and virtual drills.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">Gamified Learning</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Points, badges, and progress tracking to improve engagement.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">Emergency Tools</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact directories and real-time communication during disasters.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">Admin Dashboards</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Preparedness scores and drill participation tracking for institutions.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Stakeholders / Beneficiaries
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Students" color="primary" />
                <Chip label="Teachers" color="secondary" />
                <Chip label="Administrative Staff" />
                <Chip label="Institutions" />
                <Chip label="Local Response Teams" />
                <Chip label="Parents" />
                <Chip label="Government (NDMA, Education Ministry)" />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Supporting Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                NDMA reports show low awareness levels in schools despite India’s high disaster vulnerability index. UNDRR recommends integrating disaster risk reduction into education policies.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This application addresses the gaps in disaster preparedness through structured education, simulations, alerts, and institutional tracking.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Education" />
                <Chip label="Simulation" />
                <Chip label="Alerts" />
                <Chip label="Analytics" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProblemImpact;

