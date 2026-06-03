'use client';

import React, { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiLoader, FiAlertCircle, FiRefreshCw, FiDownload, FiEye } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { showToast } from '@/lib/toast';

interface FileUploaderProps {
    onUploadSuccess: (url: string) => void;
    currentFileUrl?: string;
    label?: string;
}

interface FileInfo {
    originalName: string;
    size: number;
    sizeFormatted: string;
    type: string;
    uploadedAt: string;
}

export default function FileUploader({ onUploadSuccess, currentFileUrl, label }: FileUploaderProps) {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [successUrl, setSuccessUrl] = useState<string | null>(currentFileUrl || null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);
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

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFile = async (selectedFile: File) => {
        setError(null);
        setSuccessUrl(null);
        setFileInfo(null);
        setLastFailedFile(null);

        const extension = selectedFile.name.split('.').pop()?.toLowerCase();

        // Block dangerous files
        const blocked = ['exe', 'bat', 'cmd', 'apk', 'js', 'vbs', 'ps1', 'sh', 'msi', 'dll'];
        if (blocked.includes(extension || '')) {
            const msg = isRtl ? `صيغة .${extension} محظورة لأسباب أمنية` : `File type .${extension} is blocked for security reasons`;
            setError(msg);
            showToast(msg, 'error');
            return;
        }

        if (!['pdf', 'doc', 'docx', 'zip', 'rar'].includes(extension || '')) {
            const msg = isRtl ? 'صيغة الملف غير مدعومة. (فقط PDF, DOC, DOCX, ZIP, RAR)' : 'Invalid file format. Only PDF, DOC, DOCX, ZIP, and RAR are allowed.';
            setError(msg);
            showToast(msg, 'error');
            return;
        }

        if (selectedFile.size > 20 * 1024 * 1024) {
            const msg = isRtl ? `حجم الملف (${formatSize(selectedFile.size)}) يتجاوز الحد الأقصى 20MB` : `File size (${formatSize(selectedFile.size)}) exceeds the 20MB limit`;
            setError(msg);
            showToast(msg, 'error');
            return;
        }

        if (selectedFile.size === 0) {
            const msg = isRtl ? 'الملف فارغ' : 'File is empty';
            setError(msg);
            showToast(msg, 'error');
            return;
        }

        setFile(selectedFile);
        await uploadFile(selectedFile);
    };

    const uploadFile = async (fileToUpload: File) => {
        setUploading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            // Use XMLHttpRequest for progress tracking
            const result = await new Promise<{ url: string; fileInfo: FileInfo }>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const pct = Math.round((event.loaded / event.total) * 100);
                        setProgress(pct);
                    }
                });

                xhr.addEventListener('load', () => {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(data);
                        } else {
                            reject(new Error(data.error || `Upload failed (${xhr.status})`));
                        }
                    } catch {
                        reject(new Error('Invalid server response'));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error(isRtl ? 'فشل الاتصال بالسيرفر' : 'Network error. Please check your connection.'));
                });

                xhr.addEventListener('timeout', () => {
                    reject(new Error(isRtl ? 'انتهت مهلة الرفع' : 'Upload timed out. Please try again.'));
                });

                xhr.timeout = 120000; // 2 minutes
                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });

            setSuccessUrl(result.url);
            setFileInfo(result.fileInfo || null);
            onUploadSuccess(result.url);
            setLastFailedFile(null);

            const msg = isRtl ? 'تم رفع الملف بنجاح ✓' : 'File uploaded successfully ✓';
            showToast(msg, 'success');

        } catch (err: any) {
            console.error('Upload error:', err);
            const msg = err.message || (isRtl ? 'حدث خطأ أثناء رفع الملف' : 'Error uploading file');
            setError(msg);
            setFile(null);
            setLastFailedFile(fileToUpload);
            showToast(msg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRetry = useCallback(() => {
        if (lastFailedFile) {
            setError(null);
            setFile(lastFailedFile);
            uploadFile(lastFailedFile);
        }
    }, [lastFailedFile]);

    const removeFile = () => {
        setFile(null);
        setSuccessUrl(null);
        setError(null);
        setFileInfo(null);
        setLastFailedFile(null);
        onUploadSuccess('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const getFileIcon = (name: string) => {
        const ext = name?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📄';
        if (ext === 'doc' || ext === 'docx') return '📝';
        if (ext === 'zip' || ext === 'rar') return '📦';
        return '📎';
    };

    return (
        <div className="w-full">
            {label && <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">{label}</label>}

            {/* Drop Zone */}
            {!successUrl && !uploading && (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
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

            {/* Upload Progress */}
            {uploading && (
                <div className="border border-primary/30 bg-primary/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <FiLoader className="text-primary text-lg animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                                {file?.name || (isRtl ? 'جاري الرفع...' : 'Uploading...')}
                            </p>
                            <p className="text-xs text-foreground/50 font-medium">
                                {file ? formatSize(file.size) : ''} • {progress}%
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-foreground/10 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Success State */}
            {successUrl && !uploading && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-lg">
                                {getFileIcon(file?.name || successUrl)}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-bold text-emerald-600 truncate">{file?.name || (isRtl ? 'تم رفع الملف' : 'File Uploaded')}</p>
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

                    {/* File Info */}
                    {fileInfo && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20">
                            <div className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">
                                {isRtl ? 'النوع' : 'Type'}: <span className="text-emerald-500">{fileInfo.type}</span>
                            </div>
                            <div className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">
                                {isRtl ? 'الحجم' : 'Size'}: <span className="text-emerald-500">{fileInfo.sizeFormatted}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                        <a
                            href={successUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                        >
                            <FiEye /> {isRtl ? 'عرض' : 'View'}
                        </a>
                        <a
                            href={successUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                        >
                            <FiDownload /> {isRtl ? 'تحميل' : 'Download'}
                        </a>
                    </div>
                </div>
            )}

            {/* Error State with Retry */}
            {error && (
                <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-2">
                    <div className="flex items-start gap-2">
                        <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs font-bold text-red-500 flex-1">{error}</p>
                    </div>
                    {lastFailedFile && (
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10 border border-red-500/20"
                        >
                            <FiRefreshCw /> {isRtl ? 'إعادة المحاولة' : 'Retry Upload'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
