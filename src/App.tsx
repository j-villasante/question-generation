import { useState } from "react";
import ImageBrowser from "./components/ImageBrowser";
import QuestionForm from "./components/QuestionForm";
import { type ImageFile } from "./types";
import type { ConversionOutput } from "./services/openAiApi";

export type SelectedImage = {
  image: ImageFile;
  conversionOutput: ConversionOutput;
};

function App() {
  const [selectedImage, setSelectedImage] = useState<SelectedImage>();
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Deep Kafka - Question Generation
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Two Panel Layout */}
      <main className="max-w-full mx-auto py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8 h-full">
          {/* Left Panel - Image Browser */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Image Browser
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select an image to create a question
              </p>
            </div>
            <div className="p-6">
              <ImageBrowser
                savedImages={savedImages}
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
            </div>
          </div>

          {/* Right Panel - Question Form */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Question Form
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedImage
                  ? `Creating question for: ${selectedImage.image.name}`
                  : "Select an image to start"}
              </p>
            </div>
            <div className="p-6">
              <QuestionForm
                selectedImage={selectedImage}
                setSavedImage={setSavedImages}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Deep Kafka Question Generation App - Built with React, TypeScript,
            and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
