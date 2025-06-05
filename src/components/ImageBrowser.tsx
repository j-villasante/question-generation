import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { type ImageFile } from "../types";
import {
  convertImageToHtml,
  type ConversionOutput,
} from "../services/openAiApi";
import type { SelectedImage } from "../App";

interface ImageBrowserProps {
  savedImages: Set<string>;
  onImageSelect: (selection: SelectedImage) => void;
  selectedImage?: SelectedImage;
}

// Loader component
const ImageLoader: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const ImageBrowser: React.FC<ImageBrowserProps> = ({
  savedImages,
  onImageSelect,
  selectedImage,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loadingImages, setLoadingImages] = useState<
    Map<string, ConversionOutput>
  >(new Map());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));

    setImages((prev) => [...prev, ...imageFiles]);
  }, []);

  useEffect(() => {
    for (const i of images) {
      convertImageToHtml(i.file)
        .then((output) => handleImageLoadEnd(i.name, output))
        .catch((error) => {
          console.error(`Error converting image ${i.name}:`, error);
          handleImageLoadEnd(i.name, { question: "", options: [] });
        });
    }
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    multiple: true,
  });

  const handleImageSelect = (image: ImageFile) => {
    if (!loadingImages.has(image.name)) {
      return;
    }
    onImageSelect({ image, conversionOutput: loadingImages.get(image.name)! });
  };

  const handleImageLoadEnd = (
    imageName: string,
    conversionOutput: ConversionOutput,
  ) => {
    setLoadingImages((prev) => {
      const newSet = new Map(prev);
      newSet.set(imageName, conversionOutput);
      return newSet;
    });
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
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
              ? "Drop the images here..."
              : "Drag & drop images here, or click to select files"}
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
                  selectedImage?.image?.name === image.name
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <div className="relative w-full h-32">
                  {!loadingImages.has(image.name) && <ImageLoader />}
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <p className="text-xs truncate">{image.name}</p>
                </div>
                {selectedImage?.image?.name === image.name && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                {savedImages.has(image.name) && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
          <h3 className="text-md font-medium mb-3 text-gray-700">
            Selected Image Preview
          </h3>
          <div className="max-w-sm mx-auto">
            <img
              src={selectedImage.image.preview}
              alt={selectedImage.image.name}
              className="w-full rounded-lg shadow-md"
            />
            <p className="text-center mt-2 text-sm text-gray-600 truncate">
              {selectedImage.image.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBrowser;
