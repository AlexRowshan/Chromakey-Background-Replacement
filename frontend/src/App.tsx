import React, { useState, useRef, ChangeEvent } from 'react';
import './App.css';
import chromakeyService from './services/chromakeyService';
import { ImageFile } from './types/index';

const App: React.FC = () => {
  const [foregroundImage, setForegroundImage] = useState<ImageFile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
  const [resultImage1, setResultImage1] = useState<string | null>(null);
  const [resultImage2, setResultImage2] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(40.5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const foregroundInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleForegroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!chromakeyService.validateBmpFile(file)) {
        setError('Please upload a valid BMP image file.');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setForegroundImage({
          file,
          preview: reader.result as string
        });
        setError(null);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!chromakeyService.validateBmpFile(file)) {
        setError('Please upload a valid BMP image file.');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setBackgroundImage({
          file,
          preview: reader.result as string
        });
        setError(null);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setThreshold(parseFloat(e.target.value));
  };

  const handleProcess = async () => {
    if (!foregroundImage || !backgroundImage) {
      setError('Please upload both foreground and background images.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await chromakeyService.processImages(
        foregroundImage.file,
        backgroundImage.file,
        threshold
      );
      
      setResultImage1(result.output1);
      setResultImage2(result.output2);
    } catch (err) {
      setError('An error occurred while processing the images.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Chromakey Background Replacement</h1>
        <p className="subheader">Upload your green screen image and a background to replace it with</p>
      </header>

      <div className="upload-container">
        <h2>Upload Images</h2>
        <div className="upload-area">
          <div 
            className="upload-box"
            onClick={() => foregroundInputRef.current?.click()}
          >
            {foregroundImage ? (
              <img 
                src={foregroundImage.preview} 
                alt="Foreground preview" 
                style={{ maxHeight: '160px', maxWidth: '100%' }} 
              />
            ) : (
              <>
                <h3>Foreground Image</h3>
                <p>Click to upload image with green background</p>
                <p><small>(BMP format only)</small></p>
              </>
            )}
            <input 
              type="file" 
              accept="image/bmp" 
              ref={foregroundInputRef}
              onChange={handleForegroundUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div 
            className="upload-box"
            onClick={() => backgroundInputRef.current?.click()}
          >
            {backgroundImage ? (
              <img 
                src={backgroundImage.preview} 
                alt="Background preview" 
                style={{ maxHeight: '160px', maxWidth: '100%' }} 
              />
            ) : (
              <>
                <h3>Background Image</h3>
                <p>Click to upload background image</p>
                <p><small>(BMP format only)</small></p>
              </>
            )}
            <input 
              type="file"
              accept="image/bmp"
              ref={backgroundInputRef}
              onChange={handleBackgroundUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="controls">
          <div className="threshold-control">
            <label htmlFor="threshold">Threshold:</label>
            <div className="slider-container">
              <input 
                type="range" 
                id="threshold" 
                min="1" 
                max="100" 
                step="0.5" 
                value={threshold}
                onChange={handleThresholdChange}
              />
              <span className="threshold-value">{threshold}</span>
            </div>
            <div className="threshold-description">
              <p>The threshold controls how much color difference is required to distinguish between the green screen and the foreground subject. Higher values make more pixels transparent, lower values preserve more of the original image.</p>
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!foregroundImage || !backgroundImage || loading}
          >
            Process Images
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="preview-container">
          {resultImage1 && (
            <div className="preview-box">
              <h3>Method 1 Result</h3>
              <img 
                src={`data:image/bmp;base64,${resultImage1}`} 
                alt="Result with Method 1"
                className="preview-image"
              />
              <a 
                href={`data:image/bmp;base64,${resultImage1}`} 
                download="result_method1.bmp"
              >
                <button>Download</button>
              </a>
            </div>
          )}

          {resultImage2 && (
            <div className="preview-box">
              <h3>Method 2 Result</h3>
              <img 
                src={`data:image/bmp;base64,${resultImage2}`} 
                alt="Result with Method 2"
                className="preview-image"
              />
              <a 
                href={`data:image/bmp;base64,${resultImage2}`} 
                download="result_method2.bmp"
              >
                <button>Download</button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App; 