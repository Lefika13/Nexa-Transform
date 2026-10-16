import JSZip from 'jszip';

/* ── 1. Batch ZIP Generator for Offline Access ── */
export async function downloadAllModuleMaterialsAsZip({
  courseCode,
  courseTitle = 'Course',
  resources = [],
  onProgress = () => {}
}) {
  if (!resources || resources.length === 0) {
    throw new Error('No study materials available to download for this course.');
  }

  const zip = new JSZip();
  const folderName = `${courseCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_Study_Pack`;
  const folder = zip.folder(folderName);

  let processed = 0;
  let fileCount = 0;

  // Include a Curriculum Index Readme
  const readmeContent = [
    `# Nexa Transform LMIS – Study Pack Archive`,
    `Course: ${courseCode} · ${courseTitle}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Total Resources: ${resources.length}`,
    ``,
    `## Table of Contents:`,
    ...resources.map((r, i) => `${i + 1}. [${r.type}] ${r.title}${r.unit_or_week ? ` (${r.unit_or_week})` : ''} – ${r.description || 'No description'}`),
    ``,
    `All study materials are copyrighted by NexaTransform Hub (Pty) Ltd.`
  ].join('\n');

  folder.file('00_Curriculum_Index.txt', readmeContent);

  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const unitPrefix = r.unit_or_week ? `${r.unit_or_week.replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const safeTitle = (r.title || `Resource_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');

    // Case A: Has attachments array
    if (r.attachments && r.attachments.length > 0) {
      for (let j = 0; j < r.attachments.length; j++) {
        const att = r.attachments[j];
        const url = (att.data_url && att.data_url.startsWith('data:'))
          ? att.data_url
          : (att.public_url && !att.public_url.includes('supabase.co/storage/v1/object/public/lecturer-documents') ? att.public_url : (att.data_url || ''));
        if (url) {
          try {
            onProgress(`Downloading ${att.name || safeTitle}... (${i + 1}/${resources.length})`);
            const blob = await fetchFileAsBlob(url);
            if (blob) {
              const fileName = `${unitPrefix}${safeTitle}_${att.name || `file_${j + 1}`}`;
              folder.file(fileName, blob);
              fileCount++;
            }
          } catch (e) {
            console.warn(`Failed to package ${att.name}:`, e);
          }
        }
      }
    } else if (r.file_url && r.file_url !== '#' && !r.file_url.includes('youtube') && !r.file_url.includes('vimeo')) {
      // Case B: Direct file_url
      const effectiveUrl = (r.file_url.startsWith('data:') || !r.file_url.includes('supabase.co/storage/v1/object/public/lecturer-documents'))
        ? r.file_url
        : (r.attachments?.[0]?.data_url || null);
      if (effectiveUrl) {
        try {
          onProgress(`Downloading ${safeTitle}... (${i + 1}/${resources.length})`);
          const blob = await fetchFileAsBlob(effectiveUrl);
          if (blob) {
            const ext = r.type === 'Presentation' ? 'pptx' : r.type === 'Video' ? 'mp4' : 'pdf';
            const fileName = `${unitPrefix}${safeTitle}.${ext}`;
            folder.file(fileName, blob);
            fileCount++;
          }
        } catch (e) {
          console.warn(`Failed to package ${r.title}:`, e);
        }
      }
    } else if (r.file_url && (r.file_url.includes('youtube') || r.file_url.includes('vimeo'))) {
      // Case C: Web stream link – save as internet shortcut / bookmark file
      const linkFileContent = `[InternetShortcut]\nURL=${r.file_url}\n`;
      folder.file(`${unitPrefix}${safeTitle}_Video_Stream.url`, linkFileContent);
      fileCount++;
    }

    processed++;
    onProgress(`Packaging archive: ${Math.round((processed / resources.length) * 90)}%`);
  }

  if (fileCount === 0) {
    throw new Error('No downloadable file contents could be retrieved for this study pack.');
  }

  onProgress('Compressing study pack ZIP archive...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  onProgress('Complete');
  return { success: true, fileCount };
}

