# Deep Kafka - Question Generation App

A React TypeScript web application for generating questions from images using AI and storing them in Supabase.

## Features

- **Image Browser**: Drag & drop or select multiple images from your local folder
- **AI-Powered Question Generation**: Convert images to HTML/LaTeX questions using Deep-seek API
- **Image Upload**: Automatic upload of selected images to Supabase Storage
- **Comprehensive Form**: Create questions with options, answers, and metadata
- **Dynamic Dropdowns**: Test names and question subjects are loaded from Supabase
- **Database Storage**: Save questions to Supabase for persistence
- **Responsive Design**: Modern UI built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Two-Panel Layout**: Side-by-side image browser and question form

## Form Fields

- Question (with AI generation from image)
- Options (multiple choice)
- Answer
- Image (automatically set from selected image)
- Solution image (optional)
- Test name (dropdown)
- Question subject (dropdown)
- Question difficulty (dropdown)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Deep-seek API Configuration
VITE_DEEP_SEEK_API_URL=your-deep-seek-api-endpoint
VITE_DEEP_SEEK_API_KEY=your-deep-seek-api-key
```

### 3. Supabase Setup

Create the necessary tables in your Supabase database by running the SQL commands in `database-setup.sql`:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL commands

This will create:
- `questions` table for storing question data
- `test_names` table for dropdown options
- `question_subjects` table for dropdown options
- `images` storage bucket for file uploads
- Sample data for both dropdown tables
- Proper Row Level Security (RLS) policies
- Storage policies for image uploads

**Main tables created:**
```sql
-- Questions table (updated structure)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Stores {type: "text"|"image", value: string}
  answer TEXT NOT NULL,
  image TEXT NOT NULL,
  solution_image TEXT,
  test_name_id UUID NOT NULL REFERENCES test_names(id), -- Foreign key
  question_subject_id UUID NOT NULL REFERENCES question_subjects(id), -- Foreign key
  question_difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dropdown options tables
CREATE TABLE test_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE question_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Changes in Database Structure:**
- `options` field is now JSONB storing `{type: "text"|"image", value: string}`
- `test_name_id` and `question_subject_id` are foreign keys to their respective tables
- Proper relational database design with referential integrity
- Indexes added for better query performance

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Upload Images**: Drag and drop or click to select images in the Image Browser
2. **Select Image**: Click on an image to select it and proceed to the form
3. **Generate Question**: Click "Generate from Image" to use AI for question creation
4. **Fill Form**: Complete all required fields including options and metadata
5. **Submit**: The application will:
   - Upload the selected image to Supabase Storage
   - Save the question with the image URL to your Supabase database
6. **Repeat**: Return to image browser to create more questions

## Managing Dropdown Options

The application dynamically loads Test Names and Question Subjects from Supabase. You can manage these options in several ways:

### Option 1: Direct Database Management
1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Edit the `test_names` and `question_subjects` tables directly

### Option 2: Using SQL Commands
Add new options using SQL in the Supabase SQL Editor:

```sql
-- Add a new test name
INSERT INTO test_names (value, label) VALUES ('new-test', 'New Test Name');

-- Add a new question subject
INSERT INTO question_subjects (value, label) VALUES ('new-subject', 'New Subject');
```

### Option 3: Programmatic Management
The application includes helper functions in `src/utils/dropdownHelpers.ts` for programmatic management:

```typescript
import { addTestName, addQuestionSubject } from './utils/dropdownHelpers';

// Add new test name
await addTestName('spring-final', 'Spring Final Exam');

// Add new question subject
await addQuestionSubject('quantum-physics', 'Quantum Physics');
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Tailwind Forms
- **Form Management**: React Hook Form
- **File Upload**: React Dropzone
- **Database**: Supabase
- **AI Integration**: Deep-seek API
- **HTTP Client**: Axios

## Development

The application uses a mock Deep-seek API function for development. To use the real API, update the import in `QuestionForm.tsx`:

```typescript
// Change from:
import { mockConvertImageToHtml } from '../services/deepSeekApi';

// To:
import { convertImageToHtml } from '../services/deepSeekApi';
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ImageBrowser.tsx # Image selection and preview
│   └── QuestionForm.tsx # Question creation form
├── data/               # Static data and configurations
│   └── dropdownOptions.ts
├── lib/                # External service configurations
│   └── supabase.ts
├── services/           # API service functions
│   └── deepSeekApi.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```
