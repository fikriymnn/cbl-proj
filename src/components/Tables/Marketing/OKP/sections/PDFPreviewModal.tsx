import React, { useRef, useState } from 'react';
import axios from 'axios';
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
  const [rotation, setRotation] = useState(0); // Add rotation state
  const imageRef = useRef<HTMLImageElement>(null);

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

  const handleCropEnd = () => {
    setIsDragging(false);
  };

  // Add rotation handler
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    // Clear crop area when rotating
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleCropAndSave = async () => {
    if (!selectedPage) return;

    try {
      setUploading(true);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          const imageElement = imageRef.current;
          if (!imageElement) {
            throw new Error('Image element not found');
          }

          const imageRect = imageElement.getBoundingClientRect();

          // Adjust for rotation when calculating scale
          let scaleX, scaleY;
          if (rotation === 90 || rotation === 270) {
            scaleX = img.naturalHeight / imageRect.width;
            scaleY = img.naturalWidth / imageRect.height;
          } else {
            scaleX = img.naturalWidth / imageRect.width;
            scaleY = img.naturalHeight / imageRect.height;
          }

          // Set canvas size based on rotation
          if (rotation === 90 || rotation === 270) {
            canvas.width = img.naturalHeight;
            canvas.height = img.naturalWidth;
          } else {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
          }

          // Apply rotation
          ctx.save();
          switch (rotation) {
            case 90:
              ctx.translate(canvas.width, 0);
              ctx.rotate((90 * Math.PI) / 180);
              break;
            case 180:
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate((180 * Math.PI) / 180);
              break;
            case 270:
              ctx.translate(0, canvas.height);
              ctx.rotate((270 * Math.PI) / 180);
              break;
          }

          // Draw the full rotated image first
          ctx.drawImage(img, 0, 0);
          ctx.restore();

          // If crop area is selected, crop the rotated image
          if (cropArea.width > 0 && cropArea.height > 0) {
            const croppedCanvas = document.createElement('canvas');
            const croppedCtx = croppedCanvas.getContext('2d');

            if (!croppedCtx) {
              throw new Error('Could not get cropped canvas context');
            }

            const crop = {
              x: Math.max(0, cropArea.x * scaleX),
              y: Math.max(0, cropArea.y * scaleY),
              width: Math.min(
                cropArea.width * scaleX,
                canvas.width - cropArea.x * scaleX,
              ),
              height: Math.min(
                cropArea.height * scaleY,
                canvas.height - cropArea.y * scaleY,
              ),
            };

            croppedCanvas.width = crop.width;
            croppedCanvas.height = crop.height;

            croppedCtx.drawImage(
              canvas,
              crop.x,
              crop.y,
              crop.width,
              crop.height,
              0,
              0,
              crop.width,
              crop.height,
            );

            // Use the cropped canvas for final output
            croppedCanvas.toBlob(
              async (blob) => {
                await uploadBlob(blob);
              },
              'image/png',
              0.9,
            );
          } else {
            // Use the full rotated canvas
            canvas.toBlob(
              async (blob) => {
                await uploadBlob(blob);
              },
              'image/png',
              0.9,
            );
          }

          async function uploadBlob(blob: Blob | null) {
            if (!blob) {
              console.error('Failed to create image blob');
              setUploading(false);
              return;
            }

            try {
              const file = new File([blob], `cropped-image-${Date.now()}.png`, {
                type: 'image/png',
              });

              // Upload the file
              const fileName = await handleFileUpload(file);
              const preview = URL.createObjectURL(blob);

              // Update form data and UI
              handleInputChange('file_spek_customer', fileName);
              setFilePreview(preview);
              setSelectedFile(file);

              // Close modal and reset states
              setShowPdfPreview(false);
              setCropArea({ x: 0, y: 0, width: 0, height: 0 });
              setShowCropTool(false);
              setRotation(0); // Reset rotation
            } catch (uploadError) {
              console.error('Error uploading cropped image:', uploadError);
              alert('Failed to upload cropped image. Please try again.');
            } finally {
              setUploading(false);
            }
          }
        } catch (canvasError) {
          console.error('Canvas processing error:', canvasError);
          alert('Error processing image. Please try again.');
          setUploading(false);
        }
      };

      img.onerror = () => {
        console.error('Error loading image');
        alert('Error loading image. Please try again.');
        setUploading(false);
      };

      img.src = selectedPage;
    } catch (error) {
      console.error('Error in handleCropAndSave:', error);
      alert('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowPdfPreview(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setShowCropTool(false);
    setRotation(0); // Reset rotation on cancel
  };

  // Reset rotation when changing pages
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

          {/* Main preview with crop area */}
          <div className="w-3/4 pl-4 flex-1 min-h-0 overflow-auto">
            {selectedPage && (
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
                    src={selectedPage}
                    alt="Selected page"
                    className="max-w-full h-auto border"
                    draggable={false}
                    style={{
                      userSelect: 'none',
                      maxHeight: '60vh',
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease',
                    }}
                  />

                  {/* Crop overlay */}
                  {showCropTool &&
                    cropArea.width > 0 &&
                    cropArea.height > 0 && (
                      <>
                        {/* Selection border */}
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
                      </>
                    )}
                </div>

                {showCropTool && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click and drag to select the area you want to crop
                  </p>
                )}
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
            disabled={!selectedPage || uploading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {uploading
              ? 'Uploading...'
              : cropArea.width > 0
              ? 'Save Cropped Area'
              : 'Save Full Page'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
