const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const storageFilePath = path.join(__dirname, 'storage.json');

// Helper function to read data from storage atomically
function readStorage() {
  try {
    const data = fs.readFileSync(storageFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading storage file:', err);
    return { students: [], biometricLogs: [] };
  }
}

// Helper function to write data to storage atomically
function writeStorage(data) {
  try {
    fs.writeFileSync(storageFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing storage file:', err);
  }
}

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  next();
});

// Endpoint to get all students (for frontend sync)
app.get('/students', (req, res) => {
  const data = readStorage();
  res.json(data.students);
});

// Endpoint to add a new student
app.post('/students', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  const data = readStorage();
  const duplicate = data.students.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ error: 'Student with this name already exists' });
  }
  const newId = data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) + 1 : 1;
  const newStudent = { id: newId, name: name.trim(), attendanceStatus: 'Absent', remarks: '' };
  data.students.push(newStudent);
  writeStorage(data);
  res.status(201).json(newStudent);
});

// Endpoint to update student details
app.put('/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  const data = readStorage();
  const student = data.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const duplicate = data.students.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== studentId);
  if (duplicate) {
    return res.status(409).json({ error: 'Student with this name already exists' });
  }
  student.name = name.trim();
  writeStorage(data);
  res.json(student);
});

// Endpoint to delete a student
app.delete('/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const data = readStorage();
  const index = data.students.findIndex(s => s.id === studentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const deletedStudent = data.students.splice(index, 1)[0];
  writeStorage(data);
  res.json(deletedStudent);
});

// Endpoint to update attendance by student ID
app.post('/attendance', (req, res) => {
  const { studentId, attendanceStatus, remarks } = req.body;
  if (!studentId || !attendanceStatus) {
    return res.status(400).json({ error: 'studentId and attendanceStatus are required' });
  }
  const data = readStorage();
  const student = data.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  student.attendanceStatus = attendanceStatus;
  student.remarks = remarks || student.remarks;
  writeStorage(data);
  res.json({ message: 'Attendance updated', student });
});

// Endpoint to get biometric scan logs with pagination and filtering
app.get('/biometric/logs', (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, status, dateFrom, dateTo } = req.query;
    const data = readStorage();
    let logs = data.biometricLogs || [];

    // Filtering
    if (studentId) {
      const sid = parseInt(studentId);
      if (!isNaN(sid)) {
        logs = logs.filter(log => log.studentId === sid);
      }
    }
    if (status) {
      logs = logs.filter(log => log.status.toLowerCase() === status.toLowerCase());
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate)) {
        logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
      }
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!isNaN(toDate)) {
        logs = logs.filter(log => new Date(log.timestamp) <= toDate);
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      page: pageNum,
      limit: limitNum,
      totalLogs: logs.length,
      logs: paginatedLogs
    });
  } catch (err) {
    console.error('Error reading biometric logs:', err);
    res.status(500).json({ error: 'Failed to read biometric logs' });
  }
});

// Endpoint to record a biometric scan event
app.post('/biometric/scan', (req, res) => {
  const { studentId, status } = req.body;
  if (!studentId || !status) {
    return res.status(400).json({ error: 'studentId and status are required' });
  }
  try {
    const data = readStorage();
    const students = data.students || [];
    const logs = data.biometricLogs || [];

    const student = students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update attendance status based on biometric scan status
    if (status === 'success') {
      student.attendanceStatus = 'Present';
    }

    // Add new biometric log entry
    const newLog = {
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      studentId,
      timestamp: new Date().toISOString(),
      status
    };
    logs.push(newLog);

    // Write updated data back to storage
    data.biometricLogs = logs;
    writeStorage(data);

    res.status(201).json({ message: 'Biometric scan recorded', log: newLog, student });
  } catch (err) {
    console.error('Error recording biometric scan:', err);
    res.status(500).json({ error: 'Failed to record biometric scan' });
  }
});

// Start server
app.listen(port, () => {
  console.log('SDCKL Attendance backend API listening at http://localhost:' + port);
});
