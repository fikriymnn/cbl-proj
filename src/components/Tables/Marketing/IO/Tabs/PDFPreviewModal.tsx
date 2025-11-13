// components/mounting-tabs/PDFPreviewModal.tsx
import React, { useRef, useState } from 'react';
import { MountingFormData } from '../Mounting';

interface PDFPreviewModalProps {
  showPdfPreview: boolean;
  setShowPdfPreview: (show: boolean) => void;
  pdfPages: string[];
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  handleFileUpload: (file: File) => Promise<string>;
  handleInputChange: (field: keyof MountingFormData, value: any) => void;
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
          const scaleX = img.naturalWidth / imageRect.width;
          const scaleY = img.naturalHeight / imageRect.height;

          // If no crop area selected, use full image
          let crop = {
            x: 0,
            y: 0,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };

          if (cropArea.width > 0 && cropArea.height > 0) {
            crop = {
              x: Math.max(0, cropArea.x * scaleX),
              y: Math.max(0, cropArea.y * scaleY),
              width: Math.min(
                cropArea.width * scaleX,
                img.naturalWidth - cropArea.x * scaleX,
              ),
              height: Math.min(
                cropArea.height * scaleY,
                img.naturalHeight - cropArea.y * scaleY,
              ),
            };
          }

          canvas.width = crop.width;
          canvas.height = crop.height;

          // Draw cropped portion
          ctx.drawImage(
            img,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height,
          );

          // Convert to blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                console.error('Failed to create image blob');
                setUploading(false);
                return;
              }

              try {
                const file = new File([blob], `mounting-${Date.now()}.png`, {
                  type: 'image/png',
                });

                // Upload the file
                const fileName = await handleFileUpload(file);
                const preview = canvas.toDataURL();

                // Update form data and UI
                handleInputChange('lampiran', fileName);
                setFilePreview(preview);
                setSelectedFile(file);

                // Close modal and reset states
                setShowPdfPreview(false);
                setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                setShowCropTool(false);
              } catch (uploadError) {
                console.error('Error uploading cropped image:', uploadError);
                alert('Failed to upload cropped image. Please try again.');
              } finally {
                setUploading(false);
              }
            },
            'image/png',
            0.9,
          );
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
              type="button"
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
                type="button"
                onClick={() => setCropArea({ x: 0, y: 0, width: 0, height: 0 })}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
              >
                Clear Selection
              </button>
            )}
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
                  onClick={() => {
                    setSelectedPage(page);
                    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                  }}
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
                    }}
                  />

                  {/* Crop overlay */}
                  {showCropTool &&
                    cropArea.width > 0 &&
                    cropArea.height > 0 && (
                      <>
                        {/* Selection border */}
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
                          style={{
                            left: cropArea.x,
                            top: cropArea.y,
                            width: cropArea.width,
                            height: cropArea.height,
                          }}
                        >
                          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-1 text-xs rounded">
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
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
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
