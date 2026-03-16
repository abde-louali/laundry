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
        <aside className="hidden md:flex flex-col w-[260px] lg:w-[280px] bg-laundry-sidebar-bg h-screen sticky top-0 z-40 shadow-sidebar overflow-hidden transition-all duration-300">
            {/* LOGO SECTION */}
            <div className="p-6 pb-8 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl shadow-sm">
                        <img src={logo} alt="Logo" className="h-8 w-8 object-contain brightness-0 invert" />
                    </div>
                    <h1 className="font-extrabold text-xl tracking-tight text-white">
                        PURE<span className="text-laundry-accent">CLEAN</span>
                    </h1>
                </div>
            </div>

            {/* LINKS SECTION */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                <p className="px-3 text-xs font-semibold text-laundry-sidebar-text/50 uppercase tracking-widest mb-4">Navigations</p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all font-medium text-sm w-full outline-none focus:ring-2 focus:ring-laundry-primary-light ${
                                isActive
                                    ? 'bg-laundry-primary-light text-white font-semibold'
                                    : 'text-laundry-sidebar-text/70 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-laundry-sidebar-text/70'} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* USER FOOTER */}
            <div className="p-4 mt-auto border-t border-white/10 bg-black/10">
                <div className="flex items-center gap-3 p-3 rounded-lg mb-3 bg-white/5">
                    <div className="w-10 h-10 bg-laundry-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                        {user?.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                        <span className="text-xs font-medium text-laundry-sidebar-text/60 capitalize">{user?.role}</span>
                    </div>
                </div>
                <LogoutButton />
            </div>
        </aside>
    );
};

export default Sidebar;
