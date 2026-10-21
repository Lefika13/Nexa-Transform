import React, { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

/* ─── File type map ─────────────────────────── */
const FILE_TYPES = {
  'application/pdf':                                                                    { label: 'PDF',  icon: '📄', cls: 'type-red'    },
  'application/vnd.ms-powerpoint':                                                      { label: 'PPT',  icon: '📊', cls: 'type-orange' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':          { label: 'PPTX', icon: '📊', cls: 'type-orange' },
  'application/msword':                                                                 { label: 'DOC',  icon: '📝', cls: 'type-blue'   },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':            { label: 'DOCX', icon: '📝', cls: 'type-blue'   },
  'application/vnd.ms-excel':                                                           { label: 'XLS',  icon: '📋', cls: 'type-green'  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':                 { label: 'XLSX', icon: '📋', cls: 'type-green'  },
  'video/mp4':                                                                          { label: 'MP4',  icon: '🎬', cls: 'type-purple' },
  'video/webm':                                                                         { label: 'WEBM', icon: '🎬', cls: 'type-purple' },
  'video/quicktime':                                                                    { label: 'MOV',  icon: '🎬', cls: 'type-purple' },
  'audio/mpeg':                                                                         { label: 'MP3',  icon: '🎵', cls: 'type-teal'   },
  'audio/wav':                                                                          { label: 'WAV',  icon: '🎵', cls: 'type-teal'   },
  'image/png':                                                                          { label: 'PNG',  icon: '🖼️', cls: 'type-green'  },
  'image/jpeg':                                                                         { label: 'JPG',  icon: '🖼️', cls: 'type-green'  },
  'image/gif':                                                                          { label: 'GIF',  icon: '🖼️', cls: 'type-green'  },
  'text/plain':                                                                         { label: 'TXT',  icon: '📃', cls: 'type-gray'   },
};

const getFileInfo = (type) => FILE_TYPES[type] || { label: 'FILE', icon: '📎', cls: 'type-navy' };
const fmtBytes = (b) => b < 1024 ? `${b}B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

/* Max size: 50MB for video and PowerPoint presentations */
const MAX_FILE_BYTES = 50 * 1024 * 1024;

/* Enterprise Security: Strict whitelist and blacklist for uploaded file assets */
const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'py', 'pl', 'jsp', 'asp', 'aspx', 'cgi',
  'com', 'vbs', 'scr', 'msi', 'bin', 'jar', 'apk', 'ps1', 'action', 'dll', 'reg', 'htm', 'html', 'js', 'mjs'
]);

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'rtf',
  'mp4', 'webm', 'mov', 'mp3', 'wav', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'zip'
]);

/* ─── Attachment Zone (upload + display) ────── */
export const FileAttachmentZone = ({
  attachments = [],
  onChange,
  onAttachmentsChange,
  label = 'Attachments',
  maxFiles = 5,
  readOnly = false,
  bucket = 'student-documents',
  filePathPrefix = 'general',
}) => {
  const triggerChange = (newAtts) => {
    if (typeof onChange === 'function') onChange(newAtts);
    if (typeof onAttachmentsChange === 'function') onAttachmentsChange(newAtts);
  };
  const effectiveBucket = (bucket === 'lecturer-documents') ? 'lecturer-documents' : 'student-documents';
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');


  const fileToDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (rawFiles) => {
    setErr('');
    const slots = maxFiles - attachments.length;
    if (slots <= 0) { setErr(`Maximum ${maxFiles} files allowed.`); return; }

    const incoming = Array.from(rawFiles).slice(0, slots);
    setUploading(true);
    const uploaded = [];

    for (let file of incoming) {
      if (file.size > MAX_FILE_BYTES) {
        setErr(`"${file.name}" is ${fmtBytes(file.size)} — exceeds the institutional ${fmtBytes(MAX_FILE_BYTES)} limit.`);
        continue;
      }

      const fileExt = (file.name.split('.').pop() || '').toLowerCase().trim();

      // Security Check: Block dangerous executables and verify against academic whitelist
      if (FORBIDDEN_EXTENSIONS.has(fileExt)) {
        setErr(`Security Policy: Executable, script, or binary files (.${fileExt}) are strictly blocked to safeguard institutional servers.`);
        continue;
      }

      if (!ALLOWED_EXTENSIONS.has(fileExt)) {
        setErr(`Unsupported Format: The file type (.${fileExt}) is not allowed. Please upload standard academic files (PDF, DOCX, PPTX, XLSX, MP4, or Images).`);
        continue;
      }

      // Format path: prefix/timestamp_sanitized_name (strips path traversals and special chars)
      const sanitizedBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32);
      const sanitizedName = `${sanitizedBase}.${fileExt}`;
      const path = `${filePathPrefix.replace(/[^a-zA-Z0-9/_-]/g, '')}/${Date.now()}_${sanitizedName}`;

      let storagePath = null;
      let publicUrl = null;
      let uploadSucceeded = false;

      try {
        const { data, error } = await supabase.storage
          .from(effectiveBucket)
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (!error && data) {
          storagePath = data.path;
          uploadSucceeded = true;
          // Attempt to get URL
          const { data: pubData } = supabase.storage
            .from(effectiveBucket)
            .getPublicUrl(data.path);
          if (pubData && pubData.publicUrl) {
            publicUrl = pubData.publicUrl;
          }
        }
      } catch (e) {
        // Fallback to dataUrl only if network/storage failed
      }

      // Enterprise Scalability: Only store base64 dataUrl if storage upload failed (offline fallback)
      // This prevents multi-megabyte base64 strings from bloating PostgreSQL database rows
      let dataUrlFallback = null;
      if (!uploadSucceeded) {
        dataUrlFallback = await fileToDataUrl(file);
      }

      uploaded.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        ...(dataUrlFallback ? { data_url: dataUrlFallback } : {}),
        storage_path: storagePath,
        public_url: publicUrl,
        bucket: effectiveBucket,
        uploaded_at: new Date().toISOString()
      });
    }

    setUploading(false);
    if (uploaded.length > 0) {
      triggerChange([...attachments, ...uploaded]);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const remove = async (id) => {
    const fileToRemove = attachments.find(a => a.id === id);
    if (fileToRemove && fileToRemove.storage_path) {
      const { error } = await supabase.storage
        .from(fileToRemove.bucket || bucket)
        .remove([fileToRemove.storage_path]);
      if (error) {
        console.warn('Could not delete file from Supabase storage bucket:', error.message);
      }
    }
    triggerChange(attachments.filter((a) => a.id !== id));
  };

  if (readOnly) {
    return attachments && attachments.length > 0
      ? <AttachmentList attachments={attachments} />
      : null;
  }

  return (
    <div className="lmis-attach-wrap">
      {label && <label className="lmis-label" style={{ marginBottom: '0.5rem', display: 'block' }}>{label}</label>}

      {/* Drop Zone */}
      <div
        className={`lmis-drop-zone${dragging ? ' dragging' : ''}${uploading ? ' uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); !uploading && setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        style={{ opacity: uploading ? 0.7 : 1, cursor: uploading ? 'wait' : 'pointer' }}
      >
        <div className="lmis-drop-icon">{uploading ? '⏳' : '📎'}</div>
        <p className="lmis-drop-label">
          {uploading ? (
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Uploading to database...</span>
          ) : (
            <>
              <span className="lmis-drop-cta">Click to browse</span> or drag &amp; drop files here
            </>
          )}
        </p>
        <p className="lmis-drop-hint">
          PDF · PPTX · DOCX · XLSX · MP4 · MP3 · Images &nbsp;·&nbsp; max 8 MB each &nbsp;·&nbsp; up to {maxFiles} files
        </p>
        <input
          ref={inputRef} type="file" multiple hidden disabled={uploading}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mp4,.webm,.mov,.mp3,.wav,.png,.jpg,.jpeg,.gif,.txt"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {err && (
        <div className="lmis-attach-err">
          ⚠ {err}
        </div>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <AttachmentList attachments={attachments} onRemove={remove} />
      )}
    </div>
  );
};

