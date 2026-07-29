export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acessos_log: {
        Row: {
          associado_id: string | null
          created_at: string
          dependente_id: string | null
          id: string
          ip: string | null
          metodo_login: string | null
          sucesso: boolean
          tipo_usuario: string
          user_agent: string | null
        }
        Insert: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          ip?: string | null
          metodo_login?: string | null
          sucesso?: boolean
          tipo_usuario: string
          user_agent?: string | null
        }
        Update: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          ip?: string | null
          metodo_login?: string | null
          sucesso?: boolean
          tipo_usuario?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acessos_log_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_log_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      acessos_permissoes_log: {
        Row: {
          acao: string
          alvo_user_id: string | null
          ator_user_id: string | null
          created_at: string
          detalhes: Json | null
          id: string
        }
        Insert: {
          acao: string
          alvo_user_id?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json | null
          id?: string
        }
        Update: {
          acao?: string
          alvo_user_id?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json | null
          id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          associado_id: string | null
          created_at: string
          event: string
          id: string
          meta: Json | null
          path: string | null
          user_agent: string | null
        }
        Insert: {
          associado_id?: string | null
          created_at?: string
          event: string
          id?: string
          meta?: Json | null
          path?: string | null
          user_agent?: string | null
        }
        Update: {
          associado_id?: string | null
          created_at?: string
          event?: string
          id?: string
          meta?: Json | null
          path?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      associados: {
        Row: {
          assinatura_url: string | null
          ativo: boolean
          cep: string | null
          cidade: string | null
          cpf: string
          created_at: string
          data_admissao: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          matricula: string
          nome: string
          patente: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string
          data_admissao?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          matricula: string
          nome: string
          patente?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          data_admissao?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          matricula?: string
          nome?: string
          patente?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      avaliacoes_parceiros: {
        Row: {
          aprovado: boolean
          associado_id: string
          autor_nome: string
          clinica_id: string
          comentario: string | null
          created_at: string
          id: string
          moderado_em: string | null
          moderado_por: string | null
          nota: number
          updated_at: string
        }
        Insert: {
          aprovado?: boolean
          associado_id: string
          autor_nome: string
          clinica_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          moderado_em?: string | null
          moderado_por?: string | null
          nota: number
          updated_at?: string
        }
        Update: {
          aprovado?: boolean
          associado_id?: string
          autor_nome?: string
          clinica_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          moderado_em?: string | null
          moderado_por?: string | null
          nota?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_parceiros_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas_parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      carencias: {
        Row: {
          associado_id: string
          created_at: string
          data_liberacao: string | null
          dependente_id: string | null
          id: string
          procedimento: string
          status: Database["public"]["Enums"]["status_carencia"]
          updated_at: string
        }
        Insert: {
          associado_id: string
          created_at?: string
          data_liberacao?: string | null
          dependente_id?: string | null
          id?: string
          procedimento: string
          status?: Database["public"]["Enums"]["status_carencia"]
          updated_at?: string
        }
        Update: {
          associado_id?: string
          created_at?: string
          data_liberacao?: string | null
          dependente_id?: string | null
          id?: string
          procedimento?: string
          status?: Database["public"]["Enums"]["status_carencia"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carencias_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carencias_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicas_parceiros: {
        Row: {
          ativo: boolean
          categorias: string[]
          cidade: string
          created_at: string
          email: string | null
          endereco: string | null
          especialidade: string | null
          especialidades: string[]
          estado: string | null
          horario_funcionamento: string | null
          horarios: Json
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          categorias?: string[]
          cidade: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          especialidades?: string[]
          estado?: string | null
          horario_funcionamento?: string | null
          horarios?: Json
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          categorias?: string[]
          cidade?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          especialidades?: string[]
          estado?: string | null
          horario_funcionamento?: string | null
          horarios?: Json
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      comunicados: {
        Row: {
          ativo: boolean
          cidade_alvo: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          mensagem: string
          segmento: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade_alvo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          mensagem: string
          segmento?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade_alvo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          mensagem?: string
          segmento?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      consentimentos: {
        Row: {
          aceito: boolean
          aceito_em: string
          associado_id: string | null
          created_at: string
          dependente_id: string | null
          id: string
          ip: string | null
          tipo: string
          user_agent: string | null
          versao: string
        }
        Insert: {
          aceito?: boolean
          aceito_em?: string
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          ip?: string | null
          tipo: string
          user_agent?: string | null
          versao?: string
        }
        Update: {
          aceito?: boolean
          aceito_em?: string
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          ip?: string | null
          tipo?: string
          user_agent?: string | null
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "consentimentos_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consentimentos_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      data_conflict_decisoes: {
        Row: {
          acao: string
          ator_email: string | null
          ator_user_id: string | null
          conflict_id: string
          created_at: string
          detalhes: Json
          id: string
          observacao: string | null
          valor_escolhido: string | null
        }
        Insert: {
          acao: string
          ator_email?: string | null
          ator_user_id?: string | null
          conflict_id: string
          created_at?: string
          detalhes?: Json
          id?: string
          observacao?: string | null
          valor_escolhido?: string | null
        }
        Update: {
          acao?: string
          ator_email?: string | null
          ator_user_id?: string | null
          conflict_id?: string
          created_at?: string
          detalhes?: Json
          id?: string
          observacao?: string | null
          valor_escolhido?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_conflict_decisoes_conflict_id_fkey"
            columns: ["conflict_id"]
            isOneToOne: false
            referencedRelation: "data_conflicts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_conflicts: {
        Row: {
          batch_id: string | null
          campo: string
          chave: string | null
          connector_id: string | null
          created_at: string
          detalhes: Json
          entidade: string
          id: string
          ignorar_ate: string | null
          observacao: string | null
          origem_sistema: string | null
          registro_id_a: string | null
          registro_id_b: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          row_id: string | null
          severidade: string
          status: string
          tipo: string
          updated_at: string
          valor_atual: string | null
          valor_escolhido: string | null
          valor_novo: string | null
        }
        Insert: {
          batch_id?: string | null
          campo: string
          chave?: string | null
          connector_id?: string | null
          created_at?: string
          detalhes?: Json
          entidade: string
          id?: string
          ignorar_ate?: string | null
          observacao?: string | null
          origem_sistema?: string | null
          registro_id_a?: string | null
          registro_id_b?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          row_id?: string | null
          severidade?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor_atual?: string | null
          valor_escolhido?: string | null
          valor_novo?: string | null
        }
        Update: {
          batch_id?: string | null
          campo?: string
          chave?: string | null
          connector_id?: string | null
          created_at?: string
          detalhes?: Json
          entidade?: string
          id?: string
          ignorar_ate?: string | null
          observacao?: string | null
          origem_sistema?: string | null
          registro_id_a?: string | null
          registro_id_b?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          row_id?: string | null
          severidade?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor_atual?: string | null
          valor_escolhido?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_conflicts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_conflicts_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_conflicts_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "import_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      dependentes: {
        Row: {
          assinatura_url: string | null
          associado_id: string
          ativo: boolean
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          nome: string
          status: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_dependente"]
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          associado_id: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_dependente"]
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          associado_id?: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_dependente"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependentes_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_associado: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tamanho: number | null
          arquivo_tipo: string | null
          associado_id: string
          ativo: boolean
          categoria: string
          created_at: string
          dependente_id: string | null
          descricao: string | null
          id: string
          publicado_em: string
          titulo: string
          updated_at: string
          visibilidade: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          associado_id: string
          ativo?: boolean
          categoria?: string
          created_at?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          publicado_em?: string
          titulo: string
          updated_at?: string
          visibilidade?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          associado_id?: string
          ativo?: boolean
          categoria?: string
          created_at?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          publicado_em?: string
          titulo?: string
          updated_at?: string
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_associado_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_associado_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_rsvps: {
        Row: {
          associado_id: string
          created_at: string
          dependente_id: string | null
          evento_id: string
          id: string
          matricula: string | null
          nome: string
          observacoes: string | null
          status: string
        }
        Insert: {
          associado_id: string
          created_at?: string
          dependente_id?: string | null
          evento_id: string
          id?: string
          matricula?: string | null
          nome: string
          observacoes?: string | null
          status?: string
        }
        Update: {
          associado_id?: string
          created_at?: string
          dependente_id?: string | null
          evento_id?: string
          id?: string
          matricula?: string | null
          nome?: string
          observacoes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_rsvps_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          ativo: boolean
          capacidade: number | null
          categoria: string
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          endereco: string | null
          id: string
          imagem_url: string | null
          local: string | null
          permite_rsvp: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          capacidade?: number | null
          categoria?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          permite_rsvp?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          capacidade?: number | null
          categoria?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          permite_rsvp?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          categoria: string
          created_at: string
          id: string
          ordem: number
          pergunta: string
          publicado: boolean
          resposta: string
          updated_at: string
          visualizacoes: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number
          pergunta: string
          publicado?: boolean
          resposta: string
          updated_at?: string
          visualizacoes?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number
          pergunta?: string
          publicado?: boolean
          resposta?: string
          updated_at?: string
          visualizacoes?: number
        }
        Relationships: []
      }
      field_mappings: {
        Row: {
          connector_id: string | null
          created_at: string
          created_by: string | null
          entidade: string
          id: string
          mapeamento: Json
          nome: string
          padrao: boolean
          updated_at: string
        }
        Insert: {
          connector_id?: string | null
          created_at?: string
          created_by?: string | null
          entidade: string
          id?: string
          mapeamento?: Json
          nome: string
          padrao?: boolean
          updated_at?: string
        }
        Update: {
          connector_id?: string | null
          created_at?: string
          created_by?: string | null
          entidade?: string
          id?: string
          mapeamento?: Json
          nome?: string
          padrao?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_mappings_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_limite: {
        Row: {
          associado_id: string
          created_at: string
          data_utilizacao: string
          dependente_id: string | null
          descricao: string | null
          id: string
          valor: number
        }
        Insert: {
          associado_id: string
          created_at?: string
          data_utilizacao?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          valor: number
        }
        Update: {
          associado_id?: string
          created_at?: string
          data_utilizacao?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_limite_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_limite_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          arquivo_nome: string
          arquivo_path: string | null
          arquivo_tamanho: number | null
          arquivo_tipo: string | null
          connector_id: string | null
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          entidade: string
          id: string
          mapeamento: Json
          observacoes: string | null
          origem: string
          pode_desfazer: boolean
          revertido_em: string | null
          revertido_por: string | null
          status: Database["public"]["Enums"]["import_batch_status"]
          tempo_processamento_ms: number | null
          total_duplicados: number
          total_erros: number
          total_ignorados: number
          total_importados: number
          total_recebidos: number
          total_validos: number
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path?: string | null
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          connector_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          entidade: string
          id?: string
          mapeamento?: Json
          observacoes?: string | null
          origem?: string
          pode_desfazer?: boolean
          revertido_em?: string | null
          revertido_por?: string | null
          status?: Database["public"]["Enums"]["import_batch_status"]
          tempo_processamento_ms?: number | null
          total_duplicados?: number
          total_erros?: number
          total_ignorados?: number
          total_importados?: number
          total_recebidos?: number
          total_validos?: number
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string | null
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          connector_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          entidade?: string
          id?: string
          mapeamento?: Json
          observacoes?: string | null
          origem?: string
          pode_desfazer?: boolean
          revertido_em?: string | null
          revertido_por?: string | null
          status?: Database["public"]["Enums"]["import_batch_status"]
          tempo_processamento_ms?: number | null
          total_duplicados?: number
          total_erros?: number
          total_ignorados?: number
          total_importados?: number
          total_recebidos?: number
          total_validos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      import_errors: {
        Row: {
          batch_id: string
          campo: string | null
          codigo: string
          created_at: string
          id: string
          linha: number | null
          mensagem: string
          row_id: string | null
          severidade: string
        }
        Insert: {
          batch_id: string
          campo?: string | null
          codigo?: string
          created_at?: string
          id?: string
          linha?: number | null
          mensagem: string
          row_id?: string | null
          severidade?: string
        }
        Update: {
          batch_id?: string
          campo?: string | null
          codigo?: string
          created_at?: string
          id?: string
          linha?: number | null
          mensagem?: string
          row_id?: string | null
          severidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_errors_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "import_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          acao: string | null
          batch_id: string
          chave: string | null
          created_at: string
          dados_normalizados: Json
          dados_originais: Json
          id: string
          linha: number
          mensagem: string | null
          registro_id: string | null
          status: Database["public"]["Enums"]["import_row_status"]
        }
        Insert: {
          acao?: string | null
          batch_id: string
          chave?: string | null
          created_at?: string
          dados_normalizados?: Json
          dados_originais?: Json
          id?: string
          linha: number
          mensagem?: string | null
          registro_id?: string | null
          status?: Database["public"]["Enums"]["import_row_status"]
        }
        Update: {
          acao?: string | null
          batch_id?: string
          chave?: string | null
          created_at?: string
          dados_normalizados?: Json
          dados_originais?: Json
          id?: string
          linha?: number
          mensagem?: string | null
          registro_id?: string | null
          status?: Database["public"]["Enums"]["import_row_status"]
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes_premiadas: {
        Row: {
          associado_email: string | null
          associado_matricula: string
          associado_nome: string
          created_at: string
          email_enviado: boolean
          id: string
          indicado_cidade: string | null
          indicado_cpf: string | null
          indicado_email: string | null
          indicado_nome: string
          indicado_telefone: string
          observacoes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          associado_email?: string | null
          associado_matricula: string
          associado_nome: string
          created_at?: string
          email_enviado?: boolean
          id?: string
          indicado_cidade?: string | null
          indicado_cpf?: string | null
          indicado_email?: string | null
          indicado_nome: string
          indicado_telefone: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          associado_email?: string | null
          associado_matricula?: string
          associado_nome?: string
          created_at?: string
          email_enviado?: boolean
          id?: string
          indicado_cidade?: string | null
          indicado_cpf?: string | null
          indicado_email?: string | null
          indicado_nome?: string
          indicado_telefone?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      informes_rendimentos: {
        Row: {
          ano: number
          arquivo_url: string | null
          associado_id: string
          created_at: string
          dependente_id: string | null
          id: string
        }
        Insert: {
          ano: number
          arquivo_url?: string | null
          associado_id: string
          created_at?: string
          dependente_id?: string | null
          id?: string
        }
        Update: {
          ano?: number
          arquivo_url?: string | null
          associado_id?: string
          created_at?: string
          dependente_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "informes_rendimentos_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informes_rendimentos_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connectors: {
        Row: {
          ativo: boolean
          codigo: string
          config: Json
          created_at: string
          descricao: string | null
          entidades: string[]
          id: string
          modulo: string
          nome: string
          secret_refs: string[]
          sistema: string
          status: Database["public"]["Enums"]["integration_status"]
          tipo_fonte: Database["public"]["Enums"]["integration_source_type"]
          ultima_sincronizacao: string | null
          ultimo_erro: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          config?: Json
          created_at?: string
          descricao?: string | null
          entidades?: string[]
          id?: string
          modulo?: string
          nome: string
          secret_refs?: string[]
          sistema: string
          status?: Database["public"]["Enums"]["integration_status"]
          tipo_fonte?: Database["public"]["Enums"]["integration_source_type"]
          ultima_sincronizacao?: string | null
          ultimo_erro?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          config?: Json
          created_at?: string
          descricao?: string | null
          entidades?: string[]
          id?: string
          modulo?: string
          nome?: string
          secret_refs?: string[]
          sistema?: string
          status?: Database["public"]["Enums"]["integration_status"]
          tipo_fonte?: Database["public"]["Enums"]["integration_source_type"]
          ultima_sincronizacao?: string | null
          ultimo_erro?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_runs: {
        Row: {
          connector_id: string | null
          created_at: string
          detalhes: Json
          duracao_ms: number | null
          executado_por: string | null
          executado_por_email: string | null
          finalizado_em: string | null
          id: string
          iniciado_em: string
          mensagem: string | null
          status: string
          tipo: string
        }
        Insert: {
          connector_id?: string | null
          created_at?: string
          detalhes?: Json
          duracao_ms?: number | null
          executado_por?: string | null
          executado_por_email?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          status?: string
          tipo?: string
        }
        Update: {
          connector_id?: string | null
          created_at?: string
          detalhes?: Json
          duracao_ms?: number | null
          executado_por?: string | null
          executado_por_email?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_runs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      limites: {
        Row: {
          associado_id: string
          created_at: string
          data_renovacao: string | null
          id: string
          limite_total: number
          limite_utilizado: number
          updated_at: string
        }
        Insert: {
          associado_id: string
          created_at?: string
          data_renovacao?: string | null
          id?: string
          limite_total?: number
          limite_utilizado?: number
          updated_at?: string
        }
        Update: {
          associado_id?: string
          created_at?: string
          data_renovacao?: string | null
          id?: string
          limite_total?: number
          limite_utilizado?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "limites_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
        ]
      }
      mensalidades: {
        Row: {
          associado_id: string
          boleto_url: string | null
          created_at: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          linha_digitavel: string | null
          observacoes: string | null
          pago_em: string | null
          referencia: string
          status: string
          tipo: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          associado_id: string
          boleto_url?: string | null
          created_at?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          linha_digitavel?: string | null
          observacoes?: string | null
          pago_em?: string | null
          referencia: string
          status?: string
          tipo?: string
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          associado_id?: string
          boleto_url?: string | null
          created_at?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          linha_digitavel?: string | null
          observacoes?: string | null
          pago_em?: string | null
          referencia?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          associado_id: string | null
          categoria: string
          corpo: string
          created_at: string
          dependente_id: string | null
          id: string
          lida: boolean
          read_at: string | null
          titulo: string
          url: string | null
        }
        Insert: {
          associado_id?: string | null
          categoria?: string
          corpo: string
          created_at?: string
          dependente_id?: string | null
          id?: string
          lida?: boolean
          read_at?: string | null
          titulo: string
          url?: string | null
        }
        Update: {
          associado_id?: string | null
          categoria?: string
          corpo?: string
          created_at?: string
          dependente_id?: string | null
          id?: string
          lida?: boolean
          read_at?: string | null
          titulo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      peculio_solicitacoes: {
        Row: {
          associado_email: string | null
          associado_matricula: string
          associado_nome: string
          associado_telefone: string | null
          beneficiarios: Json
          created_at: string
          id: string
          observacoes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          associado_email?: string | null
          associado_matricula: string
          associado_nome: string
          associado_telefone?: string | null
          beneficiarios: Json
          created_at?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          associado_email?: string | null
          associado_matricula?: string
          associado_nome?: string
          associado_telefone?: string | null
          beneficiarios?: Json
          created_at?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      perfil_permissoes: {
        Row: {
          acao: Database["public"]["Enums"]["perm_acao"]
          created_at: string
          id: string
          modulo: string
          pagina: string
          perfil_codigo: string
        }
        Insert: {
          acao: Database["public"]["Enums"]["perm_acao"]
          created_at?: string
          id?: string
          modulo: string
          pagina?: string
          perfil_codigo: string
        }
        Update: {
          acao?: Database["public"]["Enums"]["perm_acao"]
          created_at?: string
          id?: string
          modulo?: string
          pagina?: string
          perfil_codigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_permissoes_perfil_codigo_fkey"
            columns: ["perfil_codigo"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["codigo"]
          },
        ]
      }
      perfis: {
        Row: {
          codigo: string
          created_at: string
          descricao: string | null
          gerencia_usuarios: boolean
          interno: boolean
          nivel: number
          nome: string
          somente_leitura: boolean
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          descricao?: string | null
          gerencia_usuarios?: boolean
          interno?: boolean
          nivel?: number
          nome: string
          somente_leitura?: boolean
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          descricao?: string | null
          gerencia_usuarios?: boolean
          interno?: boolean
          nivel?: number
          nome?: string
          somente_leitura?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      previdencia_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          associado_id: string | null
          created_at: string
          dependente_id: string | null
          id: string
          token: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          token: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          id?: string
          token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_tokens_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_identidades: {
        Row: {
          alterado_manualmente: boolean
          alterado_manualmente_em: string | null
          codigo_associado: string | null
          codigo_externo: string | null
          connector_id: string | null
          cpf: string | null
          created_at: string
          divergencia_pendente: boolean
          entidade: string
          id: string
          identificador_institucional: string | null
          matricula: string | null
          observacao: string | null
          origem: string
          registro_id: string | null
          situacao_sync: string
          titular_identificador: string | null
          titular_registro_id: string | null
          ultima_sincronizacao: string | null
          updated_at: string
          validado: boolean
          validado_em: string | null
          validado_por: string | null
        }
        Insert: {
          alterado_manualmente?: boolean
          alterado_manualmente_em?: string | null
          codigo_associado?: string | null
          codigo_externo?: string | null
          connector_id?: string | null
          cpf?: string | null
          created_at?: string
          divergencia_pendente?: boolean
          entidade: string
          id?: string
          identificador_institucional?: string | null
          matricula?: string | null
          observacao?: string | null
          origem?: string
          registro_id?: string | null
          situacao_sync?: string
          titular_identificador?: string | null
          titular_registro_id?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          validado?: boolean
          validado_em?: string | null
          validado_por?: string | null
        }
        Update: {
          alterado_manualmente?: boolean
          alterado_manualmente_em?: string | null
          codigo_associado?: string | null
          codigo_externo?: string | null
          connector_id?: string | null
          cpf?: string | null
          created_at?: string
          divergencia_pendente?: boolean
          entidade?: string
          id?: string
          identificador_institucional?: string | null
          matricula?: string | null
          observacao?: string | null
          origem?: string
          registro_id?: string | null
          situacao_sync?: string
          titular_identificador?: string | null
          titular_registro_id?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          validado?: boolean
          validado_em?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_identidades_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      resposta_templates: {
        Row: {
          ativo: boolean
          categoria: string | null
          conteudo: string
          created_at: string
          created_by: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          conteudo: string
          created_at?: string
          created_by?: string | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          conteudo?: string
          created_at?: string
          created_by?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      sistema_config: {
        Row: {
          chave: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      solicitacoes: {
        Row: {
          anexos: Json | null
          associado_id: string
          assunto: string
          categoria: string
          created_at: string
          dependente_id: string | null
          descricao: string
          id: string
          metadata: Json | null
          prioridade: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          sla_prazo: string | null
          solicitante_nome: string
          solicitante_tipo: string
          status: string
          updated_at: string
        }
        Insert: {
          anexos?: Json | null
          associado_id: string
          assunto: string
          categoria: string
          created_at?: string
          dependente_id?: string | null
          descricao: string
          id?: string
          metadata?: Json | null
          prioridade?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          sla_prazo?: string | null
          solicitante_nome: string
          solicitante_tipo?: string
          status?: string
          updated_at?: string
        }
        Update: {
          anexos?: Json | null
          associado_id?: string
          assunto?: string
          categoria?: string
          created_at?: string
          dependente_id?: string | null
          descricao?: string
          id?: string
          metadata?: Json | null
          prioridade?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          sla_prazo?: string | null
          solicitante_nome?: string
          solicitante_tipo?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_privacidade: {
        Row: {
          associado_id: string | null
          created_at: string
          dependente_id: string | null
          descricao: string | null
          id: string
          ip: string | null
          resposta: string | null
          solicitante_documento: string | null
          solicitante_email: string | null
          solicitante_nome: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          ip?: string | null
          resposta?: string | null
          solicitante_documento?: string | null
          solicitante_email?: string | null
          solicitante_nome?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          associado_id?: string | null
          created_at?: string
          dependente_id?: string | null
          descricao?: string | null
          id?: string
          ip?: string | null
          resposta?: string | null
          solicitante_documento?: string | null
          solicitante_email?: string | null
          solicitante_nome?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_privacidade_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_privacidade_dependente_id_fkey"
            columns: ["dependente_id"]
            isOneToOne: false
            referencedRelation: "dependentes"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          detalhes: Json | null
          finalizado_em: string | null
          id: string
          iniciado_em: string
          mensagem: string | null
          registros_atualizados: number | null
          registros_inseridos: number | null
          registros_processados: number | null
          source_id: string | null
          status: string
        }
        Insert: {
          detalhes?: Json | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          registros_atualizados?: number | null
          registros_inseridos?: number | null
          registros_processados?: number | null
          source_id?: string | null
          status: string
        }
        Update: {
          detalhes?: Json | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          registros_atualizados?: number | null
          registros_inseridos?: number | null
          registros_processados?: number | null
          source_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sync_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_sources: {
        Row: {
          ativo: boolean
          auth_header_name: string | null
          auth_tipo: string
          auth_token: string | null
          body_template: Json | null
          campo_chave: string
          created_at: string
          entidade: string
          frequencia: string
          headers_extras: Json | null
          id: string
          mapeamento: Json
          metodo: string
          nome: string
          response_path: string | null
          ultima_sincronizacao: string | null
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          auth_header_name?: string | null
          auth_tipo?: string
          auth_token?: string | null
          body_template?: Json | null
          campo_chave?: string
          created_at?: string
          entidade: string
          frequencia?: string
          headers_extras?: Json | null
          id?: string
          mapeamento?: Json
          metodo?: string
          nome: string
          response_path?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          auth_header_name?: string | null
          auth_tipo?: string
          auth_token?: string | null
          body_template?: Json | null
          campo_chave?: string
          created_at?: string
          entidade?: string
          frequencia?: string
          headers_extras?: Json | null
          id?: string
          mapeamento?: Json
          metodo?: string
          nome?: string
          response_path?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      synchronization_logs: {
        Row: {
          connector_id: string | null
          detalhes: Json
          entidade: string | null
          finalizado_em: string | null
          id: string
          iniciado_em: string
          mensagem: string | null
          registros_atualizados: number
          registros_ignorados: number
          registros_inseridos: number
          registros_processados: number
          registros_recebidos: number
          run_id: string | null
          status: string
        }
        Insert: {
          connector_id?: string | null
          detalhes?: Json
          entidade?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          registros_atualizados?: number
          registros_ignorados?: number
          registros_inseridos?: number
          registros_processados?: number
          registros_recebidos?: number
          run_id?: string | null
          status?: string
        }
        Update: {
          connector_id?: string | null
          detalhes?: Json
          entidade?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          registros_atualizados?: number
          registros_ignorados?: number
          registros_inseridos?: number
          registros_processados?: number
          registros_recebidos?: number
          run_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "synchronization_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synchronization_logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "integration_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuario_permissoes: {
        Row: {
          acao: Database["public"]["Enums"]["perm_acao"]
          concedido: boolean
          concedido_por: string | null
          created_at: string
          id: string
          modulo: string
          pagina: string
          user_id: string
        }
        Insert: {
          acao: Database["public"]["Enums"]["perm_acao"]
          concedido?: boolean
          concedido_por?: string | null
          created_at?: string
          id?: string
          modulo: string
          pagina?: string
          user_id: string
        }
        Update: {
          acao?: Database["public"]["Enums"]["perm_acao"]
          concedido?: boolean
          concedido_por?: string | null
          created_at?: string
          id?: string
          modulo?: string
          pagina?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios_internos"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usuarios_internos: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          email: string
          nome: string
          observacoes: string | null
          perfil_codigo: string
          setor: string | null
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          email: string
          nome: string
          observacoes?: string | null
          perfil_codigo: string
          setor?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          email?: string
          nome?: string
          observacoes?: string | null
          perfil_codigo?: string
          setor?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_internos_perfil_codigo_fkey"
            columns: ["perfil_codigo"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["codigo"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          ativo: boolean
          created_at: string
          entidade: string
          id: string
          nome: string
          secret_token: string
          slug: string
          total_chamadas: number
          ultima_chamada: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          entidade: string
          id?: string
          nome: string
          secret_token: string
          slug: string
          total_chamadas?: number
          ultima_chamada?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          entidade?: string
          id?: string
          nome?: string
          secret_token?: string
          slug?: string
          total_chamadas?: number
          ultima_chamada?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      detectar_inconsistencias: {
        Args: never
        Returns: {
          criadas: number
          tipo: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_interno: { Args: { _user_id: string }; Returns: boolean }
      is_previdencia_admin: { Args: { _user_id: string }; Returns: boolean }
      meu_historico_acessos: {
        Args: {
          _associado_id: string
          _dependente_id?: string
          _limit?: number
        }
        Returns: {
          created_at: string
          id: string
          ip: string
          metodo_login: string
          sucesso: boolean
          tipo_usuario: string
          user_agent: string
        }[]
      }
      perfil_ativo: { Args: { _user_id: string }; Returns: string }
      pode_gerenciar_usuarios: { Args: { _user_id: string }; Returns: boolean }
      registrar_acesso_interno: { Args: never; Returns: undefined }
      tem_permissao: {
        Args: {
          _acao: Database["public"]["Enums"]["perm_acao"]
          _modulo: string
          _pagina?: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      import_batch_status:
        | "rascunho"
        | "validando"
        | "validado"
        | "importando"
        | "concluido"
        | "erro"
        | "revertido"
        | "cancelado"
      import_row_status:
        | "pendente"
        | "valido"
        | "duplicado"
        | "erro"
        | "importado"
        | "ignorado"
        | "revertido"
      integration_source_type:
        | "api"
        | "banco"
        | "planilha"
        | "csv"
        | "arquivo"
        | "exportacao_manual"
        | "intermediaria"
        | "indefinido"
      integration_status:
        | "nao_configurado"
        | "em_configuracao"
        | "conectado"
        | "sincronizando"
        | "com_erro"
        | "pausado"
      perm_acao:
        | "visualizar"
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "exportar"
        | "configurar"
      status_carencia: "liberado" | "em_carencia"
      tipo_dependente: "conjuge" | "filho" | "pai_mae" | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      import_batch_status: [
        "rascunho",
        "validando",
        "validado",
        "importando",
        "concluido",
        "erro",
        "revertido",
        "cancelado",
      ],
      import_row_status: [
        "pendente",
        "valido",
        "duplicado",
        "erro",
        "importado",
        "ignorado",
        "revertido",
      ],
      integration_source_type: [
        "api",
        "banco",
        "planilha",
        "csv",
        "arquivo",
        "exportacao_manual",
        "intermediaria",
        "indefinido",
      ],
      integration_status: [
        "nao_configurado",
        "em_configuracao",
        "conectado",
        "sincronizando",
        "com_erro",
        "pausado",
      ],
      perm_acao: [
        "visualizar",
        "criar",
        "editar",
        "excluir",
        "aprovar",
        "exportar",
        "configurar",
      ],
      status_carencia: ["liberado", "em_carencia"],
      tipo_dependente: ["conjuge", "filho", "pai_mae", "outro"],
    },
  },
} as const
