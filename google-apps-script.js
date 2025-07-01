/**
 * SquareHero Food & Drink Menu Manager - Google Apps Script
 * 
 * This script serves menu data from a Google Sheet as JSON instead of CSV
 * to solve SEO indexing issues with Googlebot being blocked from googleusercontent.com
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update the SHEET_ID constant with your Google Sheet ID
 * 5. Deploy as a web app with "Execute as: Me" and "Access: Anyone"
 * 6. Copy the web app URL and use it in your meta tag instead of the CSV URL
 * 
 * The web app URL will look like:
 * https://script.google.com/macros/s/{SCRIPT_ID}/exec
 */

// Replace this with your Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

/**
 * Main function that handles GET requests
 */
function doGet(e) {
  try {
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      return createErrorResponse('No data found in spreadsheet');
    }
    
    // Convert to array of objects (similar to Papa Parse output)
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[i][j] || '';
      }
      // Only add rows that have a title (similar to filtering in original code)
      if (row.Title && row.Title.trim() !== '') {
        data.push(row);
      }
    }
    
    // Return JSON response with CORS headers
    const response = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script'
    };
    
    return createJsonResponse(response);
    
  } catch (error) {
    console.error('Error processing request:', error);
    return createErrorResponse('Error processing menu data: ' + error.message);
  }
}

/**
 * Create a successful JSON response with proper headers
 */
function createJsonResponse(data) {
  const response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers to allow cross-origin requests
  response.addHeader('Access-Control-Allow-Origin', '*');
  response.addHeader('Access-Control-Allow-Methods', 'GET');
  response.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}

/**
 * Create an error response
 */
function createErrorResponse(message) {
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  return createJsonResponse(errorResponse);
}

/**
 * Test function to verify the script works
 * Run this function in the Apps Script editor to test
 */
function testScript() {
  try {
    const result = doGet();
    console.log('Test successful');
    console.log('Data preview:', JSON.parse(result.getContent()));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

/**
 * Function to help users get their Sheet ID
 * The Sheet ID is the long string in your Google Sheets URL between /d/ and /edit
 * Example: https://docs.google.com/spreadsheets/d/1ABC123def456GHI789jkl/edit#gid=0
 * Sheet ID would be: 1ABC123def456GHI789jkl
 */
function getSheetIdHelp() {
  console.log('To find your Sheet ID:');
  console.log('1. Open your Google Sheet');
  console.log('2. Look at the URL in your browser');
  console.log('3. Copy the long string between /d/ and /edit');
  console.log('4. Update the SHEET_ID constant at the top of this script');
}
