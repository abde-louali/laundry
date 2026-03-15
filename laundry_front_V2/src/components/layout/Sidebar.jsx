import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Truck, ClipboardList, UserPlus, Package, Home, Settings, LogOut, Wrench, Users, LayoutDashboard, XCircle, RefreshCw } from 'lucide-react';
import logo from '../../assets/logo.png';
import LogoutButton from '../../Auth/Logout';

const Sidebar = ({ user }) => {
    const location = useLocation();

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Utilisateurs', path: '/admin/users-management', icon: Shield },
        { name: 'Commandes', path: '/admin/commandes', icon: ClipboardList },
        { name: 'Clients', path: '/admin/clients', icon: Users },
    ];

    const livreurLinks = [
        { name: 'Dashboard', path: '/livreur/dashboard', icon: Home },
        { name: 'Clients', path: '/livreur/register-client', icon: UserPlus },
        { name: 'Commandes', path: '/livreur/create-order', icon: Package },
        { name: 'Livraisons', path: '/livreur/ready-for-delivery', icon: ClipboardList },
        { name: 'Annulées', path: '/livreur/canceled-deliveries', icon: XCircle },
    ];

    const employeLinks = [
        { name: 'Atelier', path: '/employe/dashboard', icon: Wrench },
        { name: 'Retours', path: '/employe/retours', icon: RefreshCw },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'livreur' ? livreurLinks : user?.role === 'employe' ? employeLinks : [];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-laundry-sky/50 h-screen sticky top-0 z-40 shadow-xl shadow-laundry-deep/5 overflow-hidden transition-all">
            {/* LOGO SECTION */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-laundry-sky rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                        <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
                    </div>
                    <h1 className="font-black text-xl tracking-tighter uppercase text-laundry-deep">
                        PURE<span className="text-laundry-primary">CLEAN</span>
                    </h1>
                </div>
            </div>

            {/* LINKS SECTION */}
            <nav className="flex-1 px-4 space-y-2">
                <p className="px-4 text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mb-4">Navigation</p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group ${isActive
                                ? 'bg-laundry-primary text-white shadow-lg shadow-laundry-primary/30'
                                : 'text-laundry-deep/60 hover:bg-laundry-sky hover:text-laundry-primary'
                                }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* USER FOOTER */}
            <div className="p-4 mt-auto border-t border-laundry-sky/30 bg-laundry-sky/10">
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-laundry-sky mb-2">
                    <div className="w-10 h-10 bg-laundry-deep text-white rounded-xl flex items-center justify-center font-black shadow-md">
                        {user?.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-black text-laundry-deep truncate">{user?.name}</span>
                        <span className="text-[9px] font-black text-laundry-primary uppercase tracking-widest">{user?.role}</span>
                    </div>
                </div>
                <LogoutButton />
            </div>
        </aside>
    );
};

export default Sidebar;
