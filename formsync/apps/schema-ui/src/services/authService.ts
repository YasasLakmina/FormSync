const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3002';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
}

export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${USER_API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Request failed');
    }

    return res.json();
}

export const authService = {
    async register(email: string, password: string, name?: string): Promise<AuthUser> {
        return request<AuthUser>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    },

    async login(email: string, password: string): Promise<LoginResponse> {
        return request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async getMe(token: string): Promise<AuthUser> {
        return request<AuthUser>('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    async getMyTemplates(token: string) {
        return request<any[]>('/template', {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    async saveTemplate(token: string, name: string, content: any, description?: string) {
        return request<any>('/template', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, content, description }),
        });
    },

    async deleteTemplate(token: string, id: string) {
        return request<any>(`/template/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