async function fetchFileAsBlob(url) {
  // If data URL:
  if (url.startsWith('data:')) {
    const res = await fetch(url);
    return await res.blob();
  }

  // If HTTP/HTTPS URL:
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  } catch (err) {
    // If CORS restricted, return null gracefully
    return null;
  }
}


/* ── 2. Readership & Engagement Activity Tracker ── */
const ACTIVITY_STORAGE_KEY = 'nexa_lmis_resource_activity';

export function recordResourceActivity({
  resourceId,
  resourceTitle,
  courseCode,
  learnerEmail,
  learnerName,
  action // 'VIEW' | 'DOWNLOAD' | 'COMPLETE'
}) {
  if (!resourceId || !learnerEmail) return;

  try {
    const current = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '[]');
    const newEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      resource_id: String(resourceId),
      resource_title: resourceTitle,
      course_code: courseCode,
      learner_email: learnerEmail.toLowerCase().trim(),
      learner_name: learnerName || learnerEmail,
      action,
      timestamp: new Date().toISOString()
    };

    current.push(newEntry);
    // Keep last 1000 activity events
    const trimmed = current.slice(-1000);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed));
    return newEntry;
  } catch (e) {
    console.warn('Failed to record resource activity:', e);
  }
}

export function getEngagementSummary(resourceId, enrolledLearners = []) {
  try {
    const activity = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '[]');
    const resIdStr = String(resourceId);

    const relevantActivity = activity.filter(a => String(a.resource_id) === resIdStr);

    const learnersMap = {};
    enrolledLearners.forEach(l => {
      const email = l.learner_email?.toLowerCase().trim();
      if (email) {
        learnersMap[email] = {
          learner_name: l.learner_name || email,
          learner_email: email,
          viewed: false,
          downloaded: false,
          completed: false,
          last_activity: null
        };
      }
    });

    relevantActivity.forEach(a => {
      const email = a.learner_email?.toLowerCase().trim();
      if (!learnersMap[email]) {
        learnersMap[email] = {
          learner_name: a.learner_name || email,
          learner_email: email,
          viewed: false,
          downloaded: false,
          completed: false,
          last_activity: null
        };
      }

      if (a.action === 'VIEW') learnersMap[email].viewed = true;
      if (a.action === 'DOWNLOAD') learnersMap[email].downloaded = true;
      if (a.action === 'COMPLETE') learnersMap[email].completed = true;
      learnersMap[email].last_activity = a.timestamp;
    });

    const learnersList = Object.values(learnersMap);
    const totalEnrolled = learnersList.length;
    const engagedCount = learnersList.filter(l => l.viewed || l.downloaded || l.completed).length;
    const completedCount = learnersList.filter(l => l.completed).length;
    const percentage = totalEnrolled > 0 ? Math.round((engagedCount / totalEnrolled) * 100) : 0;

    return {
      totalEnrolled,
      engagedCount,
      completedCount,
      percentage,
      learnersList
    };
  } catch (e) {
    return {
      totalEnrolled: enrolledLearners.length,
      engagedCount: 0,
      completedCount: 0,
      percentage: 0,
      learnersList: []
    };
  }
}


