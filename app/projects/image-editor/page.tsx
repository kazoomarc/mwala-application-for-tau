// start of ai gen code

"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Upload, Download, ImageIcon, RefreshCw } from "lucide-react";

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    grayscale: 0,
    sepia: 0,
    invert: 0,
    brightness: 100,
    contrast: 100,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        originalImageRef.current = img;
        setImage(event.target?.result as string);
        resetFilters();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Reset filters to default values
  const resetFilters = () => {
    setFilters({
      grayscale: 0,
      sepia: 0,
      invert: 0,
      brightness: 100,
      contrast: 100,
    });
  };

  // Apply filters to the image
  useEffect(() => {
    if (!image || !canvasRef.current || !originalImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsProcessing(true);

    const img = originalImageRef.current;

    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Reset filter to not affect other canvas operations
    ctx.filter = "none";

    setIsProcessing(false);
  }, [image, filters]);

  // Download the edited image
  const downloadImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-[68px]">
      <div>
        <h2 className="font-semibold text-slate-800 text-2xl md:text-4xl">
          Image Editor
        </h2>
      </div>
      <div
        className="bg-slate-50 border border-slate-400 rounded-sm mt-6"
        style={{
          backgroundImage: `radial-gradient(circle, rgb(254, 226, 226) 4px, transparent 4px)`,
          backgroundSize: `12px 12px`,
        }}
      >
        <div className="bg-slate-50 border border-slate-400 m-4 md:m-[40px] rounded-sm min-h-[600px] p-6 flex flex-col">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Image Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md p-4 min-h-[300px] relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-10">
                  <RefreshCw className="animate-spin text-red-400" size={32} />
                </div>
              )}

              {!image ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <ImageIcon size={64} className="text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">No image selected</p>
                  <Button
                    onClick={triggerFileInput}
                    className="bg-red-400 hover:bg-red-500"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Controls Area */}
            <div className="w-full md:w-64 space-y-6">
              {image && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Grayscale</label>
                        <span className="text-xs text-slate-500">
                          {filters.grayscale}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.grayscale]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          setFilters({ ...filters, grayscale: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Sepia</label>
                        <span className="text-xs text-slate-500">
                          {filters.sepia}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.sepia]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          setFilters({ ...filters, sepia: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Invert</label>
                        <span className="text-xs text-slate-500">
                          {filters.invert}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.invert]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          setFilters({ ...filters, invert: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">
                          Brightness
                        </label>
                        <span className="text-xs text-slate-500">
                          {filters.brightness}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.brightness]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={(value) =>
                          setFilters({ ...filters, brightness: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Contrast</label>
                        <span className="text-xs text-slate-500">
                          {filters.contrast}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.contrast]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={(value) =>
                          setFilters({ ...filters, contrast: value[0] })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="w-full bg-red-400 hover:bg-red-500"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button
                      onClick={triggerFileInput}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Change Image
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xl md:text-[28px] font-medium mt-6">
          This browser-based image editor allows you to upload any image and
          apply various filters like grayscale, sepia, invert, brightness, and
          contrast adjustments. All processing happens directly in your browser
          using the HTML5 Canvas API - no server uploads required. Once you're
          satisfied with your edits, you can download the modified image to your
          device.
        </p>
      </div>
    </div>
  );
}

// end of ai gen code
