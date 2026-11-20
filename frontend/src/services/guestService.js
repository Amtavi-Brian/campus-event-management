
import api from './api';

// Get all guests
export const getGuests = async (params = {}) => {
    const response = await api.get('/guests/', { params });
    return response.data;
};

// Get a single guest
export const getGuest = async (id) => {
    const response = await api.get(`/guests/${id}/`);
    return response.data;
};

// Add a guest
export const createGuest = async (guestData) => {
    const response = await api.post('/guests/', guestData);
    return response.data;
};

// Update guest information or RSVP status
export const updateGuest = async (id, guestData) => {
    const response = await api.patch(`/guests/${id}/`, guestData);
    return response.data;
};

// Delete a guest
export const deleteGuest = async (id) => {
    const response = await api.delete(`/guests/${id}/`);
    return response.data;
};
