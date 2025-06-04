export type ConversionOutput = {
  question: string;
  options: string[];
};

export type OpenAiResponse = {
  output: {
    content: {
      annotations: [];
      text: string;
      type: "output_text";
    }[];
    id: string;
    role: "assistant";
    status: "completed";
    type: "message";
  }[]
}

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const convertImageToHtml = async (
  imageFile: File,
): Promise<ConversionOutput> => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze the given image and convert the question and answers into HTML using Latex
if necessary. Place those HTML elements into a JSON object with the following format:
{
  "question": "HTML string",
  "options": [
    "HTML string",
    "HTML string",
    "HTML string",
    "HTML string"
  ]
}`,
            },
            {
              type: "input_image",
              image_url: await toBase64(imageFile),
            },
          ],
        },
      ],
    }),
  });
  const responseBody = await response.json() as OpenAiResponse;
  const cleanText = responseBody.output[0].content[0].text
    .replace("```json", "")
    .replace("\n", "")
    .replace("```", "");
  return JSON.parse(cleanText);
};
