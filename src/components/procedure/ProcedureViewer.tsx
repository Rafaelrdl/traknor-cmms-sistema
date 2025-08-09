import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Procedure, ProcedureCategory } from '@/models/procedure';
import { getFileBlob } from '@/data/proceduresStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ProcedureViewerProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: Procedure;
  categories: ProcedureCategory[];
}

export function ProcedureViewer({
  isOpen,
  onClose,
  procedure,
  categories,
}: ProcedureViewerProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PDF specific state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  const category = procedure?.category_id 
    ? categories.find(cat => cat.id === procedure.category_id) 
    : null;

  useEffect(() => {
    if (procedure && isOpen) {
      loadFile();
    }
    return () => {
      setFileContent(null);
      setFileBlob(null);
      setError(null);
      setPageNumber(1);
      setScale(1.0);
      setNumPages(null);
    };
  }, [procedure, isOpen]);

  const loadFile = async () => {
    if (!procedure) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await getFileBlob(procedure.file.id);
      
      if (!blob) {
        setError('Arquivo não encontrado');
        return;
      }
      
      setFileBlob(blob);
      
      if (procedure.file.type === 'md') {
        const text = await blob.text();
        setFileContent(text);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Erro ao carregar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fileBlob || !procedure) return;
    
    const url = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = procedure.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Download iniciado');
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevPage();
        break;
      case 'ArrowRight':
        handleNextPage();
        break;
      case '+':
      case '=':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleZoomIn();
        }
        break;
      case '-':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleZoomOut();
        }
        break;
      case '0':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleResetZoom();
        }
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, numPages]);

  if (!procedure) {
    return null;
  }

  const isPDF = procedure.file.type === 'pdf';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[90vw] sm:max-w-4xl p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <SheetTitle className="text-xl">{procedure.title}</SheetTitle>
              <SheetDescription className="text-base">
                {procedure.description || 'Sem descrição disponível'}
              </SheetDescription>
              
              <div className="flex flex-wrap gap-2 items-center pt-2">
                {category && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {category.name}
                  </Badge>
                )}
                
                <Badge variant={procedure.status === 'Ativo' ? 'default' : 'secondary'}>
                  {procedure.status}
                </Badge>
                
                <Badge variant="outline">
                  v{procedure.version}
                </Badge>
                
                <Badge variant="outline">
                  {procedure.file.type.toUpperCase()}
                </Badge>
                
                <span className="text-sm text-muted-foreground">
                  Atualizado {formatDistanceToNow(new Date(procedure.updated_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>

              {procedure.tags && procedure.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {procedure.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={!isPDF || scale <= 0.5}
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={!isPDF || scale >= 3.0}
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetZoom}
              disabled={!isPDF || scale === 1.0}
              aria-label="Resetar zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {isPDF && numPages && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span 
                className="text-sm px-3 py-1 bg-background rounded border"
                aria-live="polite"
                aria-label={`Página ${pageNumber} de ${numPages}`}
              >
                {pageNumber} de {numPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={viewerRef} className="p-6">
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Carregando arquivo...</div>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <div className="text-destructive mb-4">{error}</div>
                  <Button onClick={loadFile}>Tentar novamente</Button>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {isPDF && fileBlob && (
                    <div className="flex justify-center">
                      <Document
                        file={fileBlob}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error);
                          setError('Erro ao carregar PDF');
                        }}
                        loading={<div>Carregando PDF...</div>}
                      >
                        <Page 
                          pageNumber={pageNumber}
                          scale={scale}
                          loading={<div>Carregando página...</div>}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                  )}

                  {!isPDF && fileContent && (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          // Disable HTML rendering for security
                          html: () => null,
                          // Custom link handling
                          a: ({ href, children, ...props }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary underline hover:no-underline"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {fileContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="border-t px-6 py-3 bg-muted/30">
          <div className="text-xs text-muted-foreground">
            <strong>Atalhos:</strong> 
            {isPDF && ' ← → (navegar páginas) •'}
            {isPDF && ' Ctrl/Cmd + - (zoom) •'}
            {' '}Esc (fechar)
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}