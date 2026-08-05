import React from "react";
import AuthBackgroundLayout from "@/components/AuthBackgroundLayout";
import { PublicFlowModal } from "@/components/portal/PublicFlowModal";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary específico para tratar erros de carregamento de chunk (módulos JS)
 * e outros erros de renderização, oferecendo uma UI institucional clara em vez de tela branca.
 */
export class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ChunkErrorBoundary] Capturado erro:", error, errorInfo);
    
    // Se for erro de chunk, a função lazyWithRetry já deve ter tentado o reload.
    // Se chegamos aqui, é porque a falha persistiu ou é outro tipo de erro.
  }

  handleReload = () => {
    // Limpa possíveis flags de reload antes de tentar novamente
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith("sbpm_chunk_reload_")) {
        sessionStorage.removeItem(key);
      }
    });
    
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = 
        this.state.error?.message?.includes("Failed to fetch dynamically imported module") ||
        this.state.error?.message?.includes("Loading chunk") ||
        this.state.error?.message?.includes("ChunkLoadError");

      return (
        <AuthBackgroundLayout align="center">
          <PublicFlowModal>
            <div className="flex flex-col items-center text-center p-6 space-y-6">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {isChunkError ? "Nova versão disponível" : "Algo não saiu como esperado"}
                </h1>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                  {isChunkError 
                    ? "O portal foi atualizado para uma nova versão. Por favor, atualize a página para continuar."
                    : "Ocorreu um erro ao carregar esta seção do portal."}
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-4">
                <Button 
                  onClick={this.handleReload}
                  className="w-full bg-[#168a49] hover:bg-[#168a49]/90 h-12 rounded-[10px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar agora
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full h-12 rounded-[10px] border-[rgba(22,163,74,0.46)] text-gray-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 w-full text-left overflow-hidden">
                  <p className="text-[10px] font-mono text-gray-500 break-all">
                    {this.state.error?.message}
                  </p>
                </div>
              )}
            </div>
          </PublicFlowModal>
        </AuthBackgroundLayout>
      );
    }

    return this.props.children;
  }
}
