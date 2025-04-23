# Chromakey Background Replacement

A full-stack application that performs green screen/chroma key operations on images. This project combines a C++ backend for image processing with a TypeScript React frontend for a modern user interface.

## Features

- Upload images with green backgrounds to replace with new backgrounds
- Two different chromakey algorithms:
  - Method 1: Uses a user-provided threshold for color distance
  - Method 2: Automatically determines an appropriate threshold
- Interactive TypeScript React frontend with real-time preview
- C++ backend for efficient image processing

## Tech Stack

- **Backend**:
  - C++: Core image processing algorithms
  - Node.js/Express: API server to interface with C++ code
  
- **Frontend**:
  - TypeScript: Type-safe JavaScript
  - React: UI library
  - Webpack: Module bundler

## Project Structure

```
chromakey-background-replacement/
├── frontend/               # TypeScript React frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── backend/                # Node.js Express server
│   ├── server.js           # API server
│   ├── uploads/            # Temporary storage for uploads
│   └── output/             # Temporary storage for processed images
├── bmplib.cpp              # BMP image library implementation
├── bmplib.h                # BMP image library header
├── chromakey.cpp           # C++ implementation of chromakey algorithms
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- C++ compiler (g++)

### Building the C++ Component

```bash
g++ -g -Wall -c bmplib.cpp -o bmplib.o
g++ -g -Wall -o chromakey bmplib.o chromakey.cpp
```

### Starting the Backend Server

```bash
cd backend
npm install
npm run dev
```

### Starting the Frontend Development Server

```bash
cd frontend
npm install
npm start
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
NODE_ENV=production npm start
```

## How to Use

1. Open the application in your web browser
2. Upload a foreground image with a green background
3. Upload a background image to replace the green screen
4. Adjust the threshold value if desired
5. Click "Process Images" to apply the chromakey effect
6. View and download the results from both methods
