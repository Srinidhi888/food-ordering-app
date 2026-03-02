import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptor to include x-user-id header
api.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser && parsedUser.id) {
            config.headers['x-user-id'] = parsedUser.id;
        }
    }
    return config;
});

export default api;
