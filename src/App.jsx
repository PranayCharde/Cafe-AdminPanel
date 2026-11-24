import React, { useEffect } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/Sidebar';
import Login from './pages/Login';
import Orders from './pages/Orders';
import TableQR from './pages/TableQR';
import MenuManager from './pages/MenuManager';
import Reservations from './pages/Reservations';
import Inquiries from './pages/Inquiries';
import Analytics from './pages/Analytics';

export default function App() {
  const { isAuthenticated, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    if (typeof checkAuth === 'function') {
      checkAuth();
    }
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mr-3" />
        Initializing Admin Portal...
      </div>
    );
  }

  // If not authenticated, render Login immediately
  if (!isAuthenticated) {
    return <Login />;
  }

  // Authenticated Protected Admin Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Switch>
            <Route path="/" component={Orders} />
            <Route path="/tables" component={TableQR} />
            <Route path="/menu" component={MenuManager} />
            <Route path="/reservations" component={Reservations} />
            <Route path="/inquiries" component={Inquiries} />
            <Route path="/analytics" component={Analytics} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}
