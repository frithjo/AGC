import {
  BoldIcon,
  CheckSquare,
  CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  ItalicIcon,
  ListOrdered,
  StrikethroughIcon,
  TextIcon,
  TextQuote,
  UnderlineIcon,
} from 'lucide-react';
export type EditorInstance = any;

export interface TextColorMenuItem {
  name: string;
  color: string;
}

export const TEXT_COLORS: TextColorMenuItem[] = [
  {
    name: 'Default',
    color: '#000000',
  },
  {
    name: 'Purple',
    color: '#9333EA',
  },
  {
    name: 'Red',
    color: '#E00000',
  },
  {
    name: 'Yellow',
    color: '#EAB308',
  },
  {
    name: 'Blue',
    color: '#2563EB',
  },
  {
    name: 'Green',
    color: '#008A00',
  },
  {
    name: 'Orange',
    color: '#FFA500',
  },
  {
    name: 'Pink',
    color: '#BA4081',
  },
  {
    name: 'Gray',
    color: '#A8A29E',
  },
];

export const HIGHLIGHT_COLORS: TextColorMenuItem[] = [
  {
    name: 'Default',
    color: '#ffffff',
  },
  {
    name: 'Purple',
    color: '#f6f3f8',
  },
  {
    name: 'Red',
    color: '#fdebeb',
  },
  {
    name: 'Yellow',
    color: '#fbf4a2',
  },
  {
    name: 'Blue',
    color: '#c1ecf9',
  },
  {
    name: 'Green',
    color: '#acf79f',
  },
  {
    name: 'Orange',
    color: '#faebdd',
  },
  {
    name: 'Pink',
    color: '#faf1f5',
  },
  {
    name: 'Gray',
    color: '#f1f1ef',
  },
];

export type SelectorItem = {
  name: string;
  icon: typeof BoldIcon;
  command: (editor: any) => void;
  isActive: (editor: any) => boolean;
};

export const textItems: SelectorItem[] = [
  {
    name: 'Text',
    icon: TextIcon,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      editor.isActive('paragraph') &&
      !editor.isActive('bulletList') &&
      !editor.isActive('orderedList'),
  },
  {
    name: 'Heading 1',
    icon: Heading1,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    name: 'Heading 2',
    icon: Heading2,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    name: 'Heading 3',
    icon: Heading3,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    name: 'To-do List',
    icon: CheckSquare,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive('taskItem'),
  },
  {
    name: 'Bullet List',
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    name: 'Numbered List',
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    name: 'Quote',
    icon: TextQuote,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    name: 'Code',
    icon: CodeIcon,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive('codeBlock'),
  },
];

export const selectorItems: SelectorItem[] = [
  {
    name: 'bold',
    isActive: (editor) => editor.isActive('bold'),
    command: (editor) => editor.chain().focus().toggleBold().run(),
    icon: BoldIcon,
  },
  {
    name: 'italic',
    isActive: (editor) => editor.isActive('italic'),
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    icon: ItalicIcon,
  },
  {
    name: 'underline',
    isActive: (editor) => editor.isActive('underline'),
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    icon: UnderlineIcon,
  },
  {
    name: 'strike',
    isActive: (editor) => editor.isActive('strike'),
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    icon: StrikethroughIcon,
  },
  {
    name: 'code',
    isActive: (editor) => editor.isActive('code'),
    command: (editor) => editor.chain().focus().toggleCode().run(),
    icon: CodeIcon,
  },
];
