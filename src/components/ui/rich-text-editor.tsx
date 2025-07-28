import { useEditor, EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
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
  });

  if (!editor) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {editable && (
        <div className="border-b p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Typography */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Título 1"
              >
                <Type className="h-4 w-4" weight="bold" />
              </ToolbarButton>
              
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Título 2"
              >
                <Type className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text formatting */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Lista com marcadores"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Desfazer"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Refazer"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none min-h-[200px]"
        />
      </div>
    </Card>
  );
}