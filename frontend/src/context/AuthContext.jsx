
import { createContext, useState, useEffect } from 'react';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
} from '../services/authService';

// Context exports are intentionally colocated with the provider in this module.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore the user's session when the application loads
    useEffect(() => {
        const restoreSession = async () => {
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            try {
                const profile = await getUserProfile(accessToken);
                setUser(profile);
            } catch (error) {
                console.error('Session restoration failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login
    const login = async (credentials) => {
        const data = await loginUser(credentials);

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        setUser(data.user);

        return data;
    };

    // Register
    const register = async (userData) => {
        return await registerUser(userData);
    };

    // Logout
    const logout = async () => {
        const refresh = localStorage.getItem('refreshToken');
        const access = localStorage.getItem('accessToken');

        try {
            if (refresh && access) {
                await logoutUser(refresh, access);
            }
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    // Update profile
    const updateProfile = async (profileData) => {
        const updated = await updateUserProfile(profileData);
        setUser((prev) => ({ ...prev, ...updated }));
        return updated;
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
