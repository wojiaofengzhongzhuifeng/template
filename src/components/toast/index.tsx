'use client';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

import { useToastStore } from './store';

const toastIcons = {
    error: XCircle,
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
};

const toastStyles = {
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
};

export function Toaster() {
    const { toasts } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const Icon = toastIcons[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded border shadow-lg transition-all duration-300 ${toastStyles[toast.type]}`}
                        role="alert"
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}

export function useToast() {
    const { addToast } = useToastStore();

    return {
        success: (message: string) => addToast('success', message),
        error: (message: string) => addToast('error', message),
        info: (message: string) => addToast('info', message),
        warning: (message: string) => addToast('warning', message),
    };
}
