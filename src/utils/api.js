const BASE_URL = 'http://127.0.0.1:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
    let accessToken = sessionStorage.getItem('accessToken');
    
    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // If unauthorized, try to refresh
    if (response.status === 401 || response.status === 403) {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const refreshToken = user.refreshToken; // This depends on where you store it. 
        // In a real app, refresh token should be in an HTTP-only cookie, 
        // but if we must handle it manually:
        
        if (refreshToken) {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                sessionStorage.setItem('accessToken', data.accessToken);
                
                // Retry the original request
                headers['Authorization'] = `Bearer ${data.accessToken}`;
                response = await fetch(`${BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
            } else {
                // Logout if refresh fails
                sessionStorage.clear();
                window.location.href = '/login';
            }
        }
    }

    return response;
};
