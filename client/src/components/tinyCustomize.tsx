"use client";

import { ControllerRenderProps } from "react-hook-form";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { uploadToCloudinary } from "@/lib/utils";

type TinyEditorProps = {
  field: ControllerRenderProps<any, any>;
  placeholder?: string;
};

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  {
    ssr: false,
  }
);

export default function TinyEditor({ field, placeholder }: TinyEditorProps) {
  const editorRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleFilePicker = (
    cb: (value: string, meta?: Record<string, any> | undefined) => void,
    _value: string,
    _meta: Record<string, any>
  ) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.onchange = async function () {
      const file = (this as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);

      // disable nút Save
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        ".tox-dialog__footer .tox-button"
      );
      const saveBtn = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === "Save"
      );
      saveBtn?.setAttribute("disabled", "true");

      try {
        // gọi API upload
        const url = await uploadToCloudinary(file);

        // enable Save
        saveBtn?.removeAttribute("disabled");

        // đưa URL vào input Source
        cb(url, { title: file.name });
      } catch (e) {
        console.error("Upload error", e);
        saveBtn?.removeAttribute("disabled");
      } finally {
        setLoading(false);
        saveBtn?.removeAttribute("disabled");
      }
    };

    input.click();
  };
  return (
    <div className="relative">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        value={field.value}
        onEditorChange={(content) => field.onChange(content)}
        init={{
          height: 550,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          content_style: `
            img {
              max-width: 400px !important;
              height: auto !important;
              display: block;
              margin: 0 auto;
            }
          `,
          toolbar:
            "undo redo | blocks | bold italic underline | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | image media link | code",
          placeholder: placeholder,
          automatic_uploads: true,
          file_picker_types: "image",
          content_css: theme === "dark" ? "dark" : "default",
          skin: theme === "dark" ? "oxide-dark" : "oxide",

          paste_postprocess: (plugin, args) => {
            args.node.querySelectorAll("img").forEach((img) => {
              img.setAttribute("width", "400");
              img.removeAttribute("height");
              img.style.height = "auto";
              img.style.display = "block";
              img.style.margin = "0 auto";
            });
          },

          setup: (editor) => {
            editor.on("NodeChange", (e) => {
              if (e.element.nodeName === "IMG") {
                (e.element as HTMLImageElement).style.width = "400px";
                (e.element as HTMLImageElement).style.height = "auto";
              }
            });
          },

          file_picker_callback: handleFilePicker,
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
