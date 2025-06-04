import axios from 'axios';
import { type DeepSeekResponse } from '../types';

const DEEP_SEEK_API_URL = import.meta.env.VITE_DEEP_SEEK_API_URL || 'your-deep-seek-api-url';
const DEEP_SEEK_API_KEY = import.meta.env.VITE_DEEP_SEEK_API_KEY || 'your-deep-seek-api-key';

export const convertImageToHtml = async (imageFile: File): Promise<DeepSeekResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', 'Convert this image to HTML format with LaTeX support for mathematical expressions. Preserve all text, equations, and formatting.');

    const response = await axios.post(DEEP_SEEK_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${DEEP_SEEK_API_KEY}`,
      },
    });

    return {
      html: response.data.html || response.data.result || '',
      success: true,
    };
  } catch (error) {
    console.error('Deep-seek API error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Mock function for development/testing
export const mockConvertImageToHtml = async (imageFile: File): Promise<DeepSeekResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    html: `
      <div class="question-content">
        <h3>Sample Question from ${imageFile.name}</h3>
        <p>What is the value of <span class="math">x</span> in the equation:</p>
        <div class="math-block">
          $$2x + 5 = 15$$
        </div>
        <p>Choose the correct answer:</p>
        <ol>
          <li>x = 5</li>
          <li>x = 10</li>
          <li>x = 7.5</li>
          <li>x = 2.5</li>
        </ol>
      </div>
    `,
    success: true,
  };
};
