// TypeScript declarations for the Chromakey project

// Image file with preview data
interface ImageFile {
  file: File;
  preview: string;
}

// Process API response format
interface ProcessResponse {
  output1: string; // Base64 encoded image data
  output2: string; // Base64 encoded image data
}

// Process API error response
interface ErrorResponse {
  error: string;
}

// Configuration for chromakey processing
interface ChromakeyConfig {
  threshold: number;
  method: 'method1' | 'method2' | 'both';
}

// Image dimensions
interface ImageDimensions {
  width: number;
  height: number;
}

// Pixel coordinates
interface Coordinate {
  x: number;
  y: number;
}

// RGB color
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// BMP image data format
interface BMPImageData {
  dimensions: ImageDimensions;
  data: Uint8Array;
}

export {
  ImageFile,
  ProcessResponse,
  ErrorResponse,
  ChromakeyConfig,
  ImageDimensions,
  Coordinate,
  RGBColor,
  BMPImageData
} 