export const DEFAULT_CONTENT = {
  type: "doc",
  content: [
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
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is the demo",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "wassup world",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          marks: [
            {
              type: "code",
            },
          ],
          text: "code",
        },
        {
          type: "text",
          text: " ",
        },
      ],
    },
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
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: {
            checked: false,
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
  ],
};

export const iSuckTestingJSON = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "TODO" }],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "fix landing page in " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "http://mediatoad.com",
                        target: "_blank",
                        rel: "noopener noreferrer nofollow",
                        class:
                          "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
                      },
                    },
                  ],
                  text: "mediatoad.com",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "fix agentic flows" }],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "go to park for a walk" }],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "sleep for 6-7 hours a day" }],
            },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Blog about shri" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Shri is a" },
        { type: "text", marks: [{ type: "italic" }], text: " SDE. " },
        { type: "text", text: "he sucks in" },
        {
          type: "text",
          marks: [{ type: "bold" }],
          text: " life, broke, pro-procrastinator",
        },
        {
          type: "text",
          text: ". he never made his parents proud/happy in his whole life. ",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "his dump fuck portfolio: " },
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "dub.sh/shri",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "he is a " },
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "good consumer, do he dont apply on the real world to improve himself ",
                },
              ],
            },
          ],
        },
      ],
    },
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
                  marks: [{ type: "bold" }],
                  text: "hopefully , ",
                },
                {
                  type: "text",
                  marks: [{ type: "italic" }],
                  text: "he will do something in the middle of this year",
                },
              ],
            },
          ],
        },
      ],
    },
    { type: "paragraph" },
  ],
};
