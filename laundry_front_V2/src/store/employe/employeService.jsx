import { api } from '../../api/axios'

// ========== COMMANDE ENDPOINTS ==========

// Get all commandes
export const getAllCommandes = async () => {
    return await api.get('/employe/commandes')
}

// Get commande by id (with tapis details)
export const getCommandeById = async (id) => {
    return await api.get(`/employe/commandes/${id}`)
}

// Update commande status
export const patchCommandeStatus = async (id, data) => {
    return await api.patch(`/employe/commandes/${id}/status`, data)
}

// Update tapis état
export const patchTapisEtat = async (tapisId, data) => {
    return await api.patch(`/employe/commandes/tapis/${tapisId}/etat`, data)
}
