import { Node } from "@tiptap/core";
import { type Editor, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance, type Props } from "tippy.js";
import { SlashCommandList } from "./ui/slash-command-list";
import { slashItems } from "./ui/slash-items";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  searchTerms: string[];
  command: (props: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
}

export const slashCommandExtension = Node.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          // if props is a function, run it
          if (typeof props === "function") {
            // We'll do the slash removal logic in slashCommandList now (via onSelect callback).
            // But if we still want to handle it here, we can do so:
            // editor.chain().focus().deleteRange(range).run();
            // props({ editor, range });
          }
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => {
          const normalized = query.toLowerCase();
          if (!normalized) {
            return slashItems.slice(0, 10);
          }
          return slashItems
            .filter((item) => {
              const inTitle = item.title.toLowerCase().includes(normalized);
              const inDesc = item.description
                .toLowerCase()
                .includes(normalized);
              const inTerms = item.searchTerms.some((term) =>
                term.toLowerCase().includes(normalized)
              );
              return inTitle || inDesc || inTerms;
            })
            .slice(0, 10);
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: Instance<Props>[] | null = null;

          return {
            onStart: (props) => {
              // We'll define an onSelect callback to remove slash, run item, and hide popup
              const onSelect = (itemCommand: Function) => {
                // remove slash from doc
                props.editor.chain().focus().deleteRange(props.range).run();
                // run the item command
                itemCommand({ editor: props.editor, range: props.range });
                // hide the popup
                popup?.[0]?.hide();
              };

              component = new ReactRenderer(SlashCommandList, {
                editor: props.editor,
                props: {
                  ...props,
                  onSelect,
                },
              });
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate: (props) => {
              component?.updateProps(props);
              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              // pass event to slash command list
              return (component?.ref as any)?.onKeyDown?.(props);
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
