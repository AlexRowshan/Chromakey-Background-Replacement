import { ProcessResponse, ErrorResponse, ChromakeyConfig } from '../types/index';

/**
 * Service for handling chromakey-related API calls
 */
export class ChromakeyService {
  private baseUrl: string = '/api';

  /**
   * Process images using the chromakey algorithm
   * @param foregroundImage Foreground image with green background
   * @param backgroundImage Background image to replace the green screen
   * @param threshold Color distance threshold for determining background pixels
   * @returns Promise with the processed images as base64 strings
   */
  public async processImages(
    foregroundImage: File,
    backgroundImage: File,
    threshold: number
  ): Promise<ProcessResponse> {
    console.log('Preparing to process images');
    console.log('Foreground image:', foregroundImage.name, foregroundImage.size, 'bytes');
    console.log('Background image:', backgroundImage.name, backgroundImage.size, 'bytes');
    console.log('Threshold:', threshold);
    
    const formData = new FormData();
    formData.append('foreground', foregroundImage);
    formData.append('background', backgroundImage);
    formData.append('threshold', threshold.toString());

    try {
      console.log('Sending request to server...');
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Server response not OK:', response.status, response.statusText);
        let errorMessage = 'Failed to process images';
        try {
          const errorData: ErrorResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response', e);
        }
        throw new Error(errorMessage);
      }

      console.log('Parsing response...');
      const data = await response.json() as ProcessResponse;
      console.log('Received processed images - output1 size:', data.output1.length, 'chars');
      console.log('Received processed images - output2 size:', data.output2.length, 'chars');
      return data;
    } catch (error) {
      console.error('Error processing images:', error);
      throw error;
    }
  }

  /**
   * Validate that the uploaded file is a BMP image
   * @param file File to validate
   * @returns True if file is valid, false otherwise
   */
  public validateBmpFile(file: File): boolean {
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.bmp')) {
      return false;
    }

    // Check file type
    if (file.type !== 'image/bmp') {
      return false;
    }

    return true;
  }

  /**
   * Converts a base64 encoded image to a Blob object
   * @param base64Data Base64 encoded image data
   * @param contentType MIME type of the image
   * @returns Blob object representing the image
   */
  public base64ToBlob(base64Data: string, contentType: string = 'image/bmp'): Blob {
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }
}

// Export a singleton instance
export default new ChromakeyService(); 