import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

type Props = {
  value: string | null | undefined;
  onChange: (value: string) => void;
};

const MemoFormatMarkdownInput = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor?.storage.markdown.getMarkdown());
    },
    onCreate: ({ editor }) => {
      if (value) {
        editor?.commands.setContent(value);
      }
      editor?.commands.focus();
    },
  });

  return (
    <RichTextEditor mih={60} editor={editor}>
      <RichTextEditor.Toolbar p={4} sticky stickyOffset={40}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default MemoFormatMarkdownInput;
