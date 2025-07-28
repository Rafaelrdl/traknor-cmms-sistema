import { useEditor, EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Digite aqui...',
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-blockquote:text-muted-foreground prose-blockquote:border-l-border',
          className
        ),
        'data-placeholder': placeholder,
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

              {/* Headings */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor.isActive('heading', { level: 1 })}
                  title="Título 1"
                >
                  <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="Título 2"
                >
                  <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="Título 3"
                >
                  <Heading3 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  isActive={editor.isActive('paragraph')}
                  title="Parágrafo"
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
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Quote */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>

              <Separator orientation="vertical" className="h-6" />

              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="Desfazer"
                >
                  <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="Refazer"
                >
                  <Redo className="h-4 w-4" />
                </ToolbarButton>
              </div>
            </div>
          </div>
        </>
      )}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          'min-h-[200px]',
          !editable && 'p-4'
        )}
      />
    </Card>
  );
}