'use client';

import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

interface FileUploaderProps {
    onUploadSuccess: (url: string) => void;
    currentFileUrl?: string;
    label?: string;
}

export default function FileUploader({ onUploadSuccess, currentFileUrl, label }: FileUploaderProps) {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successUrl, setSuccessUrl] = useState<string | null>(currentFileUrl || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        setError(null);
        setSuccessUrl(null);

        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'];
        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        
        if (!['pdf', 'doc', 'docx', 'zip', 'rar'].includes(extension || '')) {
            setError(isRtl ? 'صيغة الملف غير مدعومة. (فقط PDF, DOC, DOCX, ZIP, RAR)' : 'Invalid file format. (Only PDF, DOC, DOCX, ZIP, RAR)');
            return;
        }

        if (selectedFile.size > 20 * 1024 * 1024) {
            setError(isRtl ? 'حجم الملف يجب ألا يتجاوز 20MB' : 'File size must not exceed 20MB');
            return;
        }

        setFile(selectedFile);
        await uploadFile(selectedFile);
    };

    const uploadFile = async (fileToUpload: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            
            setSuccessUrl(data.url);
            onUploadSuccess(data.url);
        } catch (err: any) {
            setError(err.message || 'Error uploading file');
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setSuccessUrl(null);
        setError(null);
        onUploadSuccess('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-bold text-foreground/80 mb-2">{label}</label>}
            
            {!successUrl && !uploading && (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                        dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 bg-foreground/5 hover:bg-foreground/10'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.zip,.rar"
                        onChange={handleChange}
                    />
                    <FiUploadCloud className="mx-auto text-4xl text-foreground/40 mb-3" />
                    <p className="text-sm font-bold text-foreground">
                        {isRtl ? 'اسحب الملف هنا أو انقر للاختيار' : 'Drag & Drop file here or click to browse'}
                    </p>
                    <p className="text-xs text-foreground/50 mt-2 font-medium">
                        {isRtl ? 'أقصى حجم: 20MB (PDF, DOC, DOCX, ZIP, RAR)' : 'Max size: 20MB (PDF, DOC, DOCX, ZIP, RAR)'}
                    </p>
                </div>
            )}

            {uploading && (
                <div className="border border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-foreground/5 space-y-3">
                    <FiLoader className="text-primary text-3xl animate-spin" />
                    <p className="text-sm font-bold text-foreground animate-pulse">
                        {isRtl ? 'جاري الرفع...' : 'Uploading...'}
                    </p>
                </div>
            )}

            {successUrl && !uploading && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <FiFile className="text-emerald-500" />
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-emerald-600 truncate">{file?.name || 'CV Uploaded'}</p>
                            <p className="text-xs text-emerald-500/80 flex items-center gap-1 mt-0.5">
                                <FiCheckCircle /> {isRtl ? 'تم الرفع بنجاح' : 'Uploaded successfully'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-emerald-500/20 rounded-full text-emerald-600 transition-colors shrink-0"
                    >
                        <FiX />
                    </button>
                </div>
            )}

            {error && (
                <p className="text-xs font-bold text-red-500 mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    {error}
                </p>
            )}
        </div>
    );
}
