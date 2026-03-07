
import { api } from "../../api/axios";

export const createUser = async (data) => {
    return await api.post('/admin/create-user', data);
}

export const updateUser = async (id, data) => {
    return await api.put(`/admin/update-user/${id}`, data);
}

export const getUser = async (id) => {
    return await api.get(`/admin/user/${id}`);
}

export const getActiveUsers = async () => {
    return await api.get('/admin/active-users');
}

export const getInactiveUsers = async () => {
    return await api.get('/admin/inactive-users');
}

export const inactivateUser = async (id) => {
    return await api.patch(`/admin/inactive-user/${id}`);
}

export const activateUser = async (id) => {
    return await api.patch(`/admin/active-user/${id}`);
}

export const deleteUser = async (id) => {
    return await api.delete(`/admin/delete-user/${id}`);
}

// ========== COMMANDES ENDPOINTS ==========

export const getAllCommandes = async () => {
    return await api.get('/admin/commandes');
}

export const getCommandeById = async (id) => {
    return await api.get(`/admin/commandes/${id}`);
}

// ========== CLIENTS ENDPOINTS ==========

export const getAllClients = async () => {
    return await api.get('/admin/clients');
}

export const getClientCommandes = async (clientId) => {
    return await api.get(`/admin/client/${clientId}`);
}