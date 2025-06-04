import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { type ImageFile } from '../types';

interface ImageBrowserProps {
  onImageSelect: (image: ImageFile) => void;
  selectedImage: ImageFile | null;
}

const ImageBrowser: React.FC<ImageBrowserProps> = ({ onImageSelect, selectedImage }) => {
  const [images, setImages] = useState<ImageFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
    
    setImages(prev => [...prev, ...imageFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const handleImageSelect = (image: ImageFile) => {
    onImageSelect(image);
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-lg text-gray-600">
            {isDragActive
              ? 'Drop the images here...'
              : 'Drag & drop images here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500">
            Supports: JPEG, PNG, GIF, BMP, WebP
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3 text-gray-700">
            Select an image ({images.length} images loaded)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-96">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.name === image.name
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <p className="text-xs truncate">{image.name}</p>
                </div>
                {selectedImage?.name === image.name && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3 text-gray-700">Selected Image Preview</h3>
          <div className="max-w-sm mx-auto">
            <img
              src={selectedImage.preview}
              alt={selectedImage.name}
              className="w-full rounded-lg shadow-md"
            />
            <p className="text-center mt-2 text-sm text-gray-600 truncate">{selectedImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBrowser;
