import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamObject, streamText, tool } from "ai";
import { z } from "zod";
import { JSONContent } from "novel";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = openai("gpt-4o-mini-2024-07-18");

const schema = z.object({
  message: z.string().describe("The messages to be sent to the user"),
  updateEditorJSON: z.boolean().describe("Whether to update the editor JSON"),
  editorJSON: z
    .string()
    .describe("The content of the editor in the JSON format"),
  nextPrompt: z
    .array(z.string())
    .length(2)
    .describe(
      "The prompt for the next message based on the overall chatHistory context in user perspective"
    ),
});

export async function POST(req: NextRequest) {
  const { messages, prompt, editorContent } = await req.json();

  console.log("payload", { prompt, messages, editorContent });

  const result = await generateObject({
    model,
    prompt,
    system: systemPrompt(editorContent),
    schema,
  });

  console.log("generated-object", result);

  return result.toJsonResponse();
}

function systemPrompt(editorContent: JSONContent) {
  return `
  You are a helpful and a writing assistant that can help with writing.
  You are given a JSON object that represents the current state of the editor.
  The JSON object of the editor is structured as follows:
  ${JSON.stringify(editorContent, null, 2)}

  1. analyze the json object if the user asked something form the json answer it from it, otherwise search answer by your knowledge.
  2. if the user asked something that is not related to the json object, the answer it from your knowledge.
  3. please refer these types of json object to answer the user:
  Heading1
    {
      type: "heading", 
      attrs: {
        level: 1,
      },
      content: [
        {
          type: "text",

          text: "Hello world",
        },
      ],
    },
    ----
   Heading2
      {
      type: "heading",
      attrs: {
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "Hello World",
        },
      ],
    },
    ----
    Heading3
       {
      type: "heading",
      attrs: {
        level: 3,
      },
      content: [
        {
          type: "text",
          text: "Hello world",
        },
      ],
    },
    ----
    Paragraph
        {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is the demo",
        },
      ],
    },
    ----
    List
        {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "hello world",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "world hello",
                },
              ],
            },
            {
              type: "orderedList",
              attrs: {
                start: 1,
              },
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "sasa",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "sasa",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    ----
    Quote
   {
    "type": "blockquote",
    "content": [
        {
            "type": "paragraph",
            "content": [
                {
                    "type": "text",
                    "text": "wassup world"
                }
            ]
        }
    ]
}
    Code
    {
    "type": "paragraph",
    "content": [
        {
            "type": "text",
            "marks": [
                {
                    "type": "code"
                }
            ],
            "text": "code"
        },
        {
            "type": "text",
            "text": " "
        }
    ]
}
    Task List
     {
      "type": "taskList",
      "content": [
        {
          "type": "taskItem",
          attrs: {
            checked: false, // true or false
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "hello world",
                },
              ],
            },
          ],
        },
      ],
    },

    4. If the user asked to create a new task or delete or update the task, then create a new task or delete or update the task by giving the task name and the task status with a proper json, please think and answer it with a proper json/reply.

  `;
}
