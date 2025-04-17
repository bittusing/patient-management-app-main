import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SheetsService from '../services/GoogleSheetsService';
import DriveService from '../services/GoogleDriveService';

const SearchPatient = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if a spreadsheet is selected
  const isSpreadsheetSelected = DriveService.getSelectedSpreadsheetId() !== null;

  // Handle search
  const handleSearch = async () => {
    if (!isSpreadsheetSelected) {
      setSnackbar({
        open: true,
        message: 'Please select a Google Sheet first',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      let results;
      
      if (searchQuery.trim() === '') {
        // If search query is empty, get all patients
        results = await SheetsService.getAllPatients();
      } else {
        // Otherwise, search for patients
        results = await SheetsService.searchPatients(searchQuery);
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setSnackbar({
          open: true,
          message: 'No patients found',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error searching for patients:', error);
      setSnackbar({
        open: true,
        message: `Error searching for patients: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle view patient details
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  // Handle delete patient
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialog(true);
  };

  // Confirm delete patient
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await SheetsService.deletePatient(selectedPatient.patientId);
      
      // Remove the deleted patient from the search results
      setSearchResults(prevResults => 
        prevResults.filter(patient => patient.patientId !== selectedPatient.patientId)
      );
      
      setSnackbar({
        open: true,
        message: 'Patient deleted successfully',
        severity: 'success'
      });
      
      // Close the dialog
      setDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setSnackbar({
        open: true,
        message: `Error deleting patient: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setShowDetails(false);
    setDeleteDialog(false);
    setSelectedPatient(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Search Patients
      </Typography>

      {!isSpreadsheetSelected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a Google Sheet in the "Select File" tab before searching for patients.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Search by Name, ID, Phone, Location, or Address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading || !isSpreadsheetSelected}
              fullWidth
              sx={{ mt: 1, height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Leave the search field empty to view all patients
        </Typography>
      </Paper>

      <Paper>
        {searchResults.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((patient) => (
                  <TableRow key={patient.patientId}>
                    <TableCell>{patient.patientId}</TableCell>
                    <TableCell>{patient.patientName}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.location}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewDetails(patient)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {/* Edit button just for UI, would redirect to Edit Tab */}
                      <IconButton 
                        color="secondary"
                        title="Edit Patient"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(patient)}
                        title="Delete Patient"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="body1">
                {isSpreadsheetSelected 
                  ? 'Search for patients to display results' 
                  : 'Please select a Google Sheet first'}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Patient Details Dialog */}
      <Dialog open={showDetails} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6">Basic Information</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Patient ID</Typography>
                <Typography variant="body1">{selectedPatient.patientId}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body1">{selectedPatient.patientName}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Age / Gender</Typography>
                <Typography variant="body1">{selectedPatient.age} / {selectedPatient.gender}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography variant="body1">{selectedPatient.phone}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Location</Typography>
                <Typography variant="body1">{selectedPatient.location}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Address</Typography>
                <Typography variant="body1">{selectedPatient.address}</Typography>
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>Medical Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Prescription</Typography>
                <Typography variant="body1">{selectedPatient.prescription}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Dose</Typography>
                <Typography variant="body1">{selectedPatient.dose}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Visit Date</Typography>
                <Typography variant="body1">{selectedPatient.visitDate}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Next Visit</Typography>
                <Typography variant="body1">{selectedPatient.nextVisit}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Bill</Typography>
                <Typography variant="body1">${selectedPatient.bill}</Typography>
              </Grid>

              {/* Physician Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>Physician Information</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Physician ID</Typography>
                <Typography variant="body1">{selectedPatient.physicianId}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Physician Name</Typography>
                <Typography variant="body1">{selectedPatient.physicianName}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="subtitle2">Physician Phone</Typography>
                <Typography variant="body1">{selectedPatient.physicianPhone}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete patient {selectedPatient?.patientName} ({selectedPatient?.patientId})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchPatient; 