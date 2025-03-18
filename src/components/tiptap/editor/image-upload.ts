import { toast } from "sonner";
import type { EditorView } from "@tiptap/pm/view";

const onUpload = async (file: File) => {
  // example request
  const promise = fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file?.type || "application/octet-stream",
      "x-vercel-filename": file?.name || "image.png",
    },
    body: file,
  });

  // Return a promise that resolves to the image URL or the file local data
  return new Promise<string>((resolve, reject) => {
    toast.promise(
      promise.then(async (res) => {
        if (res.status === 200) {
          const { url } = (await res.json()) as any;
          // pre-load image
          const image = new Image();
          image.src = url;
          image.onload = () => {
            resolve(url);
          };
        } else if (res.status === 401) {
          // user didn't configure a real backend
          resolve(URL.createObjectURL(file));
          throw new Error(
            "No BLOB_READ_WRITE_TOKEN or similar. We'll use local object URL"
          );
        } else {
          throw new Error("Error uploading image. Please try again.");
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => e.message,
      }
    );
  });
};

/**
 * A function that can be used in handlePaste or handleDrop
 * usage:  uploadFn(file, view, pos)
 */
export const uploadFn = async (
  file: File,
  view: EditorView,
  pos: number
): Promise<void> => {
  // let's insert a placeholder or do something here
  const url = await onUpload(file);
  // once done, insert node
  const { schema } = view.state;

  // example image node
  const node = schema.nodes.image?.create({ src: url });
  if (!node) return;

  // we can do a transaction
  const transaction = view.state.tr.insert(pos, node);
  view.dispatch(transaction);
};
