import React from 'react';
import { useToast } from '../contexts/ToastContext';

const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-600/20 border-green-500/50';
            case 'error': return 'bg-red-600/20 border-red-500/50';
            default: return 'bg-blue-600/20 border-blue-500/50';
        }
    }

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 w-full max-w-xs p-4 text-white rounded-lg shadow-lg border ${getBgColor(toast.type)} backdrop-blur-md animate-fade-in-up`}
                    role="alert"
                >
                    {getIcon(toast.type)}
                    <div className="text-sm font-normal">{toast.message}</div>
                </div>
            ))}
             <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ToastContainer;
