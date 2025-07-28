import { useEditor, EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
  Italic
  Bold,
  Quote,
  List,
} from 'lucide
import S
interfa
  onCha
  className
}
export func
  onCha
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

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Digite aqui...',
    content,
  editable = true,
      if (onChange) {
  const editor = useEditor({
    },
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          className
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
    retur
    ],
  const Tool
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
  }) => (
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-blockquote:text-muted-foreground prose-blockquote:border-l-border',
      {children}
        ),
        
      
     

                
                
   

                  <Heading
            
                  isA
                >
          


              <div class
                  onCli
                  title
                  
                <ToolbarButton
         
           
                </ToolbarButton>


              <ToolbarBut
                isA
              >
     
              <S
             
    

          
                </ToolbarButton>
                  on
          
                  <Redo className="h-4 w
              </div>
          </div>
      )}
      <EditorContent 
        className={cn(
          !editable && 'p-4'
      />
  );


















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