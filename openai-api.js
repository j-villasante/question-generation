import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const imagePath = "/home/josue/Projects/pleiades/tests/primer_opcion_pucp_2005/crop_45.png";
const base64Image = fs.readFileSync(imagePath, "base64");

const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [
        {
            role: "user",
            content: [
                { type: "input_text", text: `Grade the following question on a scale from 1 to 10 based on its difficulty.` },
                {
                    type: "input_image",
                    image_url: `data:image/jpeg;base64,${base64Image}`,
                },
            ],
        },
    ],
});

console.log(JSON.stringify(response, null, "  "));