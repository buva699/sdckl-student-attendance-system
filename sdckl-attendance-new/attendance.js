const API_BASE_URL = "http://localhost:3001/api";

document.addEventListener('DOMContentLoaded', () => {
  const startScanBtn = document.getElementById('startScanBtn');
  const scanStatus = document.getElementById('scanStatus');
  const scannedStudent = document.getElementById('scannedStudent');
  const attendanceTableBody = document.getElementById('attendanceTableBody');
  const logoutBtn = document.getElementById('logoutBtn');

  // Helper to get token from sessionStorage
  function getToken() {
    return sessionStorage.getItem('sdcklToken');
  }

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });

  // Fetch today's attendance summary and render table
  async function fetchAttendanceSummary() {
    try {
      const response = await fetch(API_BASE_URL + '/biometric/today-summary', {
        headers: {
          'Authorization': 'Bearer ' + getToken()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch attendance summary');
      }
      const data = await response.json();
      renderAttendanceTable(data.attendance);
    } catch (error) {
      scanStatus.textContent = error.message;
      scanStatus.classList.add('text-red-600');
    }
  }

  // Render attendance table rows
  function renderAttendanceTable(attendance) {
    attendanceTableBody.innerHTML = '';
    attendance.forEach(record => {
      const tr = document.createElement('tr');
      tr.classList.add('border-b', 'border-gray-200');
      tr.innerHTML = `
        <td class="border border-gray-300 px-4 py-2">${record.student_id}</td>
        <td class="border border-gray-300 px-4 py-2">${record.name}</td>
        <td class="border border-gray-300 px-4 py-2 font-semibold ${record.attendance_status === 'Present' ? 'text-green-600' : 'text-red-600'}">${record.attendance_status}</td>
        <td class="border border-gray-300 px-4 py-2">${record.last_scan_time ? new Date(record.last_scan_time).toLocaleString() : '-'}</td>
      `;
      attendanceTableBody.appendChild(tr);
    });
  }

  // Simulate biometric scan (for demo purposes)
  async function simulateBiometricScan() {
    scanStatus.textContent = 'Scanning... Please wait.';
    scanStatus.classList.remove('text-red-600');
    scanStatus.classList.remove('text-green-600');
    scannedStudent.textContent = '';

    // Simulate delay for scan
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate scan result (random student and status)
    const students = [
      { id: 'S001', name: 'Alice Johnson' },
      { id: 'S002', name: 'Bob Smith' },
      { id: 'S003', name: 'Charlie Brown' },
      { id: 'S004', name: 'Diana Prince' },
      { id: 'S005', name: 'Ethan Hunt' }
    ];
    const statuses = ['success', 'failure', 'error'];
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Call backend API to record scan
    try {
      const response = await fetch(API_BASE_URL + '/biometric/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({
          studentId: randomStudent.id,
          status: randomStatus
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record biometric scan');
      }
      scanStatus.textContent = `Scan ${randomStatus.toUpperCase()} for ${randomStudent.name} (${randomStudent.id})`;
      scanStatus.classList.add(randomStatus === 'success' ? 'text-green-600' : 'text-red-600');
      scannedStudent.textContent = `Student: ${randomStudent.name} (${randomStudent.id})`;
      // Refresh attendance summary
      fetchAttendanceSummary();
    } catch (error) {
      scanStatus.textContent = error.message;
      scanStatus.classList.add('text-red-600');
    }
  }

  startScanBtn.addEventListener('click', () => {
    simulateBiometricScan();
  });

  // Initial fetch of attendance summary
  fetchAttendanceSummary();
});
