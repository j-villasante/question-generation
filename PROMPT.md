# Test prompts

Analyze the given image and convert the question and answers into HTML using Latex
if necessary. Place those HTML elements into a JSON object with the following format:

```json
{
  "question": "HTML string",
  "options": [
    "HTML string",
    "HTML string",
    "HTML string",
    "HTML string"
  ]
}
```
