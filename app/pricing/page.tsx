import { redirect } from 'next/navigation';

// Pricing has been removed — redirect to homepage
export default function PricingPage() {
    redirect('/');
}
