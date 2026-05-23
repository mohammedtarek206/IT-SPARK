export const CART_STORAGE_KEY = 'cart';
export const CART_UPDATE_EVENT = 'cart-updated';

export function getCartIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getCartCount(): number {
    return getCartIds().length;
}

export function isInCart(courseId: string): boolean {
    return getCartIds().includes(courseId);
}

function getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}

/** Sync one item to server (logged-in users only) */
async function syncCartItem(courseId: string, action: 'add' | 'remove'): Promise<void> {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await fetch('/api/cart', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ courseId, action }),
        });
    } catch (err) {
        console.error('Cart sync failed:', err);
    }
}

/** Sync entire local cart to server */
export async function syncCartWithServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await fetch('/api/cart', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ courseIds: getCartIds() }),
        });
    } catch (err) {
        console.error('Cart full sync failed:', err);
    }
}

export function addToCart(courseId: string): boolean {
    const cart = getCartIds();
    if (cart.includes(courseId)) return false;
    const next = [...cart, courseId];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    dispatchCartUpdate();
    void syncCartItem(courseId, 'add');
    return true;
}

export function removeFromCart(courseId: string): void {
    const next = getCartIds().filter((id) => id !== courseId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    dispatchCartUpdate();
    void syncCartItem(courseId, 'remove');
}

export function toggleCart(courseId: string): boolean {
    if (isInCart(courseId)) {
        removeFromCart(courseId);
        return false;
    }
    return addToCart(courseId);
}

export async function clearCartServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await fetch('/api/cart', {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
    } catch (err) {
        console.error('Clear cart server failed:', err);
    }
}

export function clearCart(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    dispatchCartUpdate();
    void clearCartServer();
}

export function dispatchCartUpdate(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(CART_UPDATE_EVENT, { detail: { count: getCartCount() } })
    );
}
