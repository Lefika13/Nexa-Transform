import React, { useRef, useState, useEffect } from 'react';

export const SignaturePad = ({ onSave, initialDataUrl = null, title = "Digital Signature Pad", width = 450, height = 160 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!initialDataUrl);
  const [savedUrl, setSavedUrl] = useState(initialDataUrl);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set high resolution for retina screens
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = initialDataUrl;
    }
  }, [width, height, initialDataUrl]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSavedUrl(dataUrl);
      if (onSave) onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedUrl(null);
    if (onSave) onSave(null);
  };

  return (
    <div style={{
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '0.85rem',
      background: '#ffffff',
      display: 'inline-block',
      maxWidth: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ✍️ {title}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.7rem',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div style={{
        position: 'relative',
        background: '#f8fafc',
        border: '1px dashed #94a3b8',
        borderRadius: '6px',
        overflow: 'hidden',
        touchAction: 'none'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ display: 'block', cursor: 'crosshair', maxWidth: '100%' }}
        />
        {!hasDrawn && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Sign with touch screen or mouse pointer here
          </div>
        )}
      </div>
      {savedUrl && (
        <div style={{ marginTop: '0.35rem', fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>✓ Digital Signature Captured &amp; Verified</span>
        </div>
      )}
    </div>
  );
};
