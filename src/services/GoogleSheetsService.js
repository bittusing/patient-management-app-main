import { gapi } from 'gapi-script';
import { getSelectedSpreadsheetId } from './GoogleDriveService';

// Define the column structure for our patient data
const COLUMNS = {
  PATIENT_ID: 0,
  PATIENT_NAME: 1,
  LOCATION: 2,
  AGE: 3,
  GENDER: 4,
  PHONE: 5,
  ADDRESS: 6,
  PRESCRIPTION: 7,
  DOSE: 8,
  VISIT_DATE: 9,
  NEXT_VISIT: 10,
  PHYSICIAN_ID: 11,
  PHYSICIAN_NAME: 12,
  PHYSICIAN_PHONE: 13,
  BILL: 14,
};

// Generate a unique ID for new patients
export const generatePatientId = () => {
  return 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
};

// Read all patients from the Google Sheet
export const getAllPatients = async () => {
  try {
    const spreadsheetId = getSelectedSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('No spreadsheet selected');
    }

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1', // Assuming the data is in Sheet1
    });

    const rows = response.result.values || [];
    
    // Skip header row if it exists
    const dataRows = rows.length > 0 ? rows.slice(1) : [];
    
    // Map the rows to patient objects
    return dataRows.map(row => ({
      patientId: row[COLUMNS.PATIENT_ID] || '',
      patientName: row[COLUMNS.PATIENT_NAME] || '',
      location: row[COLUMNS.LOCATION] || '',
      age: row[COLUMNS.AGE] || '',
      gender: row[COLUMNS.GENDER] || '',
      phone: row[COLUMNS.PHONE] || '',
      address: row[COLUMNS.ADDRESS] || '',
      prescription: row[COLUMNS.PRESCRIPTION] || '',
      dose: row[COLUMNS.DOSE] || '',
      visitDate: row[COLUMNS.VISIT_DATE] || '',
      nextVisit: row[COLUMNS.NEXT_VISIT] || '',
      physicianId: row[COLUMNS.PHYSICIAN_ID] || '',
      physicianName: row[COLUMNS.PHYSICIAN_NAME] || '',
      physicianPhone: row[COLUMNS.PHYSICIAN_PHONE] || '',
      bill: row[COLUMNS.BILL] || '',
    }));
  } catch (error) {
    console.error('Error getting patients', error);
    throw error;
  }
};

// Search for patients with given criteria
export const searchPatients = async (searchTerm) => {
  try {
    const patients = await getAllPatients();
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    
    return patients.filter(patient => 
      patient.patientName.toLowerCase().includes(lowercaseSearchTerm) ||
      patient.patientId.toLowerCase().includes(lowercaseSearchTerm) ||
      patient.phone.toLowerCase().includes(lowercaseSearchTerm) ||
      patient.location.toLowerCase().includes(lowercaseSearchTerm) ||
      patient.address.toLowerCase().includes(lowercaseSearchTerm)
    );
  } catch (error) {
    console.error('Error searching patients', error);
    throw error;
  }
};

// Add a new patient
export const addPatient = async (patientData) => {
  try {
    const spreadsheetId = getSelectedSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('No spreadsheet selected');
    }

    // Generate a patient ID if not provided
    if (!patientData.patientId) {
      patientData.patientId = generatePatientId();
    }

    // Prepare the row data
    const rowData = [
      patientData.patientId,
      patientData.patientName,
      patientData.location,
      patientData.age,
      patientData.gender,
      patientData.phone,
      patientData.address,
      patientData.prescription,
      patientData.dose,
      patientData.visitDate,
      patientData.nextVisit,
      patientData.physicianId,
      patientData.physicianName,
      patientData.physicianPhone,
      patientData.bill,
    ];

    // First, get the current number of rows
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    const rows = response.result.values || [];
    const newRowIndex = rows.length + 1; // +1 to account for header row and 1-based indexing

    // Append the new row
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${newRowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });

    return patientData;
  } catch (error) {
    console.error('Error adding patient', error);
    throw error;
  }
};

// Update an existing patient
export const updatePatient = async (patientData) => {
  try {
    const spreadsheetId = getSelectedSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('No spreadsheet selected');
    }

    // Find the row index of the patient
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    const rows = response.result.values || [];
    
    // Skip header row if it exists
    const dataRows = rows.length > 0 ? rows.slice(1) : [];
    
    const rowIndex = dataRows.findIndex(row => row[COLUMNS.PATIENT_ID] === patientData.patientId);
    
    if (rowIndex === -1) {
      throw new Error('Patient not found');
    }

    // Account for header row and 1-based indexing
    const actualRowIndex = rowIndex + 2;

    // Prepare the row data
    const rowData = [
      patientData.patientId,
      patientData.patientName,
      patientData.location,
      patientData.age,
      patientData.gender,
      patientData.phone,
      patientData.address,
      patientData.prescription,
      patientData.dose,
      patientData.visitDate,
      patientData.nextVisit,
      patientData.physicianId,
      patientData.physicianName,
      patientData.physicianPhone,
      patientData.bill,
    ];

    // Update the row
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });

    return patientData;
  } catch (error) {
    console.error('Error updating patient', error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (patientId) => {
  try {
    const spreadsheetId = getSelectedSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('No spreadsheet selected');
    }

    // Find the row index of the patient
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    const rows = response.result.values || [];
    
    // Skip header row if it exists
    const dataRows = rows.length > 0 ? rows.slice(1) : [];
    
    const rowIndex = dataRows.findIndex(row => row[COLUMNS.PATIENT_ID] === patientId);
    
    if (rowIndex === -1) {
      throw new Error('Patient not found');
    }

    // Account for header row and 1-based indexing
    const actualRowIndex = rowIndex + 2;

    // Delete the row by overwriting it with empty values
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${actualRowIndex}:O${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [Array(15).fill('')], // 15 empty columns
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting patient', error);
    throw error;
  }
};

export default {
  generatePatientId,
  getAllPatients,
  searchPatients,
  addPatient,
  updatePatient,
  deletePatient,
}; 