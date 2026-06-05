'use client';

import { useState, useEffect } from 'react';
import { FiShoppingCart, FiRefreshCw, FiSearch, FiUser, FiBook } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';

interface CartItemRow {
    _id: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
    user?: { _id: string; name: string; email: string; phone?: string };
    course?: {
        _id: string;
        title: string;
        thumbnail?: string;
        price: number;
        discountPrice?: number;
        isFree: boolean;
    };
}

export default function AdminCartOrdersPage() {
    const [items, setItems] = useState<CartItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/cart-items', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                cache: 'no-store'
            });
            if (res.ok) {
                setItems(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        const intervalId = setInterval(fetchItems, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const filtered = items.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.user?.name?.toLowerCase().includes(q) ||
            item.user?.email?.toLowerCase().includes(q) ||
            item.course?.title?.toLowerCase().includes(q)
        );
    });

    const totalValue = filtered.reduce((s, i) => s + (i.amount || 0), 0);
    const uniqueUsers = new Set(filtered.map((i) => i.user?._id).filter(Boolean)).size;

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <FiShoppingCart className="text-primary" />
                        Cart / Purchase Intents
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        سلات المستخدمين النشطة — من أضاف كورسات ولم يُكمل الدفع بعد
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchItems}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Active Items
                    </p>
                    <p className="text-3xl font-black text-white mt-1">{filtered.length}</p>
                </div>
                <div className="glass border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Users
                    </p>
                    <p className="text-3xl font-black text-primary mt-1">{uniqueUsers}</p>
                </div>
                <div className="glass border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Est. Value (EGP)
                    </p>
                    <p className="text-3xl font-black text-emerald-400 mt-1">
                        {totalValue.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by student, email, or course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-primary/50"
                />
            </div>

            <div className="glass border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No active cart items yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="border-b border-white/5 hover:bg-white/[0.02]"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="text-primary shrink-0" />
                                                <div>
                                                    <p className="font-bold text-white">
                                                        {item.user?.name || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {item.course?.thumbnail && (
                                                    <img
                                                        src={getDriveDirectLink(item.course.thumbnail)}
                                                        alt=""
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <FiBook className="text-primary shrink-0" />
                                                    <span className="font-medium text-white truncate max-w-[200px]">
                                                        {item.course?.title || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-black text-emerald-400">
                                            {item.course?.isFree
                                                ? 'Free'
                                                : `${item.amount} EGP`}
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {new Date(item.updatedAt || item.createdAt).toLocaleString(
                                                'ar-EG'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
