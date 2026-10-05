import { redirect } from 'next/navigation';

// Legacy mock payment page — redirect to official checkout
export default function PaymentPage() {
    redirect('/checkout');
}
