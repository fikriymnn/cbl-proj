import React, { useEffect, useRef, useState } from 'react';

// ─── Standalone QR Scan Page ──────────────────────────────────────────────────
// Route this as its own page (e.g. /print/qr-scan). Opens the camera, detects
// a QR code, then navigates the browser to whatever URL/value was encoded.
const PrintQRPhoto: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [status, setStatus] = useState<'starting' | 'scanning' | 'error'>(
    'starting',
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let BarcodeDetector: any = (window as any).BarcodeDetector;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStatus('scanning');
        }

        // Use BarcodeDetector API if available (Chrome/Edge)
        if (BarcodeDetector) {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          intervalRef.current = window.setInterval(async () => {
            if (!videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                handleDetected(codes[0].rawValue);
              }
            } catch {
              /* ignore frame errors */
            }
          }, 300);
        } else {
          setErrorMsg(
            'Browser Anda tidak mendukung BarcodeDetector API. Gunakan Chrome terbaru untuk scan otomatis, atau buka URL secara manual.',
          );
          setStatus('error');
        }
      } catch (err: any) {
        setErrorMsg(err?.message ?? 'Kamera tidak dapat diakses.');
        setStatus('error');
      }
    };

    start();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleDetected = (rawValue: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // Navigate this page straight to whatever the QR encoded
    window.location.href = rawValue;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Scan QR Label</p>
              <p className="text-xs text-gray-400">Arahkan kamera ke QR code</p>
            </div>
          </div>
        </div>

        {/* Camera view */}
        <div className="relative bg-black aspect-square">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          {/* Scanning overlay */}
          {status === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48">
                {/* Corner borders */}
                <div
                  className="absolute top-0 left-0 w-8 h-8 border-blue-400"
                  style={{ borderWidth: '3px 0 0 3px', borderStyle: 'solid' }}
                />
                <div
                  className="absolute top-0 right-0 w-8 h-8 border-blue-400"
                  style={{ borderWidth: '3px 3px 0 0', borderStyle: 'solid' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-8 h-8 border-blue-400"
                  style={{ borderWidth: '0 0 3px 3px', borderStyle: 'solid' }}
                />
                <div
                  className="absolute bottom-0 right-0 w-8 h-8 border-blue-400"
                  style={{ borderWidth: '0 3px 3px 0', borderStyle: 'solid' }}
                />
                {/* Scanning line animation */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-blue-400 opacity-80"
                  style={{ animation: 'scan 2s linear infinite' }}
                />
              </div>
            </div>
          )}

          {status === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                <p className="text-white text-sm">Membuka kamera...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4">
              <p className="text-white text-sm text-center leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-3">
          <p className="text-xs text-center text-gray-400">
            {status === 'scanning'
              ? 'Mendeteksi QR code secara otomatis...'
              : status === 'error'
              ? 'Terjadi masalah pada kamera'
              : 'Memulai kamera...'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PrintQRPhoto;
