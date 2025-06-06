/**
 * Biometric Device Connector Service with automatic reconnection
 * 
 * This Node.js script connects to a USB biometric device using node-hid,
 * listens for scan events, and sends scan data to the backend API.
 * It includes automatic reconnection logic if the device disconnects.
 */

const HID = require('node-hid');

const API_BASE_URL = 'http://localhost:3001/api';
const API_TOKEN = 'YOUR_API_TOKEN_HERE'; // Replace with a valid token or implement auth

// Replace with your biometric device's USB vendorId and productId
const VENDOR_ID = 0x0408;  // Actual vendor ID from your device
const PRODUCT_ID = 0x5090; // Actual product ID from your device

let device = null;
let reconnectTimeout = null;

async function sendScanData(studentId, status) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(`${API_BASE_URL}/biometric/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_TOKEN
      },
      body: JSON.stringify({ studentId, status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send scan data:', errorData.error || response.statusText);
    } else {
      console.log('Scan data sent successfully.');
    }
  } catch (err) {
    console.error('Error sending scan data:', err);
  }
}

function connectDevice() {
  try {
    device = new HID.HID(VENDOR_ID, PRODUCT_ID);
    console.log('Biometric device connected.');

    device.on('data', async (data) => {
      try {
        const studentId = parseStudentId(data);
        const status = parseScanStatus(data);

        console.log(`Scan detected: Student ID=${studentId}, Status=${status}`);

        await sendScanData(studentId, status);
      } catch (err) {
        console.error('Error processing scan data:', err);
      }
    });

    device.on('error', (err) => {
      console.error('Device error:', err);
      device.close();
      device = null;
      scheduleReconnect();
    });
  } catch (err) {
    console.error('Failed to connect to biometric device:', err);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  console.log('Attempting to reconnect in 5 seconds...');
  reconnectTimeout = setTimeout(() => {
    connectDevice();
  }, 5000);
}

// Example parsing functions - customize based on your device's data format
function parseStudentId(dataBuffer) {
  return dataBuffer.slice(0, 4).toString('utf8').trim();
}

function parseScanStatus(dataBuffer) {
  return dataBuffer[4] === 1 ? 'success' : 'failure';
}

// Start connection
connectDevice();

// Keep the process running
process.stdin.resume();
