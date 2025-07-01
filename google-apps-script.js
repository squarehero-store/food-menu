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
var SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

/**
 * Main function that handles GET requests
 */
function doGet(e) {
  // Test deployment endpoint
  if (e && e.parameter && e.parameter.test === 'deployment') {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Deployment successful! Script is working.',
        timestamp: new Date().toISOString(),
        version: '1.4'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check if SHEET_ID is configured
  if (SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Please update the SHEET_ID constant with your actual Google Sheet ID',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Try to access the spreadsheet
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getActiveSheet();
    var range = sheet.getDataRange();
    var values = range.getValues();
    
    if (values.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No data found in spreadsheet',
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Process the data - convert all values to strings to match CSV format
    var headers = values[0];
    var data = [];
    
    for (var i = 1; i < values.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        // Convert all values to strings to match CSV behavior
        var cellValue = values[i][j];
        if (cellValue === null || cellValue === undefined || cellValue === '') {
          row[headers[j]] = '';
        } else {
          // Force conversion to string - handle different data types
          if (typeof cellValue === 'number') {
            row[headers[j]] = cellValue.toString();
          } else if (typeof cellValue === 'string') {
            row[headers[j]] = cellValue;
          } else {
            row[headers[j]] = String(cellValue);
          }
        }
      }
      if (row.Title && row.Title.trim() !== '') {
        data.push(row);
      }
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
        source: 'google-apps-script',
        totalRows: data.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Error accessing spreadsheet: ' + error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * Run this function in the Apps Script editor to test
 */
function testScript() {
  try {
    var result = doGet({});
    Logger.log('Test successful');
    Logger.log('Data preview: ' + result.getContent());
  } catch (error) {
    Logger.log('Test failed: ' + error.toString());
  }
}

/**
 * Setup verification function - Run this to check everything is working
 */
function verifySetup() {
  Logger.log('=== SquareHero Menu Manager Setup Verification ===');
  
  // Check if SHEET_ID is set
  if (SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
    Logger.log('❌ SHEET_ID not set. Please update the SHEET_ID constant.');
    return false;
  }
  
  Logger.log('✅ SHEET_ID is set: ' + SHEET_ID);
  
  // Test spreadsheet access
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    Logger.log('✅ Spreadsheet access successful');
    Logger.log('📊 Spreadsheet name: ' + spreadsheet.getName());
    
    var sheet = spreadsheet.getActiveSheet();
    Logger.log('📄 Active sheet name: ' + sheet.getName());
    
    var range = sheet.getDataRange();
    var values = range.getValues();
    Logger.log('📈 Total rows (including header): ' + values.length);
    
    if (values.length > 0) {
      Logger.log('🗂️ Headers: ' + values[0].join(', '));
      
      // Count menu items
      var menuItems = 0;
      var headers = values[0];
      for (var i = 1; i < values.length; i++) {
        var row = {};
        for (var j = 0; j < headers.length; j++) {
          row[headers[j]] = values[i][j] || '';
        }
        if (row.Title && String(row.Title).trim() !== '') {
          menuItems++;
        }
      }
      Logger.log('🍽️ Valid menu items found: ' + menuItems);
    }
    
    Logger.log('✅ Setup verification complete - Everything looks good!');
    return true;
    
  } catch (error) {
    Logger.log('❌ Spreadsheet access failed: ' + error.toString());
    Logger.log('💡 Make sure the SHEET_ID is correct and you own the spreadsheet');
    return false;
  }
}
