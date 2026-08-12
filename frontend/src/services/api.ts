import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:3000/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

// Request interceptor: inject token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor: handle expired token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            // Don't redirect if already on login page or during login/register request
            const isAuthEndpoint = error.config?.url?.includes('/usuarios/login') || 
                                   error.config?.url?.includes('/usuarios/cadastrar');
            
            if (currentPath !== '/' && !isAuthEndpoint) {
                // Token expired or invalid — clean up and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('isAdmin');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
