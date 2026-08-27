import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, RotateCcw, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function PhotoOrientationModal({
  isOpen,
  onClose,
  imageFile,
  onProcessRotatedImage
}) {
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      setRotation(0);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  if (!isOpen || !imageFile) return null;

  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  const handleApplyRotation = async () => {
    if (rotation === 0) {
      onProcessRotatedImage(imageFile);
      onClose();
      return;
    }

    // Render rotated image to canvas and create new Blob/File
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = previewUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          const rotatedFile = new File([blob], imageFile.name || 'rotated_photo.png', {
            type: 'image/png'
          });
          onProcessRotatedImage(rotatedFile);
          onClose();
        }
      }, 'image/png');
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-indigo-deep">Adjust Photo Orientation</h3>
              <p className="text-xs text-indigo-muted">Rotate to upright orientation for high OCR accuracy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Container with CSS rotation */}
        <div className="flex-1 min-h-[240px] max-h-[360px] bg-cream-200/80 rounded-2xl border border-cream-300 flex items-center justify-center overflow-hidden p-4">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Orientation preview"
              className="max-h-full max-w-full object-contain transition-transform duration-300 rounded-lg shadow-sm"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={rotateLeft}
            className="px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 flex items-center gap-2 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rotate Left (90°)</span>
          </button>

          <button
            onClick={rotateRight}
            className="px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 flex items-center gap-2 transition-colors active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotate Right (90°)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-cream-300">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyRotation}
            className="px-6 py-2.5 rounded-xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Process OCR with this Orientation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
