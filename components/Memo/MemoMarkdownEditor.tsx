import { Box } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const MemoMarkdownEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor?.getHTML());
    },
    onCreate: ({ editor }) => {
      editor?.commands.focus();
    },
  });

  return (
    <Box>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={40}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Box>
  );
};

export default MemoMarkdownEditor;
