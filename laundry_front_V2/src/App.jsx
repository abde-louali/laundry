
import { Provider } from 'react-redux'
import { store } from './store/store'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Auth/Login'
import Layout from './components/layout/layout'
import RequireAuth from './routes/RequireAuth'
import RequireRole from './routes/RequireRole'
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
import EmployeDashboard from './pages/employe/EmployeDashboard'
import CommandeDetail from './pages/employe/CommandeDetail'
import ReturnedOrders from './pages/employe/ReturnedOrders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {


  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<PersistLogin />}>

              <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
                <Route element={<RequireAuth />}>
                  <Route element={<RequireRole allowedRoles={["admin"]} />}>
                    <Route path='/admin/dashboard' element={<AdminDashboard />} />
                    <Route path='/admin/users-management' element={<UserManagement />} />
                    <Route path='/admin/commandes' element={<AllCommandes />} />
                    <Route path='/admin/commandes/:id' element={<AdminCommandeDetail />} />
                    <Route path='/admin/clients' element={<AllClients />} />
                    <Route path='/admin/clients/:clientId' element={<ClientCommandes />} />
                  </Route>

                  <Route element={<RequireRole allowedRoles={["livreur"]} />}>
                    {/* Main Dashboard */}
                    <Route path='/livreur/dashboard' element={<Dashboard />} />

                    {/* Client Management */}
                    <Route path='/livreur/register-client' element={<RegisterClient />} />

                    {/* Order Creation & History */}
                    <Route path='/livreur/create-order' element={<CreateOrder />} />

                    {/* Delivery Flow */}
                    <Route path='/livreur/ready-for-delivery' element={<ReadyForDelivery />} />
                    <Route path='/livreur/canceled-deliveries' element={<CanceledDeliveries />} />
                  </Route>

                    <Route element={<RequireRole allowedRoles={["employe"]} />}>
                      {/* Employe Dashboard */}
                      <Route path='/employe/dashboard' element={<EmployeDashboard />} />

                      {/* Commande Detail */}
                      <Route path='/employe/commandes/:id' element={<CommandeDetail />} />

                      {/* Returned Orders */}
                      <Route path='/employe/retours' element={<ReturnedOrders />} />
                    </Route>
                </Route>
              </Route>
            </Route>
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
