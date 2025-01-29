import type { Editor } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import Moveable from "react-moveable";

export function TiptapImageResizer({ editor }: { editor: Editor }) {
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor;
      const { from, to } = state.selection;
      if (from === to) {
        setSelectedImage(null);
        return;
      }
      const node = state.doc.nodeAt(from);
      if (node && node.type.name === "image") {
        const dom = editor.view.nodeDOM(from) as HTMLElement;
        setSelectedImage(dom);
      } else {
        setSelectedImage(null);
      }
    };

    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!selectedImage) {
    return null;
  }

  return (
    <Moveable
      target={selectedImage}
      container={null}
      origin={false}
      edge={false}
      keepRatio={true}
      resizable={true}
      throttleResize={0}
      onResize={({ target, width, height, delta }) => {
        if (delta && delta[0]) {
          target.style.width = `${width}px`;
        }
        if (delta && delta[1]) {
          target.style.height = `${height}px`;
        }
      }}
      onResizeEnd={({ target }) => {
        // update node attributes
        const pos = editor.state.selection.from;
        const node = editor.state.doc.nodeAt(pos);
        if (node && node.type.name === "image") {
          const widthStr = target.style.width.replace("px", "");
          const heightStr = target.style.height.replace("px", "");
          const width = Number.parseFloat(widthStr);
          const height = Number.parseFloat(heightStr);

          // apply tiptap node update
          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .command(({ tr }) => {
              const attrs = { ...node.attrs, width, height };
              const newNode = editor.schema.nodes.image.create(
                attrs,
                node.content
              );
              tr.replaceWith(pos, pos + node.nodeSize, newNode);
              return true;
            })
            .run();
        }
      }}
      scalable={true}
      throttleScale={0}
      renderDirections={["w", "e"]}
      onScale={({ target, transform }) => {
        target.style.transform = transform;
      }}
    />
  );
}
