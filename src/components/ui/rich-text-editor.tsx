import { useEditor, EditorContent } from '@tiptap/react';
import { Separator } from '@/components/ui/s
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Headi
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Redo,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;

  return (
      variant={isAc
      onClick={onClick}
      title={title}
    >
    </Button>
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

      }
    editorProps
        cla
          'prose-headings:text-fo
  className,
        ),
}: RichTextEditorProps) {
  });
    extensions: [
  }
  return (
      {editable && (
          keepAttributes: false,
          
                <Toolb
                  isActive
                >
          
      }),
      
    content,
             
              <Separator orient
              {/* Hea
                <ToolbarButton
       
      
                </
      attributes: {
                  
                  <Heading2 className="h-4 w-4" />
                <ToolbarButton
                  isActive={editor.isActive('heading', { level: 3 })}
                >
          className
          
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
                t
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                  disabled={!e
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  title="Itálico"
                >
                  <Italic className="h-4 w-4" />
                >
  );

              <Separator orientation="vertical" className="h-6" />

              {/* Headings */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor.isActive('heading', { level: 1 })}



























































































