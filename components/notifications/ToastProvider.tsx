import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { XMarkIcon } from './icons/XMarkIcon';


type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <XCircleIcon className="h-6 w-6 text-red-500" />,
        warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [message.id, onDismiss]);

    return (
        <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-toast-in">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {icons[message.type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-900">{message.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onDismiss(message.id)}
                            className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
    return (
         <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast} onDismiss={removeToast} />
                ))}
            </div>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToasts((prevToasts) => [
            ...prevToasts,
            { id: Date.now(), message, type },
        ]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
