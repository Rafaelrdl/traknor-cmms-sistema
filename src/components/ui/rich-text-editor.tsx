import { useEditor, EditorContent } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Undo,
  Redo,
} from '@phosphor-icons/react';

// TipTap extensions
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-muted transition-colors',
        isActive ? 'bg-muted text-primary' : 'text-muted-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onUpdate?: (html: string) => void;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content = '',
  placeholder = 'Escreva aqui...',
  onUpdate,
  editable = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none p-4 focus:outline-none',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-em:text-foreground prose-blockquote:text-muted-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'min-h-[200px]'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Card className={cn('border', className)}>
      {editable && (
        <>
          <div className="border-b p-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Text formatting */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  title="Negrito"
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  title="Itálico"
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Headings */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor.isActive('heading', { level: 1 })}
                  title="Título 1"
                  disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="Título 2"
                  disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="Título 3"
                  disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  isActive={editor.isActive('paragraph')}
                  title="Parágrafo"
                  disabled={!editor.can().chain().focus().setParagraph().run()}
                >
                  <Type className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  title="Lista com marcadores"
                  disabled={!editor.can().chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  title="Lista numerada"
                  disabled={!editor.can().chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  isActive={editor.isActive('blockquote')}
                  title="Citação"
                  disabled={!editor.can().chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* History */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  title="Desfazer"
                  disabled={!editor.can().chain().focus().undo().run()}
                >
                  <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  title="Refazer"
                  disabled={!editor.can().chain().focus().redo().run()}
                >
                  <Redo className="h-4 w-4" />
                </ToolbarButton>
              </div>
            </div>
          </div>
        </>
      )}
      <EditorContent editor={editor} />
    </Card>
  );
}