import { Box } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const MemoMarkdownEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type your memo content here" }),
      Markdown,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor?.storage.markdown.getMarkdown());
    },
    onCreate: ({ editor }) => {
      editor?.commands.setContent(value);
      editor?.commands.focus();
    },
  });

  return (
    <Box>
      <RichTextEditor mih={240} editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={40}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Box>
  );
};

export default MemoMarkdownEditor;
