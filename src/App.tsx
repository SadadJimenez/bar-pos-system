import React, { useState, useEffect } from 'react';
import { seedDatabase, type User } from './db/database';
import Sidebar from './components/Sidebar';
import POSModule from './modules/POSModule';
import InventoryModule from './modules/InventoryModule';
import ReportsModule from './modules/ReportsModule';
import TableModule from './modules/TableModule';
import LoginModule from './modules/LoginModule';
import UserModule from './modules/UserModule';
import { Menu } from 'lucide-react';
import LogoAM from './components/LogoAM';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('pos');
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing database...');
        await seedDatabase();
        console.log('Database ready');
        setIsDbReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setDbError(err instanceof Error ? err.message : String(err));
      }
    };
    init();
  }, []);

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-danger p-8 text-center">
        <div className="card border-danger/20 glass">
          <h2 className="text-2xl font-bold mb-4">Error de Inicialización</h2>
          <p className="text-text-secondary">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-6"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-primary">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <LogoAM size={120} variant="gold" className="filter drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
          <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <p className="font-outfit font-black tracking-[0.5em] text-sm uppercase glow-text ml-[0.5em]">AM LICORES</p>
            <p className="text-[10px] text-text-muted mt-3 uppercase font-bold tracking-[0.2em] opacity-50">Sincronizando Sistema v1.0.4...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginModule onLogin={setUser} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'pos': return (
        <POSModule
          currentUser={user}
          tableId={activeTable}
          onClose={() => {
            setActiveTable(null);
            setActiveModule('pos');
          }}
        />
      );
      case 'tables': return (
        <TableModule
          onSelectTable={(id) => {
            setActiveTable(id);
            setActiveModule('pos');
          }}
        />
      );
      case 'inventory': return <InventoryModule />;
      case 'reports': return <ReportsModule />;
      case 'users': return <UserModule />;
      default: return (
        <POSModule
          currentUser={user}
          tableId={null}
          onClose={() => setActiveModule('tables')}
        />
      );
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg-dark overflow-hidden">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onLogout={() => setUser(null)}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          userRole={user.role}
        />

        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <header className="h-20 border-b border-border px-6 flex items-center justify-between bg-bg-surface/50 backdrop-blur-sm lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-text-primary hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="font-bold font-outfit text-primary glow-text">AM LICORES</div>
            <div className="w-10 h-10 bg-bg-surface-light rounded-full border border-primary flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {renderModule()}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;
