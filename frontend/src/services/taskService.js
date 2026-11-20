
import api from './api';

// Get all tasks
export const getTasks = async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
};

// Get a single task
export const getTask = async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
};

// Create a task
export const createTask = async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
};

// Update a task
export const updateTask = async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
};

// Delete a task
export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
};
