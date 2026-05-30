'use client';

import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiX,
  FiAward,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCardMedia from '@/components/CourseCardMedia';
import {
  getThumbnailPreviewUrl,
  getVideoPreviewEmbedUrl,
} from '@/lib/courseMedia';

const emptyForm = {
  title: '',
  shortDescription: '',
  description: '',
  hours: 0,
  days: 0,
  type: 'Offline' as 'Online' | 'Offline' | 'Hybrid',
  price: 0,
  isFree: false,
  startDate: '',
  endDate: '',
  location: '',
  thumbnail: '',
  previewVideoUrl: '',
  category: 'General',
  isActive: true,
};

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const token = () => localStorage.getItem('token');

  const fetchTrainings = async () => {
    try {
      const res = await fetch('/api/admin/trainings', {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrainings(data);
        return data as any[];
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    return [];
  };

  const importLegacyTrainings = async (force = false) => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const url = force
        ? '/api/admin/trainings/seed?force=true'
        : '/api/admin/trainings/seed';
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage(
          `تم استيراد ${data.created} تدريب · موجود مسبقاً: ${data.skipped} · الإجمالي: ${data.total}`
        );
        setLoading(true);
        await fetchTrainings();
      } else {
        alert(data.error || 'فشل الاستيراد');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await fetchTrainings();
      if (list.length === 0) {
        await importLegacyTrainings(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      title: t.title || '',
      shortDescription: t.shortDescription || '',
      description: t.description || '',
      hours: t.hours || 0,
      days: t.days || 0,
      type: t.type || 'Offline',
      price: t.price || 0,
      isFree: !!t.isFree,
      startDate: t.startDate ? t.startDate.slice(0, 10) : '',
      endDate: t.endDate ? t.endDate.slice(0, 10) : '',
      location: t.location || '',
      thumbnail: t.thumbnail || '',
      previewVideoUrl: t.previewVideoUrl || '',
      category: t.category || 'General',
      isActive: t.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/trainings/${editing._id}` : '/api/admin/trainings';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchTrainings();
        setShowModal(false);
      } else {
        alert('Failed to save');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: any) => {
    await fetch(`/api/admin/trainings/${t._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    fetchTrainings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this training?')) return;
    await fetch(`/api/admin/trainings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchTrainings();
  };

  const filtered = trainings.filter(
    (t) =>
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <FiAward className="text-primary" />
            Trainings Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            إضافة وتعديل الكورسات الأوفلاين — تظهر مباشرة في الموقع
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => importLegacyTrainings(false)}
            disabled={seeding}
            className="flex items-center gap-2 bg-white/10 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            {seeding ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiDownload />
            )}
            استيراد التدريبات (30)
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            <FiPlus /> إضافة تدريب
          </button>
        </div>
      </div>

      {seedMessage && (
        <p className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          {seedMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        <span>إجمالي التدريبات: {trainings.length}</span>
        <span>·</span>
        <span>ظاهر: {trainings.filter((t) => t.isActive).length}</span>
        <span>·</span>
        <span>مخفي: {trainings.filter((t) => !t.isActive).length}</span>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trainings..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
        />
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="glass border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                <CourseCardMedia
                  thumbnail={t.thumbnail}
                  videoUrl={t.previewVideoUrl}
                  title={t.title}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-white text-lg">{t.title}</h3>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      t.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {t.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1 line-clamp-1">{t.shortDescription}</p>
                <p className="text-[10px] text-primary font-bold mt-2 uppercase">
                  {t.type} · {t.category} · {t.isFree ? 'Free' : `${t.price} EGP`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(t)}
                  className="p-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white border border-white/10"
                  title={t.isActive ? 'Hide' : 'Show'}
                >
                  {t.isActive ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No trainings yet. Add your first one.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full sm:max-w-2xl max-h-[90vh] bg-[#0a1f1c] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                <h2 className="text-xl font-black text-white">
                  {editing ? 'تعديل تدريب' : 'إضافة تدريب جديد'}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 p-2">
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
                <Field label="اسم التدريب *">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="وصف مختصر *">
                  <textarea
                    required
                    rows={2}
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="وصف كامل *">
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="الساعات">
                    <input
                      type="number"
                      min={0}
                      value={form.hours}
                      onChange={(e) => setForm({ ...form, hours: +e.target.value })}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="الأيام">
                    <input
                      type="number"
                      min={0}
                      value={form.days}
                      onChange={(e) => setForm({ ...form, days: +e.target.value })}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="السعر">
                    <input
                      type="number"
                      min={0}
                      disabled={form.isFree}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: +e.target.value })}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="النوع">
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as typeof form.type })
                      }
                      className="admin-input"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </Field>
                  <Field label="التصنيف">
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="admin-input"
                      placeholder="Programming, Business..."
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="تاريخ البداية">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="تاريخ النهاية">
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <Field label="مكان التدريب (حضوري)">
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="رابط الصورة (Drive / JPG / PNG / WEBP)">
                  <input
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                    className="admin-input dir-ltr"
                    placeholder="https://drive.google.com/file/d/... أو رابط صورة مباشر"
                  />
                  {getThumbnailPreviewUrl(form.thumbnail) && (
                    <div className="mt-3 relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                      <img
                        src={getThumbnailPreviewUrl(form.thumbnail)!}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Field>
                <Field label="فيديو Intro (YouTube / Drive / MP4)">
                  <input
                    value={form.previewVideoUrl}
                    onChange={(e) => setForm({ ...form, previewVideoUrl: e.target.value })}
                    className="admin-input dir-ltr"
                    placeholder="YouTube أو Google Drive أو MP4"
                  />
                  {getVideoPreviewEmbedUrl(form.previewVideoUrl) && (
                    <div className="mt-3 relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                      <iframe
                        src={getVideoPreviewEmbedUrl(form.previewVideoUrl)!}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title="Video preview"
                      />
                    </div>
                  )}
                  {form.previewVideoUrl?.trim() &&
                    !getVideoPreviewEmbedUrl(form.previewVideoUrl) &&
                    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(form.previewVideoUrl) && (
                      <div className="mt-3 relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                        <video
                          src={form.previewVideoUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                </Field>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-white text-sm font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    />
                    مجاني
                  </label>
                  <label className="flex items-center gap-2 text-white text-sm font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    ظاهر في الموقع
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'حفظ التعديلات' : 'نشر التدريب'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.875rem;
          outline: none;
        }
        .admin-input:focus {
          border-color: rgba(0, 106, 90, 0.6);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
