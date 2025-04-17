import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import SheetsService from '../services/GoogleSheetsService';
import DriveService from '../services/GoogleDriveService';

const EditPatient = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    location: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    prescription: '',
    dose: '',
    visitDate: null,
    nextVisit: null,
    physicianId: '',
    physicianName: '',
    physicianPhone: '',
    bill: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Check if a spreadsheet is selected
  const isSpreadsheetSelected = DriveService.getSelectedSpreadsheetId() !== null;

  // Fetch all patients on component mount if a spreadsheet is selected
  useEffect(() => {
    if (isSpreadsheetSelected) {
      fetchPatients();
    }
  }, [isSpreadsheetSelected]);

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await SheetsService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setSnackbar({
        open: true,
        message: `Error fetching patients: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Search for patients
  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      fetchPatients();
      return;
    }

    try {
      setSearching(true);
      const results = await SheetsService.searchPatients(searchQuery);
      setPatients(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      setSnackbar({
        open: true,
        message: `Error searching patients: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSearching(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (event, patient) => {
    setSelectedPatient(patient);
    if (patient) {
      // Parse dates from string format
      const visitDate = patient.visitDate ? new Date(patient.visitDate) : null;
      const nextVisit = patient.nextVisit ? new Date(patient.nextVisit) : null;
      
      setFormData({
        ...patient,
        visitDate,
        nextVisit
      });
    } else {
      // Reset form if no patient selected
      setFormData({
        patientId: '',
        patientName: '',
        location: '',
        age: '',
        gender: '',
        phone: '',
        address: '',
        prescription: '',
        dose: '',
        visitDate: null,
        nextVisit: null,
        physicianId: '',
        physicianName: '',
        physicianPhone: '',
        bill: ''
      });
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSpreadsheetSelected) {
      setSnackbar({
        open: true,
        message: 'Please select a Google Sheet first',
        severity: 'error'
      });
      return;
    }
    
    if (!selectedPatient) {
      setSnackbar({
        open: true,
        message: 'Please select a patient to edit',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the date data for Google Sheets
      const formattedData = {
        ...formData,
        visitDate: formData.visitDate ? formData.visitDate.toISOString().split('T')[0] : '',
        nextVisit: formData.nextVisit ? formData.nextVisit.toISOString().split('T')[0] : ''
      };
      
      await SheetsService.updatePatient(formattedData);
      
      setSnackbar({
        open: true,
        message: 'Patient updated successfully',
        severity: 'success'
      });
      
      // Refresh the patient list
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      setSnackbar({
        open: true,
        message: `Error updating patient: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Edit Patient
      </Typography>

      {!isSpreadsheetSelected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a Google Sheet in the "Select File" tab before editing patients.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => `${option.patientName} (ID: ${option.patientId})`}
              value={selectedPatient}
              onChange={handlePatientSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for Patient"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searching ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={searchPatients}
              disabled={loading || searching || !isSpreadsheetSelected}
              fullWidth
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient Basic Information */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Patient ID"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Patient Name (First, Last Name)"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Prescription Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prescription"
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dose"
                  name="dose"
                  value={formData.dose}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Visit Date"
                    value={formData.visitDate}
                    onChange={(newValue) => handleDateChange('visitDate', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Next Visit"
                    value={formData.nextVisit}
                    onChange={(newValue) => handleDateChange('nextVisit', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Physician Information */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Physician ID"
                  name="physicianId"
                  value={formData.physicianId}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Physician Name (First, Last Name)"
                  name="physicianName"
                  value={formData.physicianName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Physician Phone"
                  name="physicianPhone"
                  value={formData.physicianPhone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Bill"
                  name="bill"
                  type="number"
                  value={formData.bill}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || !isSpreadsheetSelected || !selectedPatient}
                  >
                    {loading ? 'Saving...' : 'Update Patient'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

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

export default EditPatient; 