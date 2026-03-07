// src/store/livreur/livreurSlice.js
import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPendingClient,
  searchClient,
  registerClient,
  deleteClient,
  createOrder,
  fetchReadyForDelivery,
  submitPayment
} from './livreurThunk'

const initialState = {
  // Client state
  pendingClient: null,
  searchResult: null,

  // Orders state
  readyForDelivery: [],
  currentOrder: null,

  // Loading states
  loading: {
    pendingClient: false,
    search: false,
    createClient: false,
    deleteClient: false,
    createOrder: false,
    readyForDelivery: false,
    payment: false
  },

  // Error states
  error: {
    pendingClient: null,
    search: null,
    createClient: null,
    deleteClient: null,
    createOrder: null,
    readyForDelivery: null,
    payment: null
  },

  // Success flags
  clientCreated: false,
  orderCreated: false,
  paymentRecorded: false
}

const livreurSlice = createSlice({
  name: 'livreur',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        pendingClient: null,
        search: null,
        createClient: null,
        deleteClient: null,
        createOrder: null,
        readyForDelivery: null,
        payment: null
      }
    },
    clearSearchResult: (state) => {
      state.searchResult = null
    },
    resetClientCreated: (state) => {
      state.clientCreated = false
    },
    resetOrderCreated: (state) => {
      state.orderCreated = false
    },
    resetPaymentRecorded: (state) => {
      state.paymentRecorded = false
    },
    setPendingClient: (state, action) => {
      state.pendingClient = action.payload
    }
  },
  extraReducers: (builder) => {
    // ========== FETCH PENDING CLIENT ==========
    builder
      .addCase(fetchPendingClient.pending, (state) => {
        state.loading.pendingClient = true
        state.error.pendingClient = null
      })
      .addCase(fetchPendingClient.fulfilled, (state, action) => {
        state.loading.pendingClient = false
        state.pendingClient = action.payload
      })
      .addCase(fetchPendingClient.rejected, (state, action) => {
        state.loading.pendingClient = false
        state.error.pendingClient = action.payload
        state.pendingClient = null
      })

    // ========== SEARCH CLIENT ==========
    builder
      .addCase(searchClient.pending, (state) => {
        state.loading.search = true
        state.error.search = null
      })
      .addCase(searchClient.fulfilled, (state, action) => {
        state.loading.search = false
        // Backend returns: { found: true, client: { ... } } or { found: false }
        if (action.payload?.found && action.payload?.client) {
          state.searchResult = action.payload.client
        } else {
          state.searchResult = null
        }
      })
      .addCase(searchClient.rejected, (state, action) => {
        state.loading.search = false
        state.error.search = action.payload
      })

    // ========== REGISTER CLIENT ==========
    builder
      .addCase(registerClient.pending, (state) => {
        state.loading.createClient = true
        state.error.createClient = null
        state.clientCreated = false
      })
      .addCase(registerClient.fulfilled, (state, action) => {
        state.loading.createClient = false
        state.pendingClient = action.payload
        state.clientCreated = true
      })
      .addCase(registerClient.rejected, (state, action) => {
        state.loading.createClient = false
        state.error.createClient = action.payload
        state.clientCreated = false
      })

    // ========== DELETE CLIENT ==========
    builder
      .addCase(deleteClient.pending, (state) => {
        state.loading.deleteClient = true
        state.error.deleteClient = null
      })
      .addCase(deleteClient.fulfilled, (state) => {
        state.loading.deleteClient = false
        state.pendingClient = null
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading.deleteClient = false
        state.error.deleteClient = action.payload
      })

    // ========== CREATE ORDER ==========
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading.createOrder = true
        state.error.createOrder = null
        state.orderCreated = false
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading.createOrder = false
        state.currentOrder = action.payload
        state.pendingClient = null // Client no longer pending
        state.orderCreated = true
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading.createOrder = false
        state.error.createOrder = action.payload
        state.orderCreated = false
      })

    // ========== FETCH READY FOR DELIVERY ==========
    builder
      .addCase(fetchReadyForDelivery.pending, (state) => {
        state.loading.readyForDelivery = true
        state.error.readyForDelivery = null
      })
      .addCase(fetchReadyForDelivery.fulfilled, (state, action) => {
        state.loading.readyForDelivery = false
        state.readyForDelivery = action.payload
      })
      .addCase(fetchReadyForDelivery.rejected, (state, action) => {
        state.loading.readyForDelivery = false
        state.error.readyForDelivery = action.payload
      })

    // ========== SUBMIT PAYMENT ==========
    builder
      .addCase(submitPayment.pending, (state) => {
        state.loading.payment = true
        state.error.payment = null
        state.paymentRecorded = false
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.loading.payment = false
        state.currentOrder = action.payload
        state.paymentRecorded = true
        // Remove from ready for delivery list
        state.readyForDelivery = state.readyForDelivery.filter(
          order => order.id !== action.payload.id
        )
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.loading.payment = false
        state.error.payment = action.payload
        state.paymentRecorded = false
      })
  }
})

export const {
  clearErrors,
  clearSearchResult,
  resetClientCreated,
  resetOrderCreated,
  resetPaymentRecorded,
  setPendingClient
} = livreurSlice.actions

export default livreurSlice.reducer