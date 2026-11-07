import { permanentRedirect } from 'next/navigation';

// Obsolete payment URL permanently forwarded to official courses catalog
export default function PaymentPage() {
    permanentRedirect('/courses');
}