/* ─── Read-only Attachment List ─────────────── */
export const AttachmentList = ({ attachments = [], onRemove }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  const downloadDataUrlAsBlob = (dataUrl, fileName) => {
    try {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 2000);
    } catch (err) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleAction = async (e, f, actionType) => {
    e.preventDefault();
    e.stopPropagation();

    // If storage_path is missing or if we have embedded data_url
    if (!f.storage_path) {
      if (f.data_url) {
        if (actionType === 'preview') {
          window.open(f.data_url, '_blank');
        } else {
          downloadDataUrlAsBlob(f.data_url, f.name || 'document');
        }
      }
      return;
    }

    setDownloadingId(f.id);
    const activeBucket = (f.bucket === 'lecturer-documents') ? 'lecturer-documents' : (f.bucket || 'student-documents');
    
    // Enterprise Data Privacy: Request a 5-minute signed URL
    let targetUrl = null;
    try {
      if (f.storage_path) {
        const { data: signData, error: signErr } = await supabase.storage
          .from(activeBucket)
          .createSignedUrl(f.storage_path, 300);
        if (!signErr && signData?.signedUrl) {
          targetUrl = signData.signedUrl;
        }
      }
    } catch (_) {}

    // Fallback: if sign failed or public_url is broken Supabase bucket, prefer data_url
    const isBrokenBucket = typeof f.public_url === 'string' && f.public_url.includes('supabase.co/storage/v1/object/public/lecturer-documents');
    if (!targetUrl || isBrokenBucket) {
      if (f.data_url) {
        targetUrl = f.data_url;
      } else if (!targetUrl) {
        targetUrl = f.public_url || f.data_url;
      }
    }

    try {
      if (actionType === 'preview') {
        const isPpt = f.name?.endsWith('.ppt') || f.name?.endsWith('.pptx') || f.type?.includes('presentation') || f.type?.includes('powerpoint');
        if (targetUrl?.startsWith('data:')) {
          downloadDataUrlAsBlob(targetUrl, f.name || 'document');
        } else if (isPpt && targetUrl && !targetUrl.includes('supabase.co/storage/v1/object/public/lecturer-documents')) {
          window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(targetUrl)}`, '_blank');
        } else if (targetUrl && !targetUrl.includes('supabase.co/storage/v1/object/public/lecturer-documents')) {
          window.open(targetUrl, '_blank');
        } else if (f.data_url) {
          downloadDataUrlAsBlob(f.data_url, f.name || 'document');
        }
      } else {
        if (targetUrl?.startsWith('data:')) {
          downloadDataUrlAsBlob(targetUrl, f.name || 'download');
        } else if (targetUrl && !targetUrl.includes('supabase.co/storage/v1/object/public/lecturer-documents')) {
          const link = document.createElement('a');
          link.href = targetUrl;
          link.download = f.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (f.data_url) {
          downloadDataUrlAsBlob(f.data_url, f.name || 'download');
        }
      }
    } catch (err) {
      if (f.data_url) {
        downloadDataUrlAsBlob(f.data_url, f.name || 'download');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="lmis-attach-list">
      {attachments.map((f) => {
        const info = getFileInfo(f.type);
        const isDownloading = downloadingId === f.id;
        const isPreviewable = f.type?.startsWith('image/') || f.type === 'application/pdf' || f.type?.startsWith('video/') || f.name?.endsWith('.pdf') || f.name?.endsWith('.mp4') || f.name?.endsWith('.webm') || f.name?.endsWith('.ppt') || f.name?.endsWith('.pptx') || f.type?.includes('presentation');
        return (
          <div key={f.id} className="lmis-attach-item">
            <span className={`lmis-attach-badge ${info.cls}`}>{info.icon} {info.label}</span>
            <div className="lmis-attach-meta">
              <span className="lmis-attach-name" title={f.name}>{f.name}</span>
              <span className="lmis-attach-size">{fmtBytes(f.size)}</span>
            </div>
            <div className="lmis-attach-actions">
              <button
                type="button"
                className="lmis-attach-btn lmis-attach-dl"
                disabled={isDownloading}
                onClick={(e) => handleAction(e, f, 'download')}
                style={{ cursor: isDownloading ? 'wait' : 'pointer' }}
              >
                {isDownloading ? '⏳' : '↓'} Download
              </button>
              {isPreviewable && (
                <button
                  type="button"
                  className="lmis-attach-btn lmis-attach-preview"
                  disabled={isDownloading}
                  onClick={(e) => handleAction(e, f, 'preview')}
                >
                  {f.type?.startsWith('video/') || f.name?.endsWith('.mp4') ? '▶ Play' : '👁 Preview'}
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  className="lmis-attach-btn lmis-attach-rm"
                  onClick={() => onRemove(f.id)}
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
