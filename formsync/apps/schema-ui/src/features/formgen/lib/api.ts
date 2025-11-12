import axios from 'axios';

// formgen-api runs on 3001
const api = axios.create({
    baseURL: 'http://localhost:3001',
});

export const schemaApi = {
    list: () => api.get<any[]>('/schemas').then(r => r.data),
    get: (id: string) => api.get(`/schemas/${id}`).then(r => r.data),
};

export const formApi = {
    createFromSchema: (schemaId: string) => api.post('/form-model/from-schema', { schemaId }).then(r => r.data),
    convertRaw: (schema: any) => api.post('/form-model/from-schema', { schema }).then(r => r.data),
    exportReact: (formModel: any) => api.post('/export/react-vite', formModel, { responseType: 'blob' }).then(r => r.data),
};
