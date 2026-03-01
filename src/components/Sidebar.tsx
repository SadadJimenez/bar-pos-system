import React from 'react';
import {
    ShoppingCart,
    ClipboardList,
    Package,
    BarChart3,
    Users,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import LogoAM from './LogoAM';

interface SidebarProps {
    activeModule: string;
    setActiveModule: (module: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
    onLogout: () => void;
    userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeModule,
    setActiveModule,
    isOpen,
    setIsOpen,
    isCollapsed,
    setIsCollapsed,
    onLogout,
    userRole
}) => {
    const menuItems = [
        { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart, roles: ['admin', 'cashier'] },
        { id: 'tables', name: 'Cuentas Abiertas', icon: ClipboardList, roles: ['admin', 'cashier'] },
        { id: 'inventory', name: 'Inventario', icon: Package, roles: ['admin'] },
        { id: 'reports', name: 'Reportes', icon: BarChart3, roles: ['admin'] },
        { id: 'users', name: 'Usuarios', icon: Users, roles: ['admin'] },
    ];

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 glass border-r border-border transform transition-all duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:relative lg:translate-x-0
    ${isCollapsed ? 'w-20' : 'w-72'}
  `;

    return (
        <div className={sidebarClasses}>
            <div className={`p-4 lg:p-6 flex flex-col h-full ${isCollapsed ? 'items-center px-2' : ''}`}>
                <div className={`flex items-center justify-between mb-10 w-full ${isCollapsed ? 'flex-col gap-4' : ''}`}>
                    <div className="flex items-center gap-4">
                        <LogoAM size={isCollapsed ? 50 : 60} variant="gold" className="-ml-1" />
                        {!isCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                                <h1 className="text-xl font-black font-outfit glow-text tracking-tighter uppercase leading-none">AM LICORES</h1>
                                <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-bold mt-1">Premium POS</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-1">
                        <button
                            className="hidden lg:flex p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary transition-all"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <button
                            className="lg:hidden p-2 text-text-secondary hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <nav className={`flex-1 space-y-2 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {menuItems.map((item) => {
                        if (!item.roles.includes(userRole)) return null;

                        const Icon = item.icon;
                        const isActive = activeModule === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveModule(item.id);
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                                title={isCollapsed ? item.name : ''}
                                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-primary text-black font-bold shadow-glow'
                                        : 'text-text-secondary hover:bg-bg-surface-light hover:text-text-primary'}
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                            >
                                <Icon size={22} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                                {!isCollapsed && <span className="font-outfit whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className={`mt-auto pt-6 border-t border-border w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 text-text-secondary hover:text-danger rounded-xl transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut size={22} />
                        {!isCollapsed && <span className="font-outfit">Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