/* ── 3. Learner Completion State Manager ── */
export function getCompletedResources(learnerEmail) {
  if (!learnerEmail) return {};
  try {
    const key = `nexa_lmis_completed_resources_${learnerEmail.toLowerCase().trim()}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) {
    return {};
  }
}

export function toggleResourceCompletion(learnerEmail, resourceId) {
  if (!learnerEmail || !resourceId) return false;
  try {
    const key = `nexa_lmis_completed_resources_${learnerEmail.toLowerCase().trim()}`;
    const current = JSON.parse(localStorage.getItem(key) || '{}');
    const isCompleted = !current[resourceId];

    if (isCompleted) {
      current[resourceId] = { completed: true, timestamp: new Date().toISOString() };
    } else {
      delete current[resourceId];
    }

    localStorage.setItem(key, JSON.stringify(current));
    return isCompleted;
  } catch (e) {
    return false;
  }
}


/* ── 4. In-Portal Private Learner Study Notes ── */
export function getLearnerStudyNotes(learnerEmail, resourceId) {
  if (!learnerEmail || !resourceId) return '';
  try {
    const key = `nexa_lmis_notes_${learnerEmail.toLowerCase().trim()}_${resourceId}`;
    return localStorage.getItem(key) || '';
  } catch (e) {
    return '';
  }
}

export function saveLearnerStudyNotes(learnerEmail, resourceId, notes) {
  if (!learnerEmail || !resourceId) return;
  try {
    const key = `nexa_lmis_notes_${learnerEmail.toLowerCase().trim()}_${resourceId}`;
    localStorage.setItem(key, notes);
    return true;
  } catch (e) {
    return false;
  }
}

/* ── 5. Safe Resource URL & Download Handlers ── */
export function getValidResourceUrl(resource) {
  if (!resource) return { url: '', isDataUrl: false, isSupabaseBroken: false, fileName: '' };

  const firstAtt = resource.attachments?.[0];
  const dataUrl = (firstAtt?.data_url && firstAtt.data_url.startsWith('data:'))
    ? firstAtt.data_url
    : (resource.file_url?.startsWith('data:') ? resource.file_url : null);
  const publicUrl = firstAtt?.public_url || resource.file_url;
  const isSupabaseBroken = !dataUrl && typeof publicUrl === 'string' && publicUrl.includes('supabase.co/storage/v1/object/public/lecturer-documents');
  const fileName = firstAtt?.name || (resource.title ? `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}` : 'study-material');

  if (dataUrl) {
    return { url: dataUrl, isDataUrl: true, isSupabaseBroken: false, fileName, rawAtt: firstAtt };
  }

  return { url: publicUrl || '', isDataUrl: false, isSupabaseBroken, fileName, rawAtt: firstAtt };
}

export function safeDownloadResource(resource, fallbackTitle = 'study-material') {
  if (!resource) return false;

  const firstAtt = resource.attachments?.[0];
  const dataUrl = (firstAtt?.data_url && firstAtt.data_url.startsWith('data:'))
    ? firstAtt.data_url
    : (resource.file_url?.startsWith('data:') ? resource.file_url : null);
  const publicUrl = firstAtt?.public_url || resource.file_url;

  const isPpt = resource.type === 'Presentation' || resource.type === 'Slides' || firstAtt?.name?.endsWith('.pptx') || firstAtt?.name?.endsWith('.ppt') || (resource.file_url && resource.file_url.includes('.ppt'));
  const isVid = resource.type === 'Video' || firstAtt?.name?.endsWith('.mp4') || (resource.file_url && resource.file_url.includes('.mp4'));
  const ext = isPpt ? 'pptx' : isVid ? 'mp4' : 'pdf';

  let fileName = firstAtt?.name || `${(resource.title || fallbackTitle).replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
  if (!fileName.includes('.')) fileName += `.${ext}`;

  // If we have a data URL, convert base64 to Blob and trigger blob download
  // This bypasses browser data URL top-level navigation blocks and URI length errors!
  if (dataUrl) {
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

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 2000);
      return true;
    } catch (err) {
      console.warn('DataURL to Blob download failed, attempting standard link:', err);
    }
  }

  // If public URL exists and is not pointing to broken Supabase bucket
  if (publicUrl && !publicUrl.includes('supabase.co/storage/v1/object/public/lecturer-documents')) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = publicUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { document.body.removeChild(a); } catch (_) {}
    }, 2000);
    return true;
  }

  return false;
}

export function openResourceInNewTab(resource) {
  if (!resource) return false;
  const resInfo = getValidResourceUrl(resource);
  if (!resInfo.url) return false;

  // For data URLs, convert to an Object URL Blob so Chrome/Edge can render or download in new tab
  if (resInfo.isDataUrl) {
    try {
      const parts = resInfo.url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => {
        try { URL.revokeObjectURL(blobUrl); } catch (_) {}
      }, 60000);
      return true;
    } catch (e) {
      return safeDownloadResource(resource);
    }
  }

  // If valid public URL and not pointing to broken Supabase storage bucket
  if (!resInfo.isSupabaseBroken && resInfo.url) {
    window.open(resInfo.url, '_blank');
    return true;
  }

  // Fallback to downloading
  return safeDownloadResource(resource);
}
