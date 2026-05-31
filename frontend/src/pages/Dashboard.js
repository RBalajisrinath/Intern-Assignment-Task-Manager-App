import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', stage: 'Todo' });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', stage: '' });

  // Fetch tasks
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, user]);

  // Handle new task change
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  // Handle new task submit
  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(newTask);
      setNewTask({ title: '', description: '', stage: 'Todo' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit task change
  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit task submit
  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask(editTaskId, editTaskData);
      setEditTaskId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create task');
    }
    return response.json();
  };

  // Update task
  const updateTask = async (id, updates) => {
    const response = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }
    return response.json();
  };

  // Delete task
  const deleteTask = async (id) => {
    const response = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete task');
    }
  };

  if (loading) return <div className="dashboard">Loading...</div>;
  if (error) return <div className="dashboard">Error: {error}</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>Task Manager</h1>
        <button onClick={() => window.localStorage.removeItem('token') && window.location.reload()}>
          Logout
        </button>
      </header>
      
      {/* New Task Form */}
      <form onSubmit={handleNewTaskSubmit} className="task-form">
        <h2>Add New Task</h2>
        <div>
          <label htmlFor="newTaskTitle">Title:</label>
          <input
            type="text"
            id="newTaskTitle"
            name="title"
            value={newTask.title}
            onChange={handleNewTaskChange}
            required
          />
        </div>
        <div>
          <label htmlFor="newTaskDescription">Description:</label>
          <textarea
            id="newTaskDescription"
            name="description"
            value={newTask.description}
            onChange={handleNewTaskChange}
          />
        </div>
        <div>
          <label htmlFor="newTaskStage">Stage:</label>
          <select
            id="newTaskStage"
            name="stage"
            value={newTask.stage}
            onChange={handleNewTaskChange}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <button type="submit">Add Task</button>
      </form>

      {/* Task Board */}
      <div className="task-board">
        {/* Todo Column */}
        <div className="column">
          <h2>Todo</h2>
          {tasks
            .filter((task) => task.stage === 'Todo')
            .map((task) => (
              <div key={task.id} className="task-card">
                {editTaskId === task.id ? (
                  <form onSubmit={handleEditTaskSubmit} className="edit-form">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'title', value: e.target.value } })}
                    />
                    <textarea
                      value={editTaskData.description}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'description', value: e.target.value } })}
                    />
                    <select
                      value={editTaskData.stage}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'stage', value: e.target.value } })}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditTaskId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <div className="task-actions">
                      <button onClick={() => {
                        setEditTaskId(task.id);
                        setEditTaskData({ title: task.title, description: task.description, stage: task.stage });
                      }}>
                        Edit
                      </button>
                      <button onClick={() => {
                        deleteTask(task.id).catch(err => setError(err.message));
                      }}>
                        Delete
                      </button>
                      <select
                        value={task.stage}
                        onChange={(e) => {
                          updateTask(task.id, { stage: e.target.value }).catch(err => setError(err.message));
                        }}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>

        {/* In Progress Column */}
        <div className="column">
          <h2>In Progress</h2>
          {tasks
            .filter((task) => task.stage === 'In Progress')
            .map((task) => (
              <div key={task.id} className="task-card">
                {editTaskId === task.id ? (
                  <form onSubmit={handleEditTaskSubmit} className="edit-form">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'title', value: e.target.value } })}
                    />
                    <textarea
                      value={editTaskData.description}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'description', value: e.target.value } })}
                    />
                    <select
                      value={editTaskData.stage}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'stage', value: e.target.value } })}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditTaskId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <div className="task-actions">
                      <button onClick={() => {
                        setEditTaskId(task.id);
                        setEditTaskData({ title: task.title, description: task.description, stage: task.stage });
                      }}>
                        Edit
                      </button>
                      <button onClick={() => {
                        deleteTask(task.id).catch(err => setError(err.message));
                      }}>
                        Delete
                      </button>
                      <select
                        value={task.stage}
                        onChange={(e) => {
                          updateTask(task.id, { stage: e.target.value }).catch(err => setError(err.message));
                        }}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>

        {/* Done Column */}
        <div className="column">
          <h2>Done</h2>
          {tasks
            .filter((task) => task.stage === 'Done')
            .map((task) => (
              <div key={task.id} className="task-card">
                {editTaskId === task.id ? (
                  <form onSubmit={handleEditTaskSubmit} className="edit-form">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'title', value: e.target.value } })}
                    />
                    <textarea
                      value={editTaskData.description}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'description', value: e.target.value } })}
                    />
                    <select
                      value={editTaskData.stage}
                      onChange={(e) => handleEditTaskChange({ target: { name: 'stage', value: e.target.value } })}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditTaskId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <div className="task-actions">
                      <button onClick={() => {
                        setEditTaskId(task.id);
                        setEditTaskData({ title: task.title, description: task.description, stage: task.stage });
                      }}>
                        Edit
                      </button>
                      <button onClick={() => {
                        deleteTask(task.id).catch(err => setError(err.message));
                      }}>
                        Delete
                      </button>
                      <select
                        value={task.stage}
                        onChange={(e) => {
                          updateTask(task.id, { stage: e.target.value }).catch(err => setError(err.message));
                        }}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;