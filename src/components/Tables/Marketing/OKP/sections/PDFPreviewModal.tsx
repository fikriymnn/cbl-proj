import React, { useRef, useState, useEffect } from 'react';
import { OKPFormData } from '../types';

interface PDFPreviewModalProps {
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
  pdfPages: string[];
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  handleFileUpload: (file: File) => Promise<string>;
  handleInputChange: (field: keyof OKPFormData, value: any) => void;
  setFilePreview: (preview: string) => void;
  setSelectedFile: (file: File | null) => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  showPdfPreview,
  setShowPdfPreview,
  pdfPages,
  selectedPage,
  setSelectedPage,
  uploading,
  setUploading,
  handleFileUpload,
  handleInputChange,
  setFilePreview,
  setSelectedFile,
}) => {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCropTool, setShowCropTool] = useState(false);
  const [rotation, setRotation] = useState(0);

  // rotatedDataUrl is the actual image we display — already baked with rotation via canvas.
  // This means crop coordinates map 1:1 to image pixels (after scaling), no transform math needed.
  const [rotatedDataUrl, setRotatedDataUrl] = useState<string>('');

  const imageRef = useRef<HTMLImageElement>(null);

  // ─── Rebuild rotatedDataUrl whenever selectedPage or rotation changes ────────
  useEffect(() => {
    if (!selectedPage) {
      setRotatedDataUrl('');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // For 90/270 rotation swap width and height
      if (rotation === 90 || rotation === 270) {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.save();
      switch (rotation) {
        case 90:
          ctx.translate(canvas.width, 0);
          ctx.rotate((90 * Math.PI) / 180);
          break;
        case 180:
          ctx.translate(canvas.width, canvas.height);
          ctx.rotate(Math.PI);
          break;
        case 270:
          ctx.translate(0, canvas.height);
          ctx.rotate((270 * Math.PI) / 180);
          break;
        // 0 degrees: no transform needed
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      setRotatedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = selectedPage;
  }, [selectedPage, rotation]);

  // ─── Crop mouse handlers ─────────────────────────────────────────────────────
  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showCropTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !showCropTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y),
    });
  };

  const handleCropEnd = () => setIsDragging(false);

  // ─── Rotate: increment angle, useEffect above rebuilds the preview image ─────
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  // ─── Save cropped or full image ──────────────────────────────────────────────
  const handleCropAndSave = async () => {
    if (!rotatedDataUrl) return;

    try {
      setUploading(true);

      const img = new Image();

      img.onload = async () => {
        const imageElement = imageRef.current;
        if (!imageElement) {
          setUploading(false);
          return;
        }

        // Scale: screen pixels → actual image pixels
        const rect = imageElement.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        const outCanvas = document.createElement('canvas');
        const outCtx = outCanvas.getContext('2d')!;

        if (cropArea.width > 10 && cropArea.height > 10) {
          // Crop selected — map screen crop rect → image pixels
          const sx = Math.max(0, cropArea.x * scaleX);
          const sy = Math.max(0, cropArea.y * scaleY);
          const sw = Math.min(cropArea.width * scaleX, img.naturalWidth - sx);
          const sh = Math.min(cropArea.height * scaleY, img.naturalHeight - sy);

          outCanvas.width = sw;
          outCanvas.height = sh;
          outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        } else {
          // No crop — save the full rotated image
          outCanvas.width = img.naturalWidth;
          outCanvas.height = img.naturalHeight;
          outCtx.drawImage(img, 0, 0);
        }

        outCanvas.toBlob(
          async (blob) => {
            if (!blob) {
              alert('Failed to create image blob');
              setUploading(false);
              return;
            }
            try {
              const file = new File([blob], `cropped-image-${Date.now()}.png`, {
                type: 'image/png',
              });
              const fileName = await handleFileUpload(file);
              const preview = URL.createObjectURL(blob);

              handleInputChange('file_spek_customer', fileName);
              setFilePreview(preview);
              setSelectedFile(file);

              // Close and reset
              setShowPdfPreview(false);
              setCropArea({ x: 0, y: 0, width: 0, height: 0 });
              setShowCropTool(false);
              setRotation(0);
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError);
              alert('Failed to upload image. Please try again.');
            } finally {
              setUploading(false);
            }
          },
          'image/png',
          0.9,
        );
      };

      img.onerror = () => {
        alert('Error loading image. Please try again.');
        setUploading(false);
      };

      // Load the already-rotated data URL — crop math is straightforward from here
      img.src = rotatedDataUrl;
    } catch (error) {
      console.error('Error in handleCropAndSave:', error);
      alert('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };

  // ─── Cancel ──────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setShowPdfPreview(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setShowCropTool(false);
    setRotation(0);
  };

  const handlePageSelect = (page: string) => {
    setSelectedPage(page);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setRotation(0);
  };

  if (!showPdfPreview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">Select and Crop PDF Page</h3>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowCropTool(!showCropTool)}
              className={`px-3 py-1 rounded text-sm ${
                showCropTool
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {showCropTool ? 'Disable Crop' : 'Enable Crop'}
            </button>

            {showCropTool && (
              <button
                onClick={() => setCropArea({ x: 0, y: 0, width: 0, height: 0 })}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
              >
                Clear Selection
              </button>
            )}

            <button
              onClick={handleRotate}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Rotate ({rotation}°)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-1 min-h-0">
          {/* Page thumbnails */}
          <div className="w-1/4 pr-4 border-r flex-shrink-0">
            <h4 className="font-semibold mb-2">Pages ({pdfPages.length})</h4>
            <div className="space-y-2 max-h-full overflow-y-auto">
              {pdfPages.map((page, index) => (
                <div
                  key={index}
                  className={`cursor-pointer border-2 rounded p-2 transition-colors ${
                    selectedPage === page
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handlePageSelect(page)}
                >
                  <img
                    src={page}
                    alt={`Page ${index + 1}`}
                    className="w-full h-20 object-contain"
                  />
                  <p className="text-center text-xs mt-1">Page {index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main preview — displays rotatedDataUrl, no CSS transform */}
          <div className="w-3/4 pl-4 flex-1 min-h-0 overflow-auto">
            {rotatedDataUrl ? (
              <div className="relative inline-block max-w-full">
                <div
                  className="relative"
                  onMouseDown={handleCropStart}
                  onMouseMove={handleCropMove}
                  onMouseUp={handleCropEnd}
                  onMouseLeave={handleCropEnd}
                  style={{ cursor: showCropTool ? 'crosshair' : 'default' }}
                >
                  <img
                    ref={imageRef}
                    src={rotatedDataUrl}
                    alt="Selected page"
                    className="max-w-full h-auto border"
                    draggable={false}
                    style={{
                      userSelect: 'none',
                      maxHeight: '60vh',
                      // No CSS transform — rotation is baked into rotatedDataUrl
                    }}
                  />

                  {/* Crop selection overlay */}
                  {showCropTool &&
                    cropArea.width > 0 &&
                    cropArea.height > 0 && (
                      <div
                        className="absolute border-2 border-red-500 bg-red-500 bg-opacity-10 pointer-events-none"
                        style={{
                          left: cropArea.x,
                          top: cropArea.y,
                          width: cropArea.width,
                          height: cropArea.height,
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-red-500 text-white px-1 text-xs rounded">
                          {Math.round(cropArea.width)} ×{' '}
                          {Math.round(cropArea.height)}
                        </div>
                      </div>
                    )}
                </div>

                {showCropTool && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click and drag to select the area you want to crop
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading preview...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-4 flex-shrink-0">
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCropAndSave}
            disabled={!rotatedDataUrl || uploading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {uploading
              ? 'Uploading...'
              : cropArea.width > 10
              ? 'Save Cropped Area'
              : 'Save Full Page'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
