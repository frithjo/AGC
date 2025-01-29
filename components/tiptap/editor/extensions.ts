import { cn } from "@/lib/utils";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import SearchAndReplace from "./selectors/search-and-replace";

const customTaskItem = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "flex gap-2 items-start my-4",
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    // merge any existing HTMLAttributes
    const merged = {
      ...HTMLAttributes,
      class: (HTMLAttributes.class || "") + " flex gap-2 items-start my-4",
    };
    return ["li", merged, 0];
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cn("not-prose pl-2 "),
  },
});

const link = Link.configure({
  HTMLAttributes: {
    class: cn("text-blue-500 no-underline"),
  },
});

export const defaultExtensions = [
  StarterKit.configure({
    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-md bg-black px-1.5 py-1 font-mono font-medium text-white",
      },
    },
    code: {
      HTMLAttributes: {
        class: "rounded-md bg-muted px-1.5 py-1 font-mono font-medium",
        spellcheck: "false",
      },
    },
  }),
  Color.configure({
    types: ["textStyle"],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  HorizontalRule,
  Image,
  link,
  taskList,
  customTaskItem.configure({
    nested: true,
  }),
  TextStyle,
  Underline,
  SearchAndReplace,
];
