import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { type Question, type ImageFile, type DropdownOption } from "../types";
import { questionDifficulties } from "../data/dropdownOptions";
import {
  saveQuestion,
  getTestNames,
  getQuestionSubjects,
  uploadImage,
} from "../lib/supabase";
import { convertImageToHtml } from "../services/openAiApi";

interface QuestionFormProps {
  selectedImage: ImageFile | null;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  selectedImage,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [testNames, setTestNames] = useState<DropdownOption[]>([]);
  const [questionSubjects, setQuestionSubjects] = useState<DropdownOption[]>(
    [],
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Question>();

  const questionValue = watch("question");
  const options = watch("options");

  console.log(selectedAnswer);

  // Fetch dropdown options from Supabase on component mount
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [testNamesData, questionSubjectsData] = await Promise.all([
          getTestNames(),
          getQuestionSubjects(),
        ]);
        setTestNames(
          testNamesData.map((o) => ({ id: o.id, value: o.id, label: o.name })),
        );
        setQuestionSubjects(
          questionSubjectsData.map((o) => ({
            id: o.id,
            value: o.id,
            label: o.label,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch dropdown options:", error);
        // Fallback to empty arrays if fetch fails
        setTestNames([]);
        setQuestionSubjects([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  const handleGenerateQuestion = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await convertImageToHtml(selectedImage.file);
      setValue("question", response.question);
      setValue("options", response.options.join("\n"));
    } catch (e) {
      console.error(e);
      alert("Failed to generate question from image");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: Question) => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    if (selectedAnswer === undefined) {
      alert("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, upload the image to Supabase Storage
      setIsUploadingImage(true);
      const imageUrl = await uploadImage(selectedImage.file, "question-images");
      setIsUploadingImage(false);

      // Then save the question with the image URL
      await saveQuestion({
        ...data,
        options: data.options.split("\n").map((e, i) => ({
          type: "text",
          value: e,
          correct: i === selectedAnswer,
        })),
        image: imageUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      setIsUploadingImage(false);
      if (error instanceof Error && error.message.includes("Upload failed")) {
        alert("Failed to upload image. Please check your file and try again.");
      } else {
        alert(
          "Failed to save question. Please check your Supabase configuration.",
        );
      }
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedImage) {
    return (
      <div className="w-full">
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No image selected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select an image from the left panel to create a question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Question Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <button
              type="button"
              onClick={handleGenerateQuestion}
              disabled={isGenerating}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate from Image"
              )}
            </button>
          </div>
          <textarea
            {...register("question", { required: "Question is required" })}
            rows={6}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the question or click 'Generate from Image' to auto-generate"
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-600">
              {errors.question.message}
            </p>
          )}

          {/* Question Preview */}
          {questionValue && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview:
              </h4>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: questionValue }}
              />
            </div>
          )}
        </div>

        {/* Options Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options (one per line)
          </label>
          <textarea
            {...register("options", {
              required: "Options are required",
              validate: (value) => {
                return (
                  (value.split("\n").length >= 2) ||
                  "At least 2 options are required"
                );
              },
            })}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
          />
          {errors.options && (
            <p className="mt-1 text-sm text-red-600">
              {errors.options.message}
            </p>
          )}
        </div>

        {/* Answer Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer
          </label>
          <select
            onChange={(e) => setSelectedAnswer(parseInt(e.target.value) ?? undefined)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoadingOptions}
          >
            <option value={undefined}>
              Select answer
            </option>
            {options?.split("\n").map((option, i) => (
              <option key={i} value={i}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Solution Image Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solution Image (optional)
          </label>
          <input
            type="text"
            {...register("solutionImage")}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter solution image path or URL"
          />
        </div>

        {/* Dropdown Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name
            </label>
            <select
              {...register("testNameId", { required: "Test name is required" })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingOptions}
            >
              <option value="">
                {isLoadingOptions
                  ? "Loading test names..."
                  : "Select test name"}
              </option>
              {testNames.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.testNameId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.testNameId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Subject
            </label>
            <select
              {...register("questionSubjectId", {
                required: "Question subject is required",
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingOptions}
            >
              <option value="">
                {isLoadingOptions ? "Loading subjects..." : "Select subject"}
              </option>
              {questionSubjects.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.questionSubjectId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.questionSubjectId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Difficulty
            </label>
            <select
              {...register("questionDifficulty", {
                required: "Question difficulty is required",
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select difficulty</option>
              {questionDifficulties.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.questionDifficulty && (
              <p className="mt-1 text-sm text-red-600">
                {errors.questionDifficulty.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting || isUploadingImage ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isUploadingImage ? "Uploading image..." : "Saving question..."}
              </>
            ) : (
              "Save Question"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
