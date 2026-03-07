// src/store/livreur/livreurThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getMyPendingClient,
  searchClientByPhone,
  deletePendingClient,
  createCommande,
  getReadyForDelivery,
  recordPayment,
  addClient
} from './livreurService'

// ========== CLIENT THUNKS ==========

export const fetchPendingClient = createAsyncThunk(
  'livreur/fetchPendingClient',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyPendingClient()
      return response.data
    } catch (error) {
      if (error.response?.status === 204) {
        return null // No pending client
      }
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement')
    }
  }
)

export const searchClient = createAsyncThunk(
  'livreur/searchClient',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await searchClientByPhone(phone)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de recherche')
    }
  }
)

export const registerClient = createAsyncThunk(
  'livreur/registerClient',
  async (data, { rejectWithValue }) => {
    try {
      const response = await addClient(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création')
    }
  }
)

export const deleteClient = createAsyncThunk(
  'livreur/deleteClient',
  async (clientId, { rejectWithValue }) => {
    try {
      await deletePendingClient(clientId)
      return clientId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }
)

// ========== COMMANDE THUNKS ==========

export const createOrder = createAsyncThunk(
  'livreur/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createCommande(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création de la commande')
    }
  }
)

export const fetchReadyForDelivery = createAsyncThunk(
  'livreur/fetchReadyForDelivery',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReadyForDelivery()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement')
    }
  }
)

export const submitPayment = createAsyncThunk(
  'livreur/submitPayment',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await recordPayment(orderId, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'enregistrement du paiement")
    }
  }
)