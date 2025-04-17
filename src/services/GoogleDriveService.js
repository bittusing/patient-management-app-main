// import { gapi } from 'gapi-script';

// // Google API configuration
// const API_KEY = 'AIzaSyAhAtqlwzNuvW9z8_uWcC3Y11cWPigFLQw'; // You'll need to provide this
// const CLIENT_ID = '1052156787785-fgoocgeje9r1lhqpicflqaiajja1vnod.apps.googleusercontent.com'; // You'll need to provide this
// const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest', 'https://sheets.googleapis.com/$discovery/rest?version=v4'];
// // const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets.readonly';
// // Initialize the Google API client
// export const initGoogleAPI = async () => {
//   return new Promise((resolve, reject) => {
//     gapi.load('client:auth2', async () => {
//       try {
//         await gapi.client.init({
//           apiKey: API_KEY,
//           clientId: CLIENT_ID,
//           discoveryDocs: DISCOVERY_DOCS,
//           scope: SCOPES,
//         });
        
//         // Check if user is signed in
//         if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
//           console.log('User not signed in');
//         }
        
//         resolve(true);
//       } catch (error) {
//         console.error('Error initializing Google API client', error);
//         reject(error);
//       }
//     });
//   });
// };

// // Sign in the user
// export const signIn = async () => {
//   try {
//     const googleAuth = gapi.auth2.getAuthInstance();
//     const user = await googleAuth.signIn();
//     return user;
//   } catch (error) {
//     console.error('Error signing in', error);
//     throw error;
//   }
// };

// // Sign out the user
// export const signOut = async () => {
//   try {
//     const googleAuth = gapi.auth2.getAuthInstance();
//     await googleAuth.signOut();
//   } catch (error) {
//     console.error('Error signing out', error);
//     throw error;
//   }
// };

// // List Google Sheets files
// export const listSheets = async () => {
//   try {
//     const response = await gapi.client.drive.files.list({
//       q: "mimeType='application/vnd.google-apps.spreadsheet'",
//       fields: 'files(id, name, webViewLink)',
//     });
    
//     return response.result.files;
//   } catch (error) {
//     console.error('Error listing sheets', error);
//     throw error;
//   }
// };

// // Select a spreadsheet and get its ID
// export const selectSpreadsheet = (spreadsheetId) => {
//   // Store the selected spreadsheet ID in localStorage
//   localStorage.setItem('selectedSpreadsheetId', spreadsheetId);
//   return spreadsheetId;
// };

// // Get the currently selected spreadsheet ID
// export const getSelectedSpreadsheetId = () => {
//   return localStorage.getItem('selectedSpreadsheetId');
// };

// // Check if user is signed in
// export const isSignedIn = () => {
//   if (!gapi.auth2) return false;
//   return gapi.auth2.getAuthInstance().isSignedIn.get();
// };

// export default {
//   initGoogleAPI,
//   signIn,
//   signOut,
//   listSheets,
//   selectSpreadsheet,
//   getSelectedSpreadsheetId,
//   isSignedIn,
// }; 



import { gapi } from 'gapi-script';

// ✅ Google API Configuration
const API_KEY = 'AIzaSyAhAtqlwzNuvW9z8_uWcC3Y11cWPigFLQw';
const CLIENT_ID = '1052156787785-fgoocgeje9r1lhqpicflqaiajja1vnod.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
];

// ✅ Use Broader Read-Only Scopes to Access All Sheets
const SCOPES =
  'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly';

// ✅ Initialize Google API
export const initGoogleAPI = async () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
          console.log('User not signed in');
        } else {
          console.log('User signed in as:', authInstance.currentUser.get().getBasicProfile().getEmail());
        }

        resolve(true);
      } catch (error) {
        console.error('Error initializing Google API client', error);
        reject(error);
      }
    });
  });
};

// ✅ Sign In the User
export const signIn = async () => {
  try {
    const googleAuth = gapi.auth2.getAuthInstance();
    const user = await googleAuth.signIn();
    console.log('Signed in as:', user.getBasicProfile().getEmail());
    return user;
  } catch (error) {
    console.error('Error signing in', error);
    throw error;
  }
};

// ✅ Sign Out the User
export const signOut = async () => {
  try {
    const googleAuth = gapi.auth2.getAuthInstance();
    await googleAuth.signOut();
    await googleAuth.disconnect(); // clears cache and tokens
    console.log('Signed out');
  } catch (error) {
    console.error('Error signing out', error);
    throw error;
  }
};

// ✅ List All Google Sheets in Drive
export const listSheets = async () => {
  try {
    const response = await gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, webViewLink)',
    });

    console.log('Sheets found:', response.result.files);
    return response.result.files;
  } catch (error) {
    console.error('Error listing sheets', error);
    throw error;
  }
};

// ✅ Store the Selected Spreadsheet ID
export const selectSpreadsheet = (spreadsheetId) => {
  localStorage.setItem('selectedSpreadsheetId', spreadsheetId);
  return spreadsheetId;
};

// ✅ Get Currently Selected Spreadsheet ID
export const getSelectedSpreadsheetId = () => {
  return localStorage.getItem('selectedSpreadsheetId');
};

// ✅ Check If User Is Signed In
export const isSignedIn = () => {
  if (!gapi.auth2) return false;
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};

export default {
  initGoogleAPI,
  signIn,
  signOut,
  listSheets,
  selectSpreadsheet,
  getSelectedSpreadsheetId,
  isSignedIn,
};
