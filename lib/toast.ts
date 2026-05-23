export const TOAST_EVENT = 'app-toast';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
    message: string;
    type?: ToastType;
}

export function showToast(message: string, type: ToastType = 'success'): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}
