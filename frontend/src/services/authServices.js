import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        return response.data;
    } catch (error) {
        console.error('Error in login request:', error.response ? error.response.data : error.message);
        throw error; // Rethrow the error to handle it in the component
    }
};

export const fetchUserInfo = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/user-info`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error in fetchUserInfo request:', error.response ? error.response.data : error.message);
        throw error; // Rethrow the error to handle it in the component
    }
};

export const changePassword = async (userId, newPassword) => {
    try {
        // Send the new password as part of a JSON object
        const response = await axios.put(`${API_URL}/${userId}/change-password`, {
            password: newPassword, // Ensure this is the correct field name the backend expects
        });
        return response.data; // Return the response from the backend
    } catch (error) {
        // Log the error for debugging
        console.error('Error in changePassword request:', error.response ? error.response.data : error.message);
        throw error; // Rethrow the error to handle it in the component
    }
};



