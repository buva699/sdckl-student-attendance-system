const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../auth');

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, remarks FROM students ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Add a new student
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { name, remarks, classIds } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM students WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Student with this name already exists' });
    }
    const [result] = await pool.query('INSERT INTO students (name, remarks) VALUES (?, ?)', [name.trim(), remarks || null]);
    const newStudentId = result.insertId;

    // Insert into student_classes join table
    if (Array.isArray(classIds) && classIds.length > 0) {
      const values = classIds.map(classId => [newStudentId, classId]);
      await pool.query('INSERT INTO student_classes (student_id, class_id) VALUES ?', [values]);
    }

    const newStudent = { id: newStudentId, name: name.trim(), remarks: remarks || null };
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Update student details
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name, remarks, classIds } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM students WHERE name = ? AND id != ?', [name.trim(), studentId]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Student with this name already exists' });
    }
    const [result] = await pool.query('UPDATE students SET name = ?, remarks = ? WHERE id = ?', [name.trim(), remarks || null, studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update student_classes join table
    if (Array.isArray(classIds)) {
      await pool.query('DELETE FROM student_classes WHERE student_id = ?', [studentId]);
      if (classIds.length > 0) {
        const values = classIds.map(classId => [studentId, classId]);
        await pool.query('INSERT INTO student_classes (student_id, class_id) VALUES ?', [values]);
      }
    }

    res.json({ id: studentId, name: name.trim(), remarks: remarks || null });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete a student
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const studentId = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

router.get('/:id/classes', authenticateToken, async (req, res) => {
  const studentId = parseInt(req.params.id);
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.description
       FROM classes c
       JOIN student_classes sc ON c.id = sc.class_id
       WHERE sc.student_id = ?`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching student classes:', err);
    res.status(500).json({ error: 'Failed to fetch student classes' });
  }
});

module.exports = router;
