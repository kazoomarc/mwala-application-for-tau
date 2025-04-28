// start of ai gen code

"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Copy, ImageIcon, Check } from "lucide-react";

export default function ColorGradient() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  // Show error message and clear it after 5 seconds
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      showError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setColors([]);
    };
    reader.readAsDataURL(file);
  };

  // Extract colors from image
  useEffect(() => {
    if (!image) return;

    const extractColors = async () => {
      setIsProcessing(true);

      try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          // Create a canvas to draw the image and extract pixel data
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Set canvas size to a reasonable size for processing
          // We downsample to improve performance
          const maxSize = 100;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          const width = Math.floor(img.width * scale);
          const height = Math.floor(img.height * scale);

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, width, height);
          const pixels = imageData.data;

          // Extract colors
          const extractedColors = extractSignificantColors(pixels, 8);
          setColors(extractedColors);
          setIsProcessing(false);
        };

        img.onerror = () => {
          showError("Failed to load image");
          setIsProcessing(false);
        };

        img.src = image;
      } catch (error) {
        console.error("Error extracting colors:", error);
        showError("Error extracting colors from image");
        setIsProcessing(false);
      }
    };

    extractColors();
  }, [image]);

  // Extract significant colors from pixel data
  const extractSignificantColors = (
    pixels: Uint8ClampedArray,
    numColors: number
  ): string[] => {
    // Step 1: Collect all colors
    const colorMap: Record<string, number> = {};

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Reduce color space to improve grouping (color quantization)
      // We divide by 16 to reduce from 256 values to 16 values per channel
      const quantizedR = Math.floor(r / 16) * 16;
      const quantizedG = Math.floor(g / 16) * 16;
      const quantizedB = Math.floor(b / 16) * 16;

      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

      if (colorMap[colorKey]) {
        colorMap[colorKey]++;
      } else {
        colorMap[colorKey] = 1;
      }
    }

    // Step 2: Sort colors by frequency
    const sortedColors = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);

    // Step 3: Take the most frequent colors
    const significantColors = sortedColors.slice(0, numColors);

    // Step 4: Convert back to hex format
    const hexColors = significantColors.map((color) => {
      const [r, g, b] = color.split(",").map(Number);
      return rgbToHex(r, g, b);
    });

    // Step 5: Sort colors for a pleasing gradient (by hue)
    return sortColorsByHue(hexColors);
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Sort colors by hue for a pleasing gradient
  const sortColorsByHue = (colors: string[]): string[] => {
    return [...colors].sort((a, b) => {
      const [hA] = hexToHSL(a);
      const [hB] = hexToHSL(b);
      return hA - hB;
    });
  };

  // Convert hex to HSL
  const hexToHSL = (hex: string): [number, number, number] => {
    // Convert hex to RGB
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h, s, l];
  };

  // Generate CSS gradient string
  const generateGradientCSS = (colors: string[]): string => {
    if (colors.length === 0) return "none";
    if (colors.length === 1) return colors[0];

    return `linear-gradient(to right, ${colors.join(", ")})`;
  };

  // Copy color to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color).then(
      () => {
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
      },
      () => {
        showError("Failed to copy color");
      }
    );
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-[68px]">
      <div>
        <h2 className="font-semibold text-slate-800 text-2xl md:text-4xl">
          Color Gradient Generator
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
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {errorMessage}
            </div>
          )}

          {/* Image Upload Area */}
          <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md p-4 min-h-[300px] relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
                </div>
              )}

              {!image ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <ImageIcon size={64} className="text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">
                    Upload an image to generate a color gradient
                  </p>
                  <Button
                    onClick={triggerFileInput}
                    className="bg-red-400 hover:bg-red-500"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center">
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Uploaded"
                    className="max-w-full max-h-[300px] object-contain mb-4"
                  />
                  <Button
                    onClick={triggerFileInput}
                    variant="outline"
                    className="mt-4"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Change Image
                  </Button>
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
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {/* Gradient Preview */}
          {colors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Generated Gradient</h3>
              <div
                ref={gradientRef}
                className="h-24 rounded-md w-full mb-4"
                style={{ background: generateGradientCSS(colors) }}
              ></div>

              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">CSS Code:</h4>
                <div className="bg-slate-100 p-3 rounded-md flex justify-between items-center">
                  <code className="text-sm overflow-x-auto whitespace-nowrap pr-4">
                    background: {generateGradientCSS(colors)};
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `background: ${generateGradientCSS(colors)};`
                      )
                    }
                  >
                    {copiedColor ===
                    `background: ${generateGradientCSS(colors)};` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Color Palette:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="h-16 w-full rounded-md mb-2 cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                      ></div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{color}</code>
                        <button
                          onClick={() => copyToClipboard(color)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          {copiedColor === color ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-xl md:text-[28px] font-medium mt-6">
          This color gradient generator analyzes your uploaded image to extract
          the most significant colors and creates a beautiful gradient from
          them. The algorithm identifies dominant colors, sorts them by hue for
          a pleasing transition, and provides copyable CSS code for use in your
          projects. All processing happens directly in your browser - no server
          uploads required.
        </p>
      </div>
    </div>
  );
}

// start of ai gen code
