import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddPatient from './components/AddPatient';
import EditPatient from './components/EditPatient';
import SearchPatient from './components/SearchPatient';
import SelectDriveFile from './components/SelectDriveFile';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Patient Management System
          </Typography>
          <Paper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="patient management tabs"
              >
                <Tab label="Add Patient" />
                <Tab label="Edit Patient" />
                <Tab label="Search" />
                <Tab label="Select File" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && <AddPatient />}
              {tabValue === 1 && <EditPatient />}
              {tabValue === 2 && <SearchPatient />}
              {tabValue === 3 && <SelectDriveFile />}
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
