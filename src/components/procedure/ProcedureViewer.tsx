import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
// Import PDF configuration utility
import { configurePDFWorker, configurePDFWorkerWithFallback } from '@/utils/pdfConfig';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  X,
  History,
  FileText,
  GitCompare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Procedure, ProcedureCategory } from '@/models/procedure';
import { getFileBlob, listVersions } from '@/data/proceduresStore';
import { VersionHistory } from '@/components/procedure/VersionHistory';
import { VersionComparison } from '@/components/procedure/VersionComparison';
import { PDFViewerFallback } from '@/components/procedure/PDFViewerFallback';
import { PDFErrorBoundary } from '@/components/ui/pdf-error-boundary';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Ensure PDF worker is configured and log status
configurePDFWorker();
if (import.meta.env.DEV) {
  console.log('PDF.js worker configured for development:', pdfjs.GlobalWorkerOptions.workerSrc);
}



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
  const [useFallbackViewer, setUseFallbackViewer] = useState(false);
  
  // Version management state
  const [versions, setVersions] = useState(listVersions(procedure?.id));
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState({ from: '', to: '' });
  const [activeTab, setActiveTab] = useState('document');
  
  const viewerRef = useRef<HTMLDivElement>(null);

  const category = procedure?.category_id 
    ? categories.find(cat => cat.id === procedure.category_id) 
    : null;

  useEffect(() => {
    if (procedure && isOpen) {
      loadFile();
      setVersions(listVersions(procedure.id));
    }
    return () => {
      setFileContent(null);
      setFileBlob(null);
      setError(null);
      setPageNumber(1);
      setScale(1.0);
      setNumPages(null);
      setActiveTab('document');
      setUseFallbackViewer(false);
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
        if (activeTab === 'document') handlePrevPage();
        break;
      case 'ArrowRight':
        if (activeTab === 'document') handleNextPage();
        break;
      case '+':
      case '=':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (activeTab === 'document') handleZoomIn();
        }
        break;
      case '-':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (activeTab === 'document') handleZoomOut();
        }
        break;
      case '0':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (activeTab === 'document') handleResetZoom();
        }
        break;
    }
  };

  const handleVersionCompare = (fromVersionId: string, toVersionId: string) => {
    setComparisonVersions({ from: fromVersionId, to: toVersionId });
    setShowVersionComparison(true);
  };

  const handleProcedureUpdate = () => {
    setVersions(listVersions(procedure?.id));
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
          {activeTab === 'document' && (
            <>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  disabled={!isPDF || scale <= 0.5 || useFallbackViewer}
                  aria-label="Diminuir zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  disabled={!isPDF || scale >= 3.0 || useFallbackViewer}
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetZoom}
                  disabled={!isPDF || scale === 1.0 || useFallbackViewer}
                  aria-label="Resetar zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {isPDF && numPages && !useFallbackViewer && (
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

              {isPDF && useFallbackViewer && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Visualizador alternativo
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseFallbackViewer(false);
                      loadFile(); // Retry with react-pdf
                    }}
                  >
                    Tentar visualizador avançado
                  </Button>
                </div>
              )}

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {activeTab === 'versions' && versions.length >= 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (versions.length >= 2) {
                    setComparisonVersions({ from: versions[1].id, to: versions[0].id });
                    setShowVersionComparison(true);
                  }
                }}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar Versões
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="document" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documento
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico ({versions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="document" className="h-full m-0">
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
                      <div className="space-y-2">
                        <Button onClick={loadFile} variant="outline">
                          Tentar novamente
                        </Button>
                        <Button onClick={handleDownload} variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Baixar arquivo
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <>
                      {isPDF && fileBlob && (
                        <>
                          {useFallbackViewer ? (
                            <PDFViewerFallback
                              fileBlob={fileBlob}
                              fileName={procedure.file.name}
                              onDownload={handleDownload}
                            />
                          ) : (
                            <PDFErrorBoundary 
                              onRetry={loadFile} 
                              onDownload={handleDownload}
                              fallbackMessage="Não foi possível exibir este PDF devido a restrições de rede ou problemas de compatibilidade."
                            >
                              <div className="flex justify-center">
                                <Document
                                  file={fileBlob}
                                  onLoadSuccess={({ numPages }) => {
                                    console.log('PDF loaded successfully with', numPages, 'pages');
                                    setNumPages(numPages);
                                    setError(null); // Clear any previous errors
                                  }}
                                  onLoadError={(error) => {
                                    console.error('PDF load error:', error);
                                    
                                    // If it's a worker error, try to reconfigure with fallback
                                    if (error?.message?.includes('workerSrc') || 
                                        error?.message?.includes('GlobalWorkerOptions') ||
                                        error?.message?.includes('No "GlobalWorkerOptions.workerSrc" specified') ||
                                        error?.message?.includes('Failed to fetch dynamically imported module')) {
                                      console.log('PDF.js worker failed, trying fallback approach...');
                                      
                                      try {
                                        const workerSrc = configurePDFWorkerWithFallback();
                                        console.log('Reconfigured worker source:', workerSrc);
                                        
                                        // Give a moment for the worker to be ready, then retry
                                        setTimeout(() => {
                                          loadFile();
                                        }, 1000);
                                        return; // Don't set error yet, let retry happen
                                      } catch (configError) {
                                        console.error('Worker reconfiguration failed, switching to fallback viewer');
                                        setUseFallbackViewer(true);
                                        return;
                                      }
                                    }
                                    
                                    // Provide more helpful error messages
                                    let errorMessage = 'Erro desconhecido';
                                    if (error?.message?.includes('workerSrc') || error?.message?.includes('Failed to fetch dynamically imported module')) {
                                      errorMessage = 'Erro ao carregar o processador de PDF. A conexão com a internet pode estar instável. Tente baixar o arquivo.';
                                    } else if (error?.message?.includes('Invalid PDF')) {
                                      errorMessage = 'O arquivo não é um PDF válido.';
                                    } else if (error?.message?.includes('Loading task cancelled')) {
                                      errorMessage = 'Carregamento cancelado. Tente novamente.';
                                    } else if (error?.message) {
                                      errorMessage = error.message;
                                    }
                                    
                                    setError(`Erro ao carregar PDF: ${errorMessage}`);
                                  }}
                                  loading={
                                    <div className="flex items-center justify-center py-12">
                                      <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <div className="text-muted-foreground">Carregando PDF...</div>
                                      </div>
                                    </div>
                                  }
                                  error={
                                    <div className="text-center py-12">
                                      <div className="text-destructive mb-4">
                                        Não foi possível exibir o PDF no navegador.
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-4">
                                        Isso pode acontecer devido a restrições de rede ou problemas de compatibilidade.
                                      </div>
                                      <div className="space-y-2">
                                        <Button onClick={() => setUseFallbackViewer(true)} variant="outline">
                                          Usar visualizador alternativo
                                        </Button>
                                        <Button onClick={handleDownload} variant="default">
                                          <Download className="mr-2 h-4 w-4" />
                                          Baixar PDF
                                        </Button>
                                      </div>
                                    </div>
                                  }
                                  options={{
                                    // Ensure worker is configured
                                    workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
                                  }}
                                >
                                  <Page 
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    loading={<div>Carregando página...</div>}
                                    error={<div className="text-destructive">Erro ao renderizar página</div>}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                  />
                                </Document>
                              </div>
                            </PDFErrorBoundary>
                          )}
                        </>
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
            </TabsContent>

            <TabsContent value="versions" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <VersionHistory
                    versions={versions}
                    currentVersion={procedure.version}
                    onVersionCompare={(fromVersionId, toVersionId) => {
                      setComparisonVersions({ from: fromVersionId, to: toVersionId });
                      setShowVersionComparison(true);
                    }}
                    onProcedureUpdate={() => {
                      setVersions(listVersions(procedure.id));
                    }}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="border-t px-6 py-3 bg-muted/30">
          <div className="text-xs text-muted-foreground">
            <strong>Atalhos:</strong> 
            {activeTab === 'document' && isPDF && ' ← → (navegar páginas) •'}
            {activeTab === 'document' && isPDF && ' Ctrl/Cmd + - (zoom) •'}
            {' '}Esc (fechar)
          </div>
        </div>
      </SheetContent>

      {/* Version Comparison Dialog */}
      {procedure && showVersionComparison && (
        <VersionComparison
          procedureId={procedure.id}
          isOpen={showVersionComparison}
          onClose={() => setShowVersionComparison(false)}
          onProcedureUpdate={handleProcedureUpdate}
        />
      )}
    </Sheet>
  );
}