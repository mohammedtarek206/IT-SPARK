'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiShield, FiCreditCard, FiLock, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Select Plan, 2: Payment, 3: Success
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const plans = [
        { id: 'pro', name: 'Pro Student', price: 29, period: '/month' },
        { id: 'master', name: 'Track Master', price: 199, period: '/track (one-time)' }
    ];

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
        }, 2000);
    };

    const currentPlan = plans.find(p => p.id === selectedPlan) || plans[0];

    return (
        <div className="min-h-screen bg-dark pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-4xl w-full grid md:grid-cols-5 gap-8 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-4 md:p-8 shadow-2xl relative z-10">

                {/* Left Side: Order Summary */}
                <div className="md:col-span-2 space-y-8 bg-white/5 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <Link href="/pricing" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white mb-8 inline-block transition-colors">
                            ← Back to Pricing
                        </Link>

                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Order Summary</h2>

                        <div className="space-y-4">
                            {plans.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => step < 3 && setSelectedPlan(plan.id)}
                                    disabled={step === 3}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedPlan === plan.id
                                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                                        : 'bg-black/20 border-white/5 hover:border-white/20'
                                        } ${step === 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div>
                                        <p className="font-bold text-white text-sm">{plan.name}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            {selectedPlan === plan.id ? 'Selected Plan' : 'Select'}
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <span className={`text-lg font-black ${selectedPlan === plan.id ? 'text-primary' : 'text-white'}`}>
                                            ${plan.price}
                                        </span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-white/20'
                                            }`}>
                                            {selectedPlan === plan.id && <FiCheck className="text-white text-xs" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/10 relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-400">Subtotal</span>
                            <span className="text-sm font-bold text-white">${currentPlan.price}.00</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-400">Taxes</span>
                            <span className="text-sm font-bold text-white">$0.00</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <span className="text-lg font-black text-white uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-white leading-none">${currentPlan.price}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Checkout Flow */}
                <div className="md:col-span-3 p-4 sm:p-8 flex flex-col justify-center min-h-[500px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 2: Payment Details */}
                        {step === 1 && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Secure Checkout</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enter your payment details to complete enrollment.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-xs ${paymentMethod === 'card' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <FiCreditCard className="text-sm" /> Card
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-xs ${paymentMethod === 'paypal' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        PayPal
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('instapay')}
                                        className={`py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-xs ${paymentMethod === 'instapay' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        InstaPay
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('fawry')}
                                        className={`py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-xs ${paymentMethod === 'fawry' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        Fawry
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('vodafone')}
                                        className={`col-span-2 md:col-span-1 py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-xs ${paymentMethod === 'vodafone' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        V-Cash
                                    </button>
                                </div>

                                <form onSubmit={handlePayment} className="space-y-5">
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Card Information</label>
                                                <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Card number"
                                                        className="w-full bg-transparent p-4 text-white font-medium focus:outline-none border-b border-white/10 placeholder:text-gray-600"
                                                    />
                                                    <div className="flex">
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="MM / YY"
                                                            className="w-1/2 bg-transparent p-4 text-white font-medium focus:outline-none border-r border-white/10 placeholder:text-gray-600"
                                                        />
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="CVC"
                                                            className="w-1/2 bg-transparent p-4 text-white font-medium focus:outline-none placeholder:text-gray-600"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Name on card</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'paypal' && (
                                        <div className="bg-black/20 border border-white/10 rounded-2xl p-6 text-center">
                                            <p className="text-sm text-gray-400">You will be redirected to PayPal to complete your purchase securely.</p>
                                        </div>
                                    )}

                                    {paymentMethod === 'instapay' && (
                                        <div className="bg-black/20 border border-white/10 rounded-2xl p-6 space-y-4">
                                            <p className="text-sm text-gray-400 text-center mb-4">Transfer the exact amount to the following InstaPay account:</p>
                                            <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                                                <span className="text-white font-mono font-bold">itspark@instapay</span>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Your InstaPay Handle</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. yourname@instapay"
                                                    className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'fawry' && (
                                        <div className="bg-black/20 border border-white/10 rounded-2xl p-6 text-center">
                                            <p className="text-sm text-gray-400 mb-4">Click below to generate your Fawry Pay reference code.</p>
                                            <div className="bg-white/5 p-4 rounded-xl inline-block border border-dashed border-gray-600 text-gray-500 font-mono tracking-widest">
                                                XXXX-XXXX-XXXX
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'vodafone' && (
                                        <div className="bg-black/20 border border-white/10 rounded-2xl p-6 space-y-4">
                                            <p className="text-sm text-gray-400 text-center mb-4">Transfer to our Vodafone Cash wallet:</p>
                                            <div className="bg-primary/10 p-6 rounded-2xl border border-primary/30 flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                                                <span className="text-4xl font-black text-white tracking-widest select-all">01006093939</span>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Vodafone Cash Number</span>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Your Mobile Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="010XXXXXXXX"
                                                    className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isProcessing ? 'Processing Transaction...' : `Confirm & Pay $${currentPlan.price}.00`}
                                        {!isProcessing && <FiLock className="text-lg opacity-80" />}
                                    </button>

                                    <p className="text-center text-[10px] font-bold text-gray-500 flex items-center justify-center gap-2 uppercase tracking-widest mt-4">
                                        <FiShield /> 256-bit SSL encrypted & secure
                                    </p>
                                </form>
                            </motion.div>
                        )}


                        {/* STEP 3: Success */}
                        {step === 3 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center space-y-6 py-12"
                            >
                                <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                    <FiCheckCircle size={48} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Payment Successful!</h2>
                                    <p className="text-gray-400 font-bold mb-6">Welcome aboard. Your subscription to <strong className="text-white">{currentPlan.name}</strong> is now active.</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Amount Paid</span>
                                        <span className="text-white font-black">${currentPlan.price}.00</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Transaction ID</span>
                                        <span className="text-white font-mono text-xs">TXN-{Math.random().toString().slice(2, 10)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
                                >
                                    Proceed to Dashboard <FiChevronRight />
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
