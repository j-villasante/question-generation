export interface Question {
  id?: string;
  question: string;
  options: string;
  image: string;
  solutionImage?: string;
  testNameId: string;
  questionSubjectId: string;
  createdAt?: string;
}

export type SavedQuestion = Omit<Question, "options"> & {
  options: { type: "text" | "image"; value: string; correct: boolean }[];
};

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
}

export interface DeepSeekResponse {
  html: string;
  success: boolean;
  error?: string;
}

export interface ImageFile {
  file: File;
  preview: string;
  name: string;
}
