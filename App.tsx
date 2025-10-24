import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InvoiceProvider } from './contexts/InvoiceContext';
import { ProductProvider } from './contexts/ProductContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';

const AppContent: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans relative overflow-hidden">
            <div className="animated-bg"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-3xl"></div>
            <div className="relative z-10">
                {user ? (
                    <InvoiceProvider>
                        <ProductProvider>
                            <Dashboard />
                        </ProductProvider>
                    </InvoiceProvider>
                ) : (
                    <Login />
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;
