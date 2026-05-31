const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// In-memory storage for tasks (use a database in production)
let tasks = [];

// Get all tasks for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userTasks = tasks.filter(task => task.userId === req.user.userId);
    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new task
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, stage } = req.body;
    
    // Validate stage
    const validStages = ['Todo', 'In Progress', 'Done'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }
    
    const newTask = {
      id: Date.now().toString(),
      userId: req.user.userId,
      title,
      description: description || '',
      stage,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, stage } = req.body;
    
    // Validate stage if provided
    if (stage !== undefined) {
      const validStages = ['Todo', 'In Progress', 'Done'];
      if (!validStages.includes(stage)) {
        return res.status(400).json({ message: 'Invalid stage' });
      }
    }
    
    const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.user.userId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(stage !== undefined && { stage }),
      updatedAt: new Date().toISOString()
    };
    
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.user.userId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;