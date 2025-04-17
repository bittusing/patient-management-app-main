import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Box, 
  CircularProgress, 
  Divider,
  Alert,
  Grid 
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import DriveFileService from '../services/GoogleDriveService';

const SelectDriveFile = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Google API on component mount
  useEffect(() => {
    const initializeGoogleApi = async () => {
      try {
        setIsLoading(true);
        await DriveFileService.initGoogleAPI();
        setIsInitialized(true);
        setIsSignedIn(DriveFileService.isSignedIn());
      } catch (error) {
        console.error('Failed to initialize Google API', error);
        setError('Failed to initialize Google API: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogleApi();
  }, []);

  // Handle Google sign-in
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await DriveFileService.signIn();
      setIsSignedIn(true);
      await fetchSheets();
    } catch (error) {
      console.error('Failed to sign in', error);
      setError('Failed to sign in: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await DriveFileService.signOut();
      setIsSignedIn(false);
      setFiles([]);
      setSelectedFile(null);
      localStorage.removeItem('selectedSpreadsheetId');
    } catch (error) {
      console.error('Failed to sign out', error);
      setError('Failed to sign out: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Google Sheets
  const fetchSheets = async () => {
    try {
      setIsLoading(true);
      const sheets = await DriveFileService.listSheets();
      setFiles(sheets);
    } catch (error) {
      console.error('Failed to fetch sheets', error);
      setError('Failed to fetch sheets: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a file
  const selectFile = (file) => {
    DriveFileService.selectSpreadsheet(file.id);
    setSelectedFile(file);
  };

  // Check if a currently stored file id is selected
  useEffect(() => {
    const currentSpreadsheetId = DriveFileService.getSelectedSpreadsheetId();
    if (currentSpreadsheetId && files.length > 0) {
      const currentFile = files.find(file => file.id === currentSpreadsheetId);
      if (currentFile) {
        setSelectedFile(currentFile);
      }
    }
  }, [files]);

  // Render component
  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Google Sheet
        </Typography>
        <Typography variant="body1" paragraph>
          Select a Google Sheet to use as the database for patient records.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!isInitialized ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            {isSignedIn ? (
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={fetchSheets}
                    disabled={isLoading}
                  >
                    Refresh Sheets
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    Sign Out
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSignIn}
                disabled={isLoading}
              >
                Sign in to Google Drive
              </Button>
            )}
          </Box>

          {isLoading && <CircularProgress />}

          {isSignedIn && !isLoading && (
            <>
              {selectedFile && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="success">
                    Currently using: <strong>{selectedFile.name}</strong>
                  </Alert>
                </Box>
              )}

              <Typography variant="h6" component="h3" gutterBottom>
                Available Google Sheets
              </Typography>
              
              {files.length === 0 ? (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body1">
                    No Google Sheets found. Click "Refresh Sheets" to reload or create a new Google Sheet.
                  </Typography>
                </Paper>
              ) : (
                <Paper>
                  <List>
                    {files.map((file, index) => (
                      <React.Fragment key={file.id}>
                        <ListItem 
                          button 
                          onClick={() => selectFile(file)}
                          selected={selectedFile && selectedFile.id === file.id}
                        >
                          <ListItemText 
                            primary={file.name} 
                            secondary={file.id} 
                          />
                          {selectedFile && selectedFile.id === file.id && (
                            <Typography variant="body2" color="primary">
                              Selected
                            </Typography>
                          )}
                        </ListItem>
                        {index < files.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SelectDriveFile; 