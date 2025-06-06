const API_BASE_URL = "/api";

document.addEventListener('DOMContentLoaded', () => {
  const totalStudentsElem = document.getElementById('totalStudents');
  const totalClassesElem = document.getElementById('totalClasses');
  const attendanceTodayElem = document.getElementById('attendanceToday');
  const logoutBtn = document.getElementById('logoutBtn');

  function getToken() {
    return sessionStorage.getItem('sdcklToken');
  }

  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });

  async function fetchTotalStudents() {
    try {
      const response = await fetch(API_BASE_URL + '/students', {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const students = await response.json();
      totalStudentsElem.textContent = students.length;
    } catch (error) {
      totalStudentsElem.textContent = 'Error';
      console.error(error);
    }
  }

  async function fetchTotalClasses() {
    try {
      const response = await fetch(API_BASE_URL + '/classes', {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      const classes = await response.json();
      totalClassesElem.textContent = classes.length;
    } catch (error) {
      totalClassesElem.textContent = 'Error';
      console.error(error);
    }
  }

  async function fetchAttendanceToday() {
    try {
      const response = await fetch(API_BASE_URL + '/biometric/today-summary', {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (!response.ok) throw new Error('Failed to fetch attendance summary');
      const data = await response.json();
      attendanceTodayElem.textContent = data.attendance.length;
    } catch (error) {
      attendanceTodayElem.textContent = 'Error';
      console.error(error);
    }
  }

  // Initial fetch
  fetchTotalStudents();
  fetchTotalClasses();
  fetchAttendanceToday();
});
