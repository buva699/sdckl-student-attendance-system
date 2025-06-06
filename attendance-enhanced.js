const API_BASE_URL = "http://localhost:3001/api";

document.addEventListener('DOMContentLoaded', () => {
  const startScanBtn = document.getElementById('startScanBtn');
  const pauseScanBtn = document.getElementById('pauseScanBtn');
  const cancelScanBtn = document.getElementById('cancelScanBtn');
  const scanStatus = document.getElementById('scanStatus');
  const scannedStudent = document.getElementById('scannedStudent');
  const enrollBtn = document.getElementById('enrollBtn');
  const enrollStudentId = document.getElementById('enrollStudentId');
  const biometricDataInput = document.getElementById('biometricData');
  const enrollStatus = document.getElementById('enrollStatus');
  const attendanceTableBody = document.getElementById('attendanceTableBody');
  const searchInput = document.getElementById('searchInput');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pageInfo = document.getElementById('pageInfo');

  let scanInterval = null;
  let currentPage = 1;
  const limit = 10;
  let totalLogs = 0;
  let attendanceData = [];
  let currentSort = { key: 'name', direction: 'asc' };

  // Removed token and login/logout logic

  // Biometric scan simulation with start, pause, cancel
  function simulateBiometricScan() {
    scanStatus.textContent = 'Scanning... Please wait.';
    scanStatus.classList.remove('text-red-600', 'text-green-600');
    scannedStudent.textContent = '';
  }

  function startScan() {
    startScanBtn.disabled = true;
    pauseScanBtn.classList.remove('hidden');
    cancelScanBtn.classList.remove('hidden');
    scanStatus.textContent = 'Scanning started...';
    scanInterval = setInterval(() => {
      performScan();
    }, 5000);
  }

  function pauseScan() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
      scanStatus.textContent = 'Scanning paused.';
      startScanBtn.disabled = false;
      pauseScanBtn.classList.add('hidden');
    }
  }

  function cancelScan() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    scanStatus.textContent = 'Scanning cancelled.';
    scannedStudent.textContent = '';
    startScanBtn.disabled = false;
    pauseScanBtn.classList.add('hidden');
    cancelScanBtn.classList.add('hidden');
  }

  async function performScan() {
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

    try {
      const response = await fetch(API_BASE_URL + '/biometric/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      fetchAttendanceSummary(currentPage);
    } catch (error) {
      scanStatus.textContent = error.message;
      scanStatus.classList.add('text-red-600');
    }
  }

  startScanBtn.addEventListener('click', () => {
    startScan();
  });

  pauseScanBtn.addEventListener('click', () => {
    pauseScan();
  });

  cancelScanBtn.addEventListener('click', () => {
    cancelScan();
  });

  // Enrollment of biometric data
  enrollBtn.addEventListener('click', async () => {
    const studentId = enrollStudentId.value.trim();
    const biometricData = biometricDataInput.value.trim();
    enrollStatus.textContent = '';
    enrollStatus.classList.remove('text-red-600', 'text-green-600');

    if (!studentId || !biometricData) {
      enrollStatus.textContent = 'Student ID and Biometric Data are required.';
      enrollStatus.classList.add('text-red-600');
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/biometric/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, biometricData })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll biometric data');
      }
      enrollStatus.textContent = 'Biometric data enrolled successfully.';
      enrollStatus.classList.add('text-green-600');
      enrollStudentId.value = '';
      biometricDataInput.value = '';
    } catch (error) {
      enrollStatus.textContent = error.message;
      enrollStatus.classList.add('text-red-600');
    }
  });

  // Fetch attendance summary with pagination
  async function fetchAttendanceSummary(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/biometric/today-summary?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance summary');
      }
      const data = await response.json();
      attendanceData = data.attendance;
      totalLogs = data.totalLogs || attendanceData.length;
      currentPage = page;
      renderAttendanceTable(attendanceData);
      updatePagination();
    } catch (error) {
      scanStatus.textContent = error.message;
      scanStatus.classList.add('text-red-600');
    }
  }

  // Render attendance table rows with sorting and filtering
  function renderAttendanceTable(data) {
    const filterText = searchInput.value.toLowerCase();
    let filteredData = data.filter(record =>
      record.name.toLowerCase().includes(filterText) ||
      record.student_id.toLowerCase().includes(filterText)
    );

    // Sort
    filteredData.sort((a, b) => {
      let valA = a[currentSort.key];
      let valB = b[currentSort.key];
      if (currentSort.key === 'last_scan_time') {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }
      if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    attendanceTableBody.innerHTML = '';
    filteredData.forEach(record => {
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

  // Pagination controls
  function updatePagination() {
    const totalPages = Math.ceil(totalLogs / limit);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      fetchAttendanceSummary(currentPage - 1);
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(totalLogs / limit);
    if (currentPage < totalPages) {
      fetchAttendanceSummary(currentPage + 1);
    }
  });

  // Sorting on table headers
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (currentSort.key === key) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.key = key;
        currentSort.direction = 'asc';
      }
      renderAttendanceTable(attendanceData);
    });
  });

  // Search input event
  searchInput.addEventListener('input', () => {
    renderAttendanceTable(attendanceData);
  });

  // Initial fetch
  fetchAttendanceSummary();
});
