# Patient Management System

A React application for managing patient records using Google Sheets as a database.

## Features

- **Google Drive Integration**: Select Google Sheets directly from your Google Drive
- **Patient Management**: Add, edit, search, and delete patient records
- **Responsive Design**: Works on desktop and mobile devices
- **Material UI**: Modern user interface built with Material UI components

## Technologies Used

- React
- Material UI
- Google Drive API
- Google Sheets API

## Getting Started

### Prerequisites

- Node.js and npm installed
- Google API credentials (see Configuration section)

### Installation

1. Clone this repository
```bash
git clone https://github.com/your-username/patient-management-app.git
cd patient-management-app
```

2. Install dependencies
```bash
npm install
```

3. Configure Google API credentials (see Configuration section)

4. Start the development server
```bash
npm start
```

### Configuration

Before running the application, you need to set up Google API credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API and Google Sheets API
4. Create OAuth 2.0 credentials
5. Add the following scopes:
   - https://www.googleapis.com/auth/drive.file
   - https://www.googleapis.com/auth/spreadsheets
6. Update the `src/services/GoogleDriveService.js` file with your API key and Client ID

```javascript
const API_KEY = 'YOUR_API_KEY';
const CLIENT_ID = 'YOUR_CLIENT_ID';
```

## Usage

1. **Select Google Sheet**: Use the "Select File" tab to authenticate with Google and select a Google Sheet
2. **Add Patient**: Add new patient records through the "Add Patient" tab
3. **Edit Patient**: Edit existing patient records through the "Edit Patient" tab
4. **Search**: Search for patients by name, ID, phone, location, or address

## Deployment

### Netlify Deployment

To deploy to Netlify:

```bash
npm run build
npm run deploy:netlify
```

## Testing

Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
