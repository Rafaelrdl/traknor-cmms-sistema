import { useEditor, EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
  Italic,
import {
  Bold,
  Italic,
  List,
} from '@phosp
// TipTa
import Plac
interface T
  isActive?
  title
}
functio
    <button

      className={cn(
        isActive ? 'bg-muted text-primary' : 
      )}

  );

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
      onUpdate?.(ed
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

}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
                  onClick={()
                  ti
         
      
            
             
                >
                </ToolbarButton>
      
                  
                >
                </


              <div className="flex items-center gap-1">
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  title="
          
        
      
     

                
                
   

          


          
                  onClick={() => editor.
                  disabled={!editor.can().chain().focus().undo(
                  <Undo className="h-
                <ToolbarButton
                  title="Refaz
                >
                </ToolbarButton>
            </div>
        </>
                >
  );
                </ToolbarButton>





                >







              <div className="flex items-center gap-1">
                <ToolbarButton




                >

                </ToolbarButton>
























              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists */}

                <ToolbarButton























              </div>





                <ToolbarButton

                  title="Desfazer"

                >

                </ToolbarButton>



                  disabled={!editor.can().chain().focus().redo().run()}

                  <Redo className="h-4 w-4" />

              </div>

          </div>

      )}

    </Card>

}