
import { Provider } from 'react-redux'
import { store } from './store/store'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Login from './Auth/Login'
import Layout from './components/layout/layout'
import RequireAuth from './routes/RequireAuth'
import UserManagement from './pages/admin/UserManagement'
import AllCommandes from './pages/admin/AllCommandes'
import AdminCommandeDetail from './pages/admin/AdminCommandeDetail'
import AllClients from './pages/admin/AllClients'
import ClientCommandes from './pages/admin/ClientCommandes'
import AdminDashboard from './pages/admin/AdminDashboard'
import PersistLogin from './routes/PersistLogin'
import RegisterClient from './pages/livreur/RegisterClient'
import Dashboard from './pages/livreur/LivreurDashboard'
import CreateOrder from './pages/livreur/CreateOrder'

import ReadyForDelivery from './pages/livreur/ReadyForDelivery'
import CanceledDeliveries from './pages/livreur/CanceledDeliveries'
import DeliveryDetails from './pages/livreur/DeliveryDetails'
import EmployeDashboard from './pages/employe/EmployeDashboard'
import CommandeDetail from './pages/employe/CommandeDetail'
import ReturnedOrders from './pages/employe/ReturnedOrders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import InactivePage from './pages/InactivePage'
import UnauthorizedPage from './pages/UnauthorizedPage'


function App() {


  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<PersistLogin />}>

              <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
                <Route path="/compte-inactif" element={<InactivePage />} />
                <Route path="/non-autorise" element={<UnauthorizedPage />} />
                <Route element={<RequireAuth allowedRoles={["admin"]} />}>
                    <Route path='/admin/dashboard' element={<AdminDashboard />} />
                    <Route path='/admin/users-management' element={<UserManagement />} />
                    <Route path='/admin/commandes' element={<AllCommandes />} />
                    <Route path='/admin/commandes/:id' element={<AdminCommandeDetail />} />
                    <Route path='/admin/clients' element={<AllClients />} />
                    <Route path='/admin/clients/:clientId' element={<ClientCommandes />} />
                </Route>

                  <Route element={<RequireAuth allowedRoles={["livreur"]} />}>
                    <Route path='/livreur' element={<Dashboard />} />
                    <Route path='/livreur/clients' element={<RegisterClient />} />
                    <Route path='/livreur/orders' element={<CreateOrder />} />
                    <Route path='/livreur/delivery' element={<ReadyForDelivery />} />
                    <Route path='/livreur/delivery/:id' element={<DeliveryDetails />} />
                    <Route path='/livreur/canceled' element={<CanceledDeliveries />} />
                  </Route>

                    <Route element={<RequireAuth allowedRoles={["employe"]} />}>
                      {/* Employe Dashboard */}
                      <Route path='/employe/dashboard' element={<EmployeDashboard />} />

                      {/* Commande Detail */}
                      <Route path='/employe/commandes/:id' element={<CommandeDetail />} />

                      {/* Returned Orders */}
                      <Route path='/employe/retours' element={<ReturnedOrders />} />
                    </Route>
                </Route>
              </Route>
            {/* 404 Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Provider>
    </>
  )
}

export default App
