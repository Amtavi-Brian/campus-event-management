
import api from './api';

// Get all event categories
export const getCategories = async () => {
    const response = await api.get('/categories/');
    return response.data;
};

// Get all events
export const getEvents = async (params = {}) => {
    const response = await api.get('/events/', { params });
    return response.data;
};

// Get a single event
export const getEvent = async (id) => {
    const response = await api.get(`/events/${id}/`);
    return response.data;
};

// Create an event
export const createEvent = async (eventData) => {
    const response = await api.post('/events/', eventData);
    return response.data;
};

// Update an event
export const updateEvent = async (id, eventData) => {
    const response = await api.patch(`/events/${id}/`, eventData);
    return response.data;
};

// Delete an event
export const deleteEvent = async (id) => {
    const response = await api.delete(`/events/${id}/`);
    return response.data;
};
