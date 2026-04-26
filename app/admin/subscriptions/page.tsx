'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiEdit2, FiPlusCircle, FiCheck, FiUsers, FiTrash2 } from 'react-icons/fi';

const mockPlans = [
    { id: 1, name: 'Free Starter', price: 0, period: '/month', features: ['Access to free courses', 'Community forum', 'Basic certificate'], activeUsers: 312, status: 'active' },
    { id: 2, name: 'Pro Student', price: 29, period: '/month', features: ['All courses access', 'Exams & certificates', 'Priority support', 'Ad-free experience'], activeUsers: 48, status: 'active' },
    { id: 3, name: 'Track Master', price: 199, period: '/track', features: ['Complete track access', 'Live mentoring sessions', 'Career guidance', 'Job referrals'], activeUsers: 12, status: 'active' },
];

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState(mockPlans);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Subscriptions & Plans</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Manage subscription packages, pricing, and duration.</p>
                </div>
                <button className="self-start flex items-center gap-2 px-5 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <FiPlusCircle /> New Plan
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6 border border-border text-center bg-primary/5">
                    <FiPackage className="text-primary text-2xl mx-auto mb-2" />
                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest">Total Plans</p>
                    <p className="text-3xl font-black text-foreground">{plans.length}</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-border text-center bg-green-500/5">
                    <FiUsers className="text-green-600 text-2xl mx-auto mb-2" />
                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest">Total Subscribers</p>
                    <p className="text-3xl font-black text-foreground">{plans.reduce((a, p) => a + p.activeUsers, 0)}</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-border text-center bg-yellow-500/5">
                    <span className="text-yellow-600 text-2xl mx-auto mb-2 block font-black">$</span>
                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest">Monthly Revenue</p>
                    <p className="text-3xl font-black text-foreground">
                        ${plans.reduce((a, p) => a + p.price * (p.period === '/month' ? p.activeUsers : 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass rounded-3xl border p-8 flex flex-col relative overflow-hidden backdrop-blur-md ${i === 1 ? 'border-primary shadow-[0_20px_40px_rgba(var(--primary),0.1)] bg-primary/[0.02]' : 'border-border shadow-sm'}`}
                    >
                        {i === 1 && (
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-blue-400" />
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">{plan.name}</h3>
                            <button className="p-2 rounded-xl text-foreground/20 hover:text-primary hover:bg-primary/5 transition-colors">
                                <FiEdit2 className="text-sm" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-foreground">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                            {plan.price > 0 && <span className="text-foreground/40 font-bold text-sm ml-1">{plan.period}</span>}
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {plan.features.map((f, fi) => (
                                <li key={fi} className="flex items-center gap-3 text-foreground/60 font-medium text-sm">
                                    <FiCheck className="text-primary shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-border pt-4 mt-auto">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Active Subscribers</p>
                                    <p className="text-foreground font-black text-xl">{plan.activeUsers}</p>
                                </div>
                                <button className="p-2 rounded-xl text-red-500/20 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                                    <FiTrash2 className="text-sm" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
