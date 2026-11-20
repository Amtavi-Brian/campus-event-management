
import api from './api';

// Register a new student
export const registerUser = async (userData) => {
    const response = await api.post('/accounts/register/', userData);
    return response.data;
};

// Login user
export const loginUser = async (credentials) => {
    const response = await api.post('/token/', credentials);
    return response.data;
};

// Refresh access token
export const refreshToken = async (refresh) => {
    const response = await api.post('/token/refresh/', {
        refresh,
    });
    return response.data;
};

// Logout user
export const logoutUser = async (refresh, access) => {
    const response = await api.post(
        '/accounts/logout/',
        { refresh },
        {
            headers: {
                Authorization: `Bearer ${access}`,
            },
        }
    );

    return response.data;
};

// Get logged-in user's profile
export const getUserProfile = async (access) => {
    const config = access
        ? { headers: { Authorization: `Bearer ${access}` } }
        : {};
    const response = await api.get('/accounts/profile/', config);
    return response.data;
};

// Update logged-in user's profile
export const updateUserProfile = async (profileData) => {
    const response = await api.patch('/accounts/profile/', profileData);
    return response.data;
};
