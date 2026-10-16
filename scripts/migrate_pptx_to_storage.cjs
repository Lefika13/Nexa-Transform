const supabaseUrl = 'https://bwygpjlzoefhfixtyxdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eWdwamx6b2VmaGZpeHR5eGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTA2ODAsImV4cCI6MjA5OTA4NjY4MH0.4IbM23kSH2ohMKWAU_7-1PRQdnfcUlH-XrlpyEv9YWU';

async function migrate() {
  console.log('--- Migrating base64 study materials to Supabase Storage ---');

  const res = await fetch(`${supabaseUrl}/rest/v1/library_resources?select=*`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const data = await res.json();
  console.log(`Found ${data.length} total resources in library_resources table.`);

  for (const item of data) {
    const match = item.description && item.description.match(/<!--nexa_meta:([\s\S]*?)-->/);
    if (!match) {
      console.log(`Resource [${item.id}] "${item.title}" has no embedded meta. Skipping.`);
      continue;
    }
    const meta = JSON.parse(match[1]);
    const att = meta.attachments?.[0];
    if (!att || !att.data_url) {
      console.log(`Resource [${item.id}] "${item.title}" has no base64 data_url. Skipping.`);
      continue;
    }

    console.log(`Processing "${item.title}" (${item.id})...`);
    const parts = att.data_url.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    const buffer = Buffer.from(parts[1], 'base64');
    console.log(`Decoded file size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    const storagePath = att.storage_path || `study-materials/${Date.now()}_${(att.name || 'presentation.pptx').replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Upload binary buffer directly to Supabase Storage bucket 'lecturer-documents'
    console.log(`Uploading to storage at "lecturer-documents/${storagePath}"...`);
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/lecturer-documents/${storagePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mime,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`Upload failed for ${item.title}:`, uploadRes.status, errText);
      continue;
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/lecturer-documents/${storagePath}`;
    console.log(`Uploaded successfully! Public URL: ${publicUrl}`);

    // Verify public URL is reachable
    const verifyRes = await fetch(publicUrl, { method: 'HEAD' });
    console.log(`Verified public URL HTTP status: ${verifyRes.status}`);

    // Create slim attachment object without the 2.8 MB base64 data_url!
    const slimAtt = {
      id: att.id || `${Date.now()}`,
      name: att.name,
      type: att.type,
      size: buffer.length,
      storage_path: storagePath,
      public_url: publicUrl,
      bucket: 'lecturer-documents',
      uploaded_at: att.uploaded_at || new Date().toISOString()
    };

    const slimMeta = {
      ...meta,
      attachments: [slimAtt]
    };

    const cleanDesc = item.description.replace(/\n?<!--nexa_meta:[\s\S]*?-->/g, '').trim();
    const newDescription = `${cleanDesc}\n<!--nexa_meta:${JSON.stringify(slimMeta)}-->`;

    // Update the database row in Supabase:
    // 1. file_url points to the public storage URL
    // 2. description contains only metadata (no multi-megabyte base64 strings!)
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/library_resources?id=eq.${item.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        file_url: publicUrl,
        description: newDescription,
        course_code: item.course_code || 'OD'
      })
    });

    console.log(`Updated database row for "${item.title}": HTTP ${patchRes.status}`);
  }

  console.log('--- Migration Completed Successfully ---');
}

migrate();
