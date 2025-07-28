import { useEditor, EditorContent } from '@tiptap/react';
import { Button } from '@/components/ui/butto
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  List,
  Italic,
  Undo,
  List,
  ListOrdered,
  Quote,
} from 
  Redo,
interfa
  Heading1,
  placehold
  Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content = '',
  onChange,
          'prose-blockquote:text-muted-
        ),
      },
  });
  if (!editor) {
  }
  const ToolbarButton = ({
    isActive = false,
    children,
  }: {
    isActi
    children: React.Re
  }) => (
      variant={isActive ? 'secon
      onCl
      tit
    >
    </Button

    <Card className={cn('overfl
        <>
            <div className="flex fl
       
      
                  
                  <
                <T
                  isActive={editor.isActive('italic')}
                >
                </ToolbarButton>


              <div className="flex items-center gap-1">
                  onCl
          
                  <H
        
      
     

                
                
   

                  isActive
            
                </Too


          
      
                  title=
                  <List
                <Toolba
                  isActive={ed
                >
         


              <
                isActiv
              >
              </Too
              <Separator orie
     
                
             
    

          
                  title="Refazer"
                  <R
          
          </div>
      )}
      <EditorContent 
              <div className="flex items-center gap-1">
                <ToolbarButton
      />
  );


















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