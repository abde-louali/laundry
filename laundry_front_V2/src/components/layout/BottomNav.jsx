import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, UserPlus, Package, User, Wrench, XCircle } from 'lucide-react';

const BottomNav = ({ user }) => {
    const location = useLocation();

    if (user?.role !== 'livreur' && user?.role !== 'employe') return null;

    const livreurLinks = [
        { name: 'Home', path: '/livreur/dashboard', icon: Home },
        { name: 'Client', path: '/livreur/register-client', icon: UserPlus },
        { name: 'Commande', path: '/livreur/create-order', icon: Package },
        { name: 'Prêtes', path: '/livreur/ready-for-delivery', icon: ClipboardList },
        { name: 'Annulées', path: '/livreur/canceled-deliveries', icon: XCircle },
    ];

    const employeLinks = [
        { name: 'Atelier', path: '/employe/dashboard', icon: Wrench },
    ];

    const links = user?.role === 'employe' ? employeLinks : livreurLinks;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6 pt-2 pointer-events-none">
            <div className="glass rounded-[2rem] shadow-2xl shadow-laundry-deep/20 border-white/60 flex items-center justify-around p-2 pointer-events-auto max-w-md mx-auto relative overflow-hidden">
                {/* GLOW EFFECT */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-laundry-primary to-transparent opacity-50"></div>

                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${isActive
                                ? 'text-laundry-primary'
                                : 'text-laundry-deep/40'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-laundry-primary/10 rounded-2xl animate-scale-up"></div>
                            )}
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 3 : 2}
                                className={`z-10 transition-transform ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
                            />
                            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 z-10 transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
