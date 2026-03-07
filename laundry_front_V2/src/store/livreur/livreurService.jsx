
import { api } from "../../api/axios"

// Get my pending client
export const getMyPendingClient = async () => {
  return await api.get('/livreur/my-client/pending')
}

// Search client by phone
export const searchClientByPhone = async (phone) => {
  return await api.get(`/livreur/clients/search?phone=${phone}`)
}

// Create new client
export const addClient = async (data) => {
  return await api.post('/livreur/clients', data)
}

// Delete pending client
export const deletePendingClient = async (clientId) => {
  return await api.delete(`/livreur/clients/${clientId}`)
}

// ========== COMMANDE ENDPOINTS ==========

// Create commande
export const createCommande = async (data) => {
  return await api.post('/livreur/commandes', data)
}

// Get ready for delivery
export const getReadyForDelivery = async () => {
  return await api.get('/livreur/commandes/ready-for-delivery')
}

// Record payment
export const recordPayment = async (commandeId, data) => {
  return await api.post(`/livreur/commandes/${commandeId}/payment`, data)
}

// Upload tapis image
export const uploadTapisImage = async (tapisId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post(`/tapis/${tapisId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Upload tapis images (plural)
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  return await api.post('/livreur/tapis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}