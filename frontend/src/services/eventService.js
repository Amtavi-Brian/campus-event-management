
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

export const toEventPayload = ({
    title,
    description,
    category,
    date,
    time,
    location,
    maxGuests,
}) => ({
    title,
    description,
    category: Number(category),
    event_date: date,
    event_time: time,
    location,
    maximum_guests: maxGuests === '' ? null : Number(maxGuests),
});

export const toEventFormValues = (event) => ({
    title: event.title,
    description: event.description,
    category: String(event.category),
    date: event.event_date,
    time: event.event_time?.slice(0, 5) || '',
    location: event.location,
    maxGuests: event.maximum_guests ?? '',
});

export const getEventErrorMessage = (error) => {
    const data = error.response?.data;

    if (typeof data?.detail === 'string') {
        return data.detail;
    }

    if (data && typeof data === 'object') {
        const messages = Object.values(data)
            .flatMap((value) => Array.isArray(value) ? value : [value])
            .filter((value) => typeof value === 'string');

        if (messages.length) {
            return messages.join(' ');
        }
    }

    if (error.request && !error.response) {
        return 'Could not connect to the server. Check that Django is running and try again.';
    }

    return 'Unable to save the event. Please try again.';
};
