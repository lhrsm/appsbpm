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
          criticidade: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          ip_address: string | null
          justificativa: string | null
          modulo: string | null
          operacao_id: string | null
          origem: string
          perfil: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          valor_anterior: Json | null
          valor_posterior: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          criticidade?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          justificativa?: string | null
          modulo?: string | null
          operacao_id?: string | null
          origem?: string
          perfil?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          valor_anterior?: Json | null
          valor_posterior?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          criticidade?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          justificativa?: string | null
          modulo?: string | null
          operacao_id?: string | null
          origem?: string
          perfil?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          valor_anterior?: Json | null
          valor_posterior?: Json | null
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
      ctb_conciliacoes: {
        Row: {
          conciliado_em: string | null
          conciliado_por: string | null
          conta_id: string | null
          created_at: string
          diferenca: number
          id: string
          observacoes: string | null
          periodo_id: string | null
          referencia: string | null
          saldo_contabil: number
          saldo_externo: number
          status: string
          updated_at: string
        }
        Insert: {
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta_id?: string | null
          created_at?: string
          diferenca?: number
          id?: string
          observacoes?: string | null
          periodo_id?: string | null
          referencia?: string | null
          saldo_contabil?: number
          saldo_externo?: number
          status?: string
          updated_at?: string
        }
        Update: {
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta_id?: string | null
          created_at?: string
          diferenca?: number
          id?: string
          observacoes?: string | null
          periodo_id?: string | null
          referencia?: string | null
          saldo_contabil?: number
          saldo_externo?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctb_conciliacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_conciliacoes_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "ctb_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_config: {
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
      ctb_exercicios: {
        Row: {
          ano: number
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          observacoes: string | null
          situacao: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          observacoes?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          observacoes?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at?: string
        }
        Relationships: []
      }
      ctb_fechamentos: {
        Row: {
          created_at: string
          fechado_em: string | null
          id: string
          observacoes: string | null
          periodo_id: string
          reaberto_em: string | null
          reaberto_justificativa: string | null
          responsavel_email: string | null
          responsavel_user_id: string | null
          situacao: Database["public"]["Enums"]["ctb_situacao_periodo"]
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fechado_em?: string | null
          id?: string
          observacoes?: string | null
          periodo_id: string
          reaberto_em?: string | null
          reaberto_justificativa?: string | null
          responsavel_email?: string | null
          responsavel_user_id?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fechado_em?: string | null
          id?: string
          observacoes?: string | null
          periodo_id?: string
          reaberto_em?: string | null
          reaberto_justificativa?: string | null
          responsavel_email?: string | null
          responsavel_user_id?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctb_fechamentos_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "ctb_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_integracao_mapeamentos: {
        Row: {
          ativo: boolean
          condicoes: Json
          conta_credito_id: string | null
          conta_debito_id: string | null
          created_at: string
          descricao: string
          evento: Database["public"]["Enums"]["ctb_origem"]
          historico_padrao: string | null
          id: string
          updated_at: string
          validado: boolean
          validado_em: string | null
          validado_por: string | null
        }
        Insert: {
          ativo?: boolean
          condicoes?: Json
          conta_credito_id?: string | null
          conta_debito_id?: string | null
          created_at?: string
          descricao: string
          evento: Database["public"]["Enums"]["ctb_origem"]
          historico_padrao?: string | null
          id?: string
          updated_at?: string
          validado?: boolean
          validado_em?: string | null
          validado_por?: string | null
        }
        Update: {
          ativo?: boolean
          condicoes?: Json
          conta_credito_id?: string | null
          conta_debito_id?: string | null
          created_at?: string
          descricao?: string
          evento?: Database["public"]["Enums"]["ctb_origem"]
          historico_padrao?: string | null
          id?: string
          updated_at?: string
          validado?: boolean
          validado_em?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ctb_integracao_mapeamentos_conta_credito_id_fkey"
            columns: ["conta_credito_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_integracao_mapeamentos_conta_debito_id_fkey"
            columns: ["conta_debito_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_lancamento_historico: {
        Row: {
          acao: string
          ator_email: string | null
          ator_user_id: string | null
          created_at: string
          detalhes: Json
          id: string
          justificativa: string | null
          lancamento_id: string
          status_anterior: Database["public"]["Enums"]["ctb_lanc_status"] | null
          status_novo: Database["public"]["Enums"]["ctb_lanc_status"] | null
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          acao: string
          ator_email?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          justificativa?: string | null
          lancamento_id: string
          status_anterior?:
            | Database["public"]["Enums"]["ctb_lanc_status"]
            | null
          status_novo?: Database["public"]["Enums"]["ctb_lanc_status"] | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          acao?: string
          ator_email?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          justificativa?: string | null
          lancamento_id?: string
          status_anterior?:
            | Database["public"]["Enums"]["ctb_lanc_status"]
            | null
          status_novo?: Database["public"]["Enums"]["ctb_lanc_status"] | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ctb_lancamento_historico_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "ctb_lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_lancamentos: {
        Row: {
          centro_custo_id: string | null
          competencia: string
          conta_credito_id: string | null
          conta_debito_id: string | null
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          data: string
          documento: string | null
          estorno_de: string | null
          historico: string
          id: string
          justificativa: string | null
          lote_id: string | null
          origem: Database["public"]["Enums"]["ctb_origem"]
          origem_referencia: string | null
          periodo_id: string | null
          simulacao: boolean
          status: Database["public"]["Enums"]["ctb_lanc_status"]
          updated_at: string
          valor: number
        }
        Insert: {
          centro_custo_id?: string | null
          competencia: string
          conta_credito_id?: string | null
          conta_debito_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data?: string
          documento?: string | null
          estorno_de?: string | null
          historico: string
          id?: string
          justificativa?: string | null
          lote_id?: string | null
          origem?: Database["public"]["Enums"]["ctb_origem"]
          origem_referencia?: string | null
          periodo_id?: string | null
          simulacao?: boolean
          status?: Database["public"]["Enums"]["ctb_lanc_status"]
          updated_at?: string
          valor?: number
        }
        Update: {
          centro_custo_id?: string | null
          competencia?: string
          conta_credito_id?: string | null
          conta_debito_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data?: string
          documento?: string | null
          estorno_de?: string | null
          historico?: string
          id?: string
          justificativa?: string | null
          lote_id?: string | null
          origem?: Database["public"]["Enums"]["ctb_origem"]
          origem_referencia?: string | null
          periodo_id?: string | null
          simulacao?: boolean
          status?: Database["public"]["Enums"]["ctb_lanc_status"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ctb_lancamentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "fin_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_lancamentos_conta_credito_id_fkey"
            columns: ["conta_credito_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_lancamentos_conta_debito_id_fkey"
            columns: ["conta_debito_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_lancamentos_estorno_de_fkey"
            columns: ["estorno_de"]
            isOneToOne: false
            referencedRelation: "ctb_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_lancamentos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "ctb_lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctb_lancamentos_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "ctb_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_lotes: {
        Row: {
          competencia: string
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          descricao: string
          id: string
          numero: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["ctb_origem"]
          periodo_id: string | null
          simulacao: boolean
          status: Database["public"]["Enums"]["ctb_lote_status"]
          updated_at: string
        }
        Insert: {
          competencia: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          descricao: string
          id?: string
          numero?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["ctb_origem"]
          periodo_id?: string | null
          simulacao?: boolean
          status?: Database["public"]["Enums"]["ctb_lote_status"]
          updated_at?: string
        }
        Update: {
          competencia?: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          descricao?: string
          id?: string
          numero?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["ctb_origem"]
          periodo_id?: string | null
          simulacao?: boolean
          status?: Database["public"]["Enums"]["ctb_lote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctb_lotes_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "ctb_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_periodos: {
        Row: {
          competencia: string
          created_at: string
          data_fim: string
          data_inicio: string
          exercicio_id: string
          id: string
          observacoes: string | null
          situacao: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at: string
        }
        Insert: {
          competencia: string
          created_at?: string
          data_fim: string
          data_inicio: string
          exercicio_id: string
          id?: string
          observacoes?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at?: string
        }
        Update: {
          competencia?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          exercicio_id?: string
          id?: string
          observacoes?: string | null
          situacao?: Database["public"]["Enums"]["ctb_situacao_periodo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctb_periodos_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "ctb_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      ctb_plano_contas: {
        Row: {
          aceita_lancamento: boolean
          ativa: boolean
          codigo: string
          created_at: string
          id: string
          natureza: Database["public"]["Enums"]["ctb_natureza"]
          nivel: number
          nome: string
          observacoes: string | null
          parent_id: string | null
          tipo: Database["public"]["Enums"]["ctb_conta_tipo"]
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          aceita_lancamento?: boolean
          ativa?: boolean
          codigo: string
          created_at?: string
          id?: string
          natureza: Database["public"]["Enums"]["ctb_natureza"]
          nivel?: number
          nome: string
          observacoes?: string | null
          parent_id?: string | null
          tipo: Database["public"]["Enums"]["ctb_conta_tipo"]
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          aceita_lancamento?: boolean
          ativa?: boolean
          codigo?: string
          created_at?: string
          id?: string
          natureza?: Database["public"]["Enums"]["ctb_natureza"]
          nivel?: number
          nome?: string
          observacoes?: string | null
          parent_id?: string | null
          tipo?: Database["public"]["Enums"]["ctb_conta_tipo"]
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ctb_plano_contas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ctb_plano_contas"
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
      fin_caixas: {
        Row: {
          ativo: boolean
          created_at: string
          demo: boolean
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          saldo_inicial: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          demo?: boolean
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          saldo_inicial?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          demo?: boolean
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          saldo_inicial?: number
          updated_at?: string
        }
        Relationships: []
      }
      fin_categorias: {
        Row: {
          ativo: boolean
          created_at: string
          demo: boolean
          id: string
          natureza: Database["public"]["Enums"]["fin_natureza"]
          nome: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          demo?: boolean
          id?: string
          natureza: Database["public"]["Enums"]["fin_natureza"]
          nome: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          demo?: boolean
          id?: string
          natureza?: Database["public"]["Enums"]["fin_natureza"]
          nome?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_categorias_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_centros_custo: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          demo: boolean
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          demo?: boolean
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          demo?: boolean
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_contas_bancarias: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          conta: string | null
          created_at: string
          demo: boolean
          id: string
          nome: string
          observacoes: string | null
          saldo_inicial: number
          tipo: Database["public"]["Enums"]["fin_conta_tipo"]
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          created_at?: string
          demo?: boolean
          id?: string
          nome: string
          observacoes?: string | null
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["fin_conta_tipo"]
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          created_at?: string
          demo?: boolean
          id?: string
          nome?: string
          observacoes?: string | null
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["fin_conta_tipo"]
          updated_at?: string
        }
        Relationships: []
      }
      fin_fornecedores: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          chave_pix: string | null
          conta: string | null
          created_at: string
          demo: boolean
          documento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          chave_pix?: string | null
          conta?: string | null
          created_at?: string
          demo?: boolean
          documento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          chave_pix?: string | null
          conta?: string | null
          created_at?: string
          demo?: boolean
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fin_lancamento_historico: {
        Row: {
          acao: string
          ator_email: string | null
          ator_user_id: string | null
          created_at: string
          detalhes: Json
          id: string
          justificativa: string | null
          lancamento_id: string
          status_anterior: Database["public"]["Enums"]["fin_status"] | null
          status_novo: Database["public"]["Enums"]["fin_status"] | null
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          acao: string
          ator_email?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          justificativa?: string | null
          lancamento_id: string
          status_anterior?: Database["public"]["Enums"]["fin_status"] | null
          status_novo?: Database["public"]["Enums"]["fin_status"] | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          acao?: string
          ator_email?: string | null
          ator_user_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          justificativa?: string | null
          lancamento_id?: string
          status_anterior?: Database["public"]["Enums"]["fin_status"] | null
          status_novo?: Database["public"]["Enums"]["fin_status"] | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_lancamento_historico_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "fin_lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_lancamentos: {
        Row: {
          anexos: Json
          aprovado_em: string | null
          aprovado_por: string | null
          associado_id: string | null
          caixa_id: string | null
          categoria_id: string | null
          centro_custo_id: string | null
          competencia: string
          conta_id: string | null
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          demo: boolean
          descricao: string
          documento: string | null
          estorno_de: string | null
          forma_pagamento: string | null
          fornecedor_id: string | null
          id: string
          justificativa: string | null
          natureza: Database["public"]["Enums"]["fin_natureza"]
          observacoes: string | null
          pago_em: string | null
          recorrencia_grupo: string | null
          recorrente: boolean
          status: Database["public"]["Enums"]["fin_status"]
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          anexos?: Json
          aprovado_em?: string | null
          aprovado_por?: string | null
          associado_id?: string | null
          caixa_id?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          competencia?: string
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          demo?: boolean
          descricao: string
          documento?: string | null
          estorno_de?: string | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          justificativa?: string | null
          natureza: Database["public"]["Enums"]["fin_natureza"]
          observacoes?: string | null
          pago_em?: string | null
          recorrencia_grupo?: string | null
          recorrente?: boolean
          status?: Database["public"]["Enums"]["fin_status"]
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          anexos?: Json
          aprovado_em?: string | null
          aprovado_por?: string | null
          associado_id?: string | null
          caixa_id?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          competencia?: string
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          demo?: boolean
          descricao?: string
          documento?: string | null
          estorno_de?: string | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          justificativa?: string | null
          natureza?: Database["public"]["Enums"]["fin_natureza"]
          observacoes?: string | null
          pago_em?: string | null
          recorrencia_grupo?: string | null
          recorrente?: boolean
          status?: Database["public"]["Enums"]["fin_status"]
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_lancamentos_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "fin_caixas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "fin_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "fin_contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_estorno_de_fkey"
            columns: ["estorno_de"]
            isOneToOne: false
            referencedRelation: "fin_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fin_fornecedores"
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
      pat_baixas: {
        Row: {
          aprovacao: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em: string | null
          aprovado_por: string | null
          bem_id: string
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          data_baixa: string
          documentos: Json
          id: string
          justificativa: string
          motivo: string
          updated_at: string
          valor_residual: number
        }
        Insert: {
          aprovacao?: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em?: string | null
          aprovado_por?: string | null
          bem_id: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_baixa?: string
          documentos?: Json
          id?: string
          justificativa: string
          motivo: string
          updated_at?: string
          valor_residual?: number
        }
        Update: {
          aprovacao?: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em?: string | null
          aprovado_por?: string | null
          bem_id?: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_baixa?: string
          documentos?: Json
          id?: string
          justificativa?: string
          motivo?: string
          updated_at?: string
          valor_residual?: number
        }
        Relationships: [
          {
            foreignKeyName: "pat_baixas_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_bem_historico: {
        Row: {
          acao: string
          ator_user_id: string | null
          bem_id: string
          created_at: string
          detalhes: Json
          id: string
          status_anterior: Database["public"]["Enums"]["pat_status"] | null
          status_novo: Database["public"]["Enums"]["pat_status"] | null
        }
        Insert: {
          acao: string
          ator_user_id?: string | null
          bem_id: string
          created_at?: string
          detalhes?: Json
          id?: string
          status_anterior?: Database["public"]["Enums"]["pat_status"] | null
          status_novo?: Database["public"]["Enums"]["pat_status"] | null
        }
        Update: {
          acao?: string
          ator_user_id?: string | null
          bem_id?: string
          created_at?: string
          detalhes?: Json
          id?: string
          status_anterior?: Database["public"]["Enums"]["pat_status"] | null
          status_novo?: Database["public"]["Enums"]["pat_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pat_bem_historico_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_bens: {
        Row: {
          categoria_id: string | null
          codigo_interno: string | null
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          data_aquisicao: string | null
          demo: boolean
          descricao: string
          documentos: Json
          estado_conservacao: Database["public"]["Enums"]["pat_conservacao"]
          fornecedor_id: string | null
          fornecedor_nome: string | null
          fotos: Json
          id: string
          localizacao: string | null
          marca: string | null
          modelo: string | null
          nota_fiscal: string | null
          numero_patrimonial: string
          numero_serie: string | null
          observacoes: string | null
          qr_token: string
          responsavel_id: string | null
          setor_id: string | null
          status: Database["public"]["Enums"]["pat_status"]
          taxa_depreciacao: number
          unidade_id: string | null
          updated_at: string
          valor: number
          vida_util_meses: number | null
        }
        Insert: {
          categoria_id?: string | null
          codigo_interno?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_aquisicao?: string | null
          demo?: boolean
          descricao: string
          documentos?: Json
          estado_conservacao?: Database["public"]["Enums"]["pat_conservacao"]
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          fotos?: Json
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nota_fiscal?: string | null
          numero_patrimonial: string
          numero_serie?: string | null
          observacoes?: string | null
          qr_token?: string
          responsavel_id?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["pat_status"]
          taxa_depreciacao?: number
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vida_util_meses?: number | null
        }
        Update: {
          categoria_id?: string | null
          codigo_interno?: string | null
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_aquisicao?: string | null
          demo?: boolean
          descricao?: string
          documentos?: Json
          estado_conservacao?: Database["public"]["Enums"]["pat_conservacao"]
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          fotos?: Json
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nota_fiscal?: string | null
          numero_patrimonial?: string
          numero_serie?: string | null
          observacoes?: string | null
          qr_token?: string
          responsavel_id?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["pat_status"]
          taxa_depreciacao?: number
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vida_util_meses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pat_bens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "pat_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_bens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fin_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_bens_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pat_responsaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_bens_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "pat_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_bens_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_categorias: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          taxa_depreciacao: number
          updated_at: string
          vida_util_meses: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          taxa_depreciacao?: number
          updated_at?: string
          vida_util_meses?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          taxa_depreciacao?: number
          updated_at?: string
          vida_util_meses?: number | null
        }
        Relationships: []
      }
      pat_config: {
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
      pat_inventario_itens: {
        Row: {
          bem_id: string | null
          conferido_em: string | null
          conferido_por: string | null
          created_at: string
          descricao_avulsa: string | null
          divergencia: string | null
          id: string
          inventario_id: string
          numero_avulso: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["pat_item_status"]
        }
        Insert: {
          bem_id?: string | null
          conferido_em?: string | null
          conferido_por?: string | null
          created_at?: string
          descricao_avulsa?: string | null
          divergencia?: string | null
          id?: string
          inventario_id: string
          numero_avulso?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["pat_item_status"]
        }
        Update: {
          bem_id?: string | null
          conferido_em?: string | null
          conferido_por?: string | null
          created_at?: string
          descricao_avulsa?: string | null
          divergencia?: string | null
          id?: string
          inventario_id?: string
          numero_avulso?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["pat_item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "pat_inventario_itens_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_inventario_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "pat_inventarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_inventarios: {
        Row: {
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          setor_id: string | null
          status: Database["public"]["Enums"]["pat_inv_status"]
          titulo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["pat_inv_status"]
          titulo: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["pat_inv_status"]
          titulo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_inventarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "pat_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_inventarios_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_manutencoes: {
        Row: {
          anexos: Json
          bem_id: string
          created_at: string
          criado_por: string | null
          custo: number
          data_abertura: string
          data_conclusao: string | null
          data_prevista: string | null
          descricao: string
          fornecedor_nome: string | null
          id: string
          observacoes: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          anexos?: Json
          bem_id: string
          created_at?: string
          criado_por?: string | null
          custo?: number
          data_abertura?: string
          data_conclusao?: string | null
          data_prevista?: string | null
          descricao: string
          fornecedor_nome?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          anexos?: Json
          bem_id?: string
          created_at?: string
          criado_por?: string | null
          custo?: number
          data_abertura?: string
          data_conclusao?: string | null
          data_prevista?: string | null
          descricao?: string
          fornecedor_nome?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_manutencoes_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_movimentacoes: {
        Row: {
          aprovacao: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em: string | null
          aprovado_por: string | null
          bem_id: string
          created_at: string
          criado_por: string | null
          criado_por_email: string | null
          data_movimentacao: string
          destino_local: string | null
          destino_setor_id: string | null
          destino_unidade_id: string | null
          evidencias: Json
          id: string
          motivo: string
          observacoes: string | null
          origem_local: string | null
          origem_setor_id: string | null
          origem_unidade_id: string | null
          responsavel_anterior_id: string | null
          responsavel_novo_id: string | null
          termo_gerado: boolean
          termo_path: string | null
          tipo: Database["public"]["Enums"]["pat_mov_tipo"]
          updated_at: string
        }
        Insert: {
          aprovacao?: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em?: string | null
          aprovado_por?: string | null
          bem_id: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_movimentacao?: string
          destino_local?: string | null
          destino_setor_id?: string | null
          destino_unidade_id?: string | null
          evidencias?: Json
          id?: string
          motivo: string
          observacoes?: string | null
          origem_local?: string | null
          origem_setor_id?: string | null
          origem_unidade_id?: string | null
          responsavel_anterior_id?: string | null
          responsavel_novo_id?: string | null
          termo_gerado?: boolean
          termo_path?: string | null
          tipo?: Database["public"]["Enums"]["pat_mov_tipo"]
          updated_at?: string
        }
        Update: {
          aprovacao?: Database["public"]["Enums"]["pat_aprovacao"]
          aprovado_em?: string | null
          aprovado_por?: string | null
          bem_id?: string
          created_at?: string
          criado_por?: string | null
          criado_por_email?: string | null
          data_movimentacao?: string
          destino_local?: string | null
          destino_setor_id?: string | null
          destino_unidade_id?: string | null
          evidencias?: Json
          id?: string
          motivo?: string
          observacoes?: string | null
          origem_local?: string | null
          origem_setor_id?: string | null
          origem_unidade_id?: string | null
          responsavel_anterior_id?: string | null
          responsavel_novo_id?: string | null
          termo_gerado?: boolean
          termo_path?: string | null
          tipo?: Database["public"]["Enums"]["pat_mov_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_movimentacoes_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_destino_setor_id_fkey"
            columns: ["destino_setor_id"]
            isOneToOne: false
            referencedRelation: "pat_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_destino_unidade_id_fkey"
            columns: ["destino_unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_origem_setor_id_fkey"
            columns: ["origem_setor_id"]
            isOneToOne: false
            referencedRelation: "pat_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_origem_unidade_id_fkey"
            columns: ["origem_unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_responsavel_anterior_id_fkey"
            columns: ["responsavel_anterior_id"]
            isOneToOne: false
            referencedRelation: "pat_responsaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_movimentacoes_responsavel_novo_id_fkey"
            columns: ["responsavel_novo_id"]
            isOneToOne: false
            referencedRelation: "pat_responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_ocorrencias: {
        Row: {
          bem_id: string
          created_at: string
          descricao: string
          id: string
          informante_contato: string | null
          informante_nome: string | null
          origem: string
          resposta: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          bem_id: string
          created_at?: string
          descricao: string
          id?: string
          informante_contato?: string | null
          informante_nome?: string | null
          origem?: string
          resposta?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          bem_id?: string
          created_at?: string
          descricao?: string
          id?: string
          informante_contato?: string | null
          informante_nome?: string | null
          origem?: string
          resposta?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_ocorrencias_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_responsaveis: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          matricula: string | null
          nome: string
          setor_id: string | null
          telefone: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string | null
          nome: string
          setor_id?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string | null
          nome?: string
          setor_id?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_responsaveis_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "pat_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_responsaveis_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_setores: {
        Row: {
          ativo: boolean
          codigo: string | null
          created_at: string
          id: string
          nome: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_setores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "pat_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_termos: {
        Row: {
          arquivo_path: string | null
          assinado: boolean
          assinado_em: string | null
          bem_id: string | null
          conteudo: string | null
          created_at: string
          criado_por: string | null
          id: string
          movimentacao_id: string | null
          numero: string | null
          responsavel_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_path?: string | null
          assinado?: boolean
          assinado_em?: string | null
          bem_id?: string | null
          conteudo?: string | null
          created_at?: string
          criado_por?: string | null
          id?: string
          movimentacao_id?: string | null
          numero?: string | null
          responsavel_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          arquivo_path?: string | null
          assinado?: boolean
          assinado_em?: string | null
          bem_id?: string | null
          conteudo?: string | null
          created_at?: string
          criado_por?: string | null
          id?: string
          movimentacao_id?: string | null
          numero?: string | null
          responsavel_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pat_termos_bem_id_fkey"
            columns: ["bem_id"]
            isOneToOne: false
            referencedRelation: "pat_bens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_termos_movimentacao_id_fkey"
            columns: ["movimentacao_id"]
            isOneToOne: false
            referencedRelation: "pat_movimentacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pat_termos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pat_responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      pat_unidades: {
        Row: {
          ativo: boolean
          cidade: string | null
          codigo: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade?: string | null
          codigo?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string | null
          codigo?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
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
      rh_afastamentos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          colaborador_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          dias: number | null
          documento_path: string | null
          id: string
          observacoes: string | null
          possui_atestado: boolean
          registrado_por: string | null
          status: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo: Database["public"]["Enums"]["rh_tipo_afastamento"]
          updated_at: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          colaborador_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dias?: number | null
          documento_path?: string | null
          id?: string
          observacoes?: string | null
          possui_atestado?: boolean
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo?: Database["public"]["Enums"]["rh_tipo_afastamento"]
          updated_at?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          colaborador_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dias?: number | null
          documento_path?: string | null
          id?: string
          observacoes?: string | null
          possui_atestado?: boolean
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo?: Database["public"]["Enums"]["rh_tipo_afastamento"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_afastamentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_beneficio_concessoes: {
        Row: {
          ativo: boolean
          beneficio_id: string
          colaborador_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean
          beneficio_id: string
          colaborador_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean
          beneficio_id?: string
          colaborador_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_beneficio_concessoes_beneficio_id_fkey"
            columns: ["beneficio_id"]
            isOneToOne: false
            referencedRelation: "rh_beneficios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_beneficio_concessoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_beneficios: {
        Row: {
          ativo: boolean
          created_at: string
          desconto_colaborador: number | null
          descricao: string | null
          id: string
          nome: string
          tipo: string | null
          updated_at: string
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          desconto_colaborador?: number | null
          descricao?: string | null
          id?: string
          nome: string
          tipo?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          desconto_colaborador?: number | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      rh_cargos: {
        Row: {
          ativo: boolean
          cbo: string | null
          codigo: string | null
          created_at: string
          descricao: string | null
          faixa_salarial_max: number | null
          faixa_salarial_min: number | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cbo?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cbo?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      rh_colaboradores: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          estado_civil: string | null
          foto_url: string | null
          id: string
          logradouro: string | null
          matricula_funcional: string
          nome: string
          nome_social: string | null
          numero: string | null
          observacoes: string | null
          rg: string | null
          sexo: string | null
          situacao: Database["public"]["Enums"]["rh_situacao_colaborador"]
          telefone: string | null
          uf: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          logradouro?: string | null
          matricula_funcional: string
          nome: string
          nome_social?: string | null
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          sexo?: string | null
          situacao?: Database["public"]["Enums"]["rh_situacao_colaborador"]
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          logradouro?: string | null
          matricula_funcional?: string
          nome?: string
          nome_social?: string | null
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          sexo?: string | null
          situacao?: Database["public"]["Enums"]["rh_situacao_colaborador"]
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rh_dados_bancarios: {
        Row: {
          agencia: string | null
          banco: string | null
          chave_pix: string | null
          colaborador_id: string
          conta: string | null
          created_at: string
          id: string
          tipo_conta: string | null
          titular: string | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
          colaborador_id: string
          conta?: string | null
          created_at?: string
          id?: string
          tipo_conta?: string | null
          titular?: string | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
          colaborador_id?: string
          conta?: string | null
          created_at?: string
          id?: string
          tipo_conta?: string | null
          titular?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_dados_bancarios_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_documentos: {
        Row: {
          arquivo_path: string
          colaborador_id: string
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          tipo: string
          updated_at: string
          validade: string | null
        }
        Insert: {
          arquivo_path: string
          colaborador_id: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo: string
          updated_at?: string
          validade?: string | null
        }
        Update: {
          arquivo_path?: string
          colaborador_id?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_documentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_ferias: {
        Row: {
          abono_pecuniario: boolean
          aprovado_em: string | null
          aprovado_por: string | null
          colaborador_id: string
          created_at: string
          data_fim: string
          data_inicio: string
          dias: number | null
          dias_abono: number | null
          id: string
          justificativa: string | null
          observacoes: string | null
          periodo_aquisitivo_fim: string | null
          periodo_aquisitivo_inicio: string | null
          solicitado_por: string | null
          status: Database["public"]["Enums"]["rh_status_solicitacao"]
          updated_at: string
        }
        Insert: {
          abono_pecuniario?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          colaborador_id: string
          created_at?: string
          data_fim: string
          data_inicio: string
          dias?: number | null
          dias_abono?: number | null
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          periodo_aquisitivo_fim?: string | null
          periodo_aquisitivo_inicio?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          updated_at?: string
        }
        Update: {
          abono_pecuniario?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          colaborador_id?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          dias?: number | null
          dias_abono?: number | null
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          periodo_aquisitivo_fim?: string | null
          periodo_aquisitivo_inicio?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_ferias_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folha_itens: {
        Row: {
          base_fgts: number
          base_inss: number
          base_irrf: number
          colaborador_id: string
          created_at: string
          folha_id: string
          id: string
          observacoes: string | null
          salario_base: number
          total_descontos: number
          total_liquido: number
          total_proventos: number
          updated_at: string
          vinculo_id: string | null
        }
        Insert: {
          base_fgts?: number
          base_inss?: number
          base_irrf?: number
          colaborador_id: string
          created_at?: string
          folha_id: string
          id?: string
          observacoes?: string | null
          salario_base?: number
          total_descontos?: number
          total_liquido?: number
          total_proventos?: number
          updated_at?: string
          vinculo_id?: string | null
        }
        Update: {
          base_fgts?: number
          base_inss?: number
          base_irrf?: number
          colaborador_id?: string
          created_at?: string
          folha_id?: string
          id?: string
          observacoes?: string | null
          salario_base?: number
          total_descontos?: number
          total_liquido?: number
          total_proventos?: number
          updated_at?: string
          vinculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_folha_itens_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_folha_itens_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "rh_folhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_folha_itens_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "rh_vinculos"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folha_lancamentos: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          observacoes: string | null
          origem: string
          referencia: string | null
          updated_at: string
          valor: number
          verba_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          observacoes?: string | null
          origem?: string
          referencia?: string | null
          updated_at?: string
          valor?: number
          verba_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          observacoes?: string | null
          origem?: string
          referencia?: string | null
          updated_at?: string
          valor?: number
          verba_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_folha_lancamentos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "rh_folha_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_folha_lancamentos_verba_id_fkey"
            columns: ["verba_id"]
            isOneToOne: false
            referencedRelation: "rh_verbas"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folhas: {
        Row: {
          competencia: string
          created_at: string
          created_by: string | null
          data_pagamento: string | null
          descricao: string | null
          fechada_em: string | null
          fechada_por: string | null
          id: string
          observacoes: string | null
          periodo_fim: string | null
          periodo_inicio: string | null
          status: Database["public"]["Enums"]["rh_folha_status"]
          tipo: Database["public"]["Enums"]["rh_folha_tipo"]
          total_descontos: number
          total_liquido: number
          total_proventos: number
          updated_at: string
        }
        Insert: {
          competencia: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          fechada_em?: string | null
          fechada_por?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: Database["public"]["Enums"]["rh_folha_status"]
          tipo?: Database["public"]["Enums"]["rh_folha_tipo"]
          total_descontos?: number
          total_liquido?: number
          total_proventos?: number
          updated_at?: string
        }
        Update: {
          competencia?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          fechada_em?: string | null
          fechada_por?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: Database["public"]["Enums"]["rh_folha_status"]
          tipo?: Database["public"]["Enums"]["rh_folha_tipo"]
          total_descontos?: number
          total_liquido?: number
          total_proventos?: number
          updated_at?: string
        }
        Relationships: []
      }
      rh_frequencia: {
        Row: {
          abonado: boolean
          colaborador_id: string
          created_at: string
          data: string
          hora_entrada: string | null
          hora_saida: string | null
          horas_trabalhadas: number | null
          id: string
          justificativa: string | null
          registrado_por: string | null
          tipo: Database["public"]["Enums"]["rh_tipo_frequencia"]
          updated_at: string
        }
        Insert: {
          abonado?: boolean
          colaborador_id: string
          created_at?: string
          data: string
          hora_entrada?: string | null
          hora_saida?: string | null
          horas_trabalhadas?: number | null
          id?: string
          justificativa?: string | null
          registrado_por?: string | null
          tipo?: Database["public"]["Enums"]["rh_tipo_frequencia"]
          updated_at?: string
        }
        Update: {
          abonado?: boolean
          colaborador_id?: string
          created_at?: string
          data?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          horas_trabalhadas?: number | null
          id?: string
          justificativa?: string | null
          registrado_por?: string | null
          tipo?: Database["public"]["Enums"]["rh_tipo_frequencia"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_frequencia_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_historico: {
        Row: {
          created_at: string
          id: string
          operacao: string
          registro_id: string | null
          tabela: string
          user_id: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          operacao: string
          registro_id?: string | null
          tabela: string
          user_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          operacao?: string
          registro_id?: string | null
          tabela?: string
          user_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Relationships: []
      }
      rh_jornadas: {
        Row: {
          ativo: boolean
          carga_semanal: number | null
          created_at: string
          dias_semana: number[]
          hora_entrada: string | null
          hora_saida: string | null
          id: string
          intervalo_minutos: number | null
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          carga_semanal?: number | null
          created_at?: string
          dias_semana?: number[]
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          intervalo_minutos?: number | null
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          carga_semanal?: number | null
          created_at?: string
          dias_semana?: number[]
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          intervalo_minutos?: number | null
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rh_remuneracoes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          motivo: string | null
          salario_base: number
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
          vinculo_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string | null
          salario_base: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio: string
          vinculo_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          motivo?: string | null
          salario_base?: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
          vinculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_remuneracoes_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "rh_vinculos"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_setores: {
        Row: {
          ativo: boolean
          codigo: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          setor_pai_id: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          setor_pai_id?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          setor_pai_id?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_setores_setor_pai_id_fkey"
            columns: ["setor_pai_id"]
            isOneToOne: false
            referencedRelation: "rh_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_setores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "rh_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_solicitacoes: {
        Row: {
          colaborador_id: string
          created_at: string
          descricao: string | null
          id: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          solicitado_por: string | null
          status: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo: string
          updated_at: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo: string
          updated_at?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["rh_status_solicitacao"]
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_solicitacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_unidades: {
        Row: {
          ativo: boolean
          cidade: string | null
          cnpj: string | null
          codigo: string | null
          created_at: string
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade?: string | null
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string | null
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rh_verbas: {
        Row: {
          ativo: boolean
          automatica: boolean
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          incide_fgts: boolean
          incide_inss: boolean
          incide_irrf: boolean
          nome: string
          tipo: Database["public"]["Enums"]["rh_verba_tipo"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          automatica?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          incide_fgts?: boolean
          incide_inss?: boolean
          incide_irrf?: boolean
          nome: string
          tipo?: Database["public"]["Enums"]["rh_verba_tipo"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          automatica?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          incide_fgts?: boolean
          incide_inss?: boolean
          incide_irrf?: boolean
          nome?: string
          tipo?: Database["public"]["Enums"]["rh_verba_tipo"]
          updated_at?: string
        }
        Relationships: []
      }
      rh_vinculos: {
        Row: {
          ativo: boolean
          cargo_id: string | null
          colaborador_id: string
          created_at: string
          data_admissao: string
          data_desligamento: string | null
          gestor_id: string | null
          id: string
          jornada_semanal: number | null
          motivo_desligamento: string | null
          observacoes: string | null
          setor_id: string | null
          tipo: Database["public"]["Enums"]["rh_tipo_vinculo"]
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo_id?: string | null
          colaborador_id: string
          created_at?: string
          data_admissao: string
          data_desligamento?: string | null
          gestor_id?: string | null
          id?: string
          jornada_semanal?: number | null
          motivo_desligamento?: string | null
          observacoes?: string | null
          setor_id?: string | null
          tipo?: Database["public"]["Enums"]["rh_tipo_vinculo"]
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo_id?: string | null
          colaborador_id?: string
          created_at?: string
          data_admissao?: string
          data_desligamento?: string | null
          gestor_id?: string | null
          id?: string
          jornada_semanal?: number | null
          motivo_desligamento?: string | null
          observacoes?: string | null
          setor_id?: string | null
          tipo?: Database["public"]["Enums"]["rh_tipo_vinculo"]
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_vinculos_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "rh_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vinculos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vinculos_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vinculos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "rh_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vinculos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "rh_unidades"
            referencedColumns: ["id"]
          },
        ]
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
      pat_consulta_qr: {
        Args: { _token: string }
        Returns: {
          categoria: string
          descricao: string
          estado_conservacao: Database["public"]["Enums"]["pat_conservacao"]
          historico: Json
          localizacao: string
          marca: string
          modelo: string
          numero_patrimonial: string
          permite_ocorrencia: boolean
          responsavel: string
          setor: string
          status: Database["public"]["Enums"]["pat_status"]
          unidade: string
        }[]
      }
      pat_gerar_lista_inventario: {
        Args: { _inventario_id: string }
        Returns: number
      }
      pat_registrar_ocorrencia: {
        Args: {
          _contato?: string
          _descricao: string
          _nome?: string
          _tipo?: string
          _token: string
        }
        Returns: string
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
      ctb_conta_tipo:
        | "ativo"
        | "passivo"
        | "patrimonio_liquido"
        | "receita"
        | "despesa"
        | "resultado"
        | "compensacao"
      ctb_lanc_status:
        | "rascunho"
        | "simulado"
        | "efetivado"
        | "estornado"
        | "cancelado"
      ctb_lote_status:
        | "rascunho"
        | "simulado"
        | "conferido"
        | "efetivado"
        | "cancelado"
      ctb_natureza: "devedora" | "credora"
      ctb_origem:
        | "manual"
        | "financeiro_receita"
        | "financeiro_despesa"
        | "financeiro_pagamento"
        | "financeiro_recebimento"
        | "patrimonio_aquisicao"
        | "patrimonio_depreciacao"
        | "patrimonio_baixa"
        | "importacao"
        | "integracao"
      ctb_situacao_periodo: "aberto" | "em_fechamento" | "fechado" | "reaberto"
      fin_conta_tipo: "corrente" | "poupanca" | "investimento" | "aplicacao"
      fin_natureza: "receita" | "despesa"
      fin_status:
        | "rascunho"
        | "pendente"
        | "aprovado"
        | "pago"
        | "cancelado"
        | "estornado"
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
      pat_aprovacao: "pendente" | "aprovado" | "reprovado"
      pat_conservacao:
        | "novo"
        | "otimo"
        | "bom"
        | "regular"
        | "ruim"
        | "inservivel"
      pat_inv_status: "planejado" | "em_andamento" | "encerrado" | "cancelado"
      pat_item_status:
        | "esperado"
        | "localizado"
        | "nao_localizado"
        | "divergente"
        | "nao_cadastrado"
      pat_mov_tipo:
        | "transferencia"
        | "emprestimo"
        | "devolucao"
        | "cessao"
        | "manutencao"
        | "retorno_manutencao"
        | "outro"
      pat_status:
        | "em_uso"
        | "disponivel"
        | "em_manutencao"
        | "emprestado"
        | "em_transferencia"
        | "inservivel"
        | "baixado"
        | "extraviado"
      perm_acao:
        | "visualizar"
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "exportar"
        | "configurar"
      rh_folha_status:
        | "rascunho"
        | "em_calculo"
        | "conferida"
        | "fechada"
        | "paga"
        | "cancelada"
      rh_folha_tipo:
        | "mensal"
        | "decimo_terceiro"
        | "ferias"
        | "rescisao"
        | "complementar"
      rh_situacao_colaborador:
        | "ativo"
        | "afastado"
        | "ferias"
        | "desligado"
        | "suspenso"
      rh_status_solicitacao:
        | "solicitado"
        | "aprovado"
        | "reprovado"
        | "cancelado"
        | "concluido"
      rh_tipo_afastamento:
        | "atestado_medico"
        | "licenca_maternidade"
        | "licenca_paternidade"
        | "acidente_trabalho"
        | "licenca_nao_remunerada"
        | "suspensao"
        | "outro"
      rh_tipo_frequencia:
        | "normal"
        | "falta"
        | "falta_abonada"
        | "ferias"
        | "afastamento"
        | "feriado"
        | "folga"
        | "hora_extra"
      rh_tipo_vinculo:
        | "clt"
        | "estagio"
        | "aprendiz"
        | "temporario"
        | "terceirizado"
        | "prestador"
        | "estatutario"
        | "cedido"
      rh_verba_tipo: "provento" | "desconto" | "informativa"
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
      ctb_conta_tipo: [
        "ativo",
        "passivo",
        "patrimonio_liquido",
        "receita",
        "despesa",
        "resultado",
        "compensacao",
      ],
      ctb_lanc_status: [
        "rascunho",
        "simulado",
        "efetivado",
        "estornado",
        "cancelado",
      ],
      ctb_lote_status: [
        "rascunho",
        "simulado",
        "conferido",
        "efetivado",
        "cancelado",
      ],
      ctb_natureza: ["devedora", "credora"],
      ctb_origem: [
        "manual",
        "financeiro_receita",
        "financeiro_despesa",
        "financeiro_pagamento",
        "financeiro_recebimento",
        "patrimonio_aquisicao",
        "patrimonio_depreciacao",
        "patrimonio_baixa",
        "importacao",
        "integracao",
      ],
      ctb_situacao_periodo: ["aberto", "em_fechamento", "fechado", "reaberto"],
      fin_conta_tipo: ["corrente", "poupanca", "investimento", "aplicacao"],
      fin_natureza: ["receita", "despesa"],
      fin_status: [
        "rascunho",
        "pendente",
        "aprovado",
        "pago",
        "cancelado",
        "estornado",
      ],
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
      pat_aprovacao: ["pendente", "aprovado", "reprovado"],
      pat_conservacao: [
        "novo",
        "otimo",
        "bom",
        "regular",
        "ruim",
        "inservivel",
      ],
      pat_inv_status: ["planejado", "em_andamento", "encerrado", "cancelado"],
      pat_item_status: [
        "esperado",
        "localizado",
        "nao_localizado",
        "divergente",
        "nao_cadastrado",
      ],
      pat_mov_tipo: [
        "transferencia",
        "emprestimo",
        "devolucao",
        "cessao",
        "manutencao",
        "retorno_manutencao",
        "outro",
      ],
      pat_status: [
        "em_uso",
        "disponivel",
        "em_manutencao",
        "emprestado",
        "em_transferencia",
        "inservivel",
        "baixado",
        "extraviado",
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
      rh_folha_status: [
        "rascunho",
        "em_calculo",
        "conferida",
        "fechada",
        "paga",
        "cancelada",
      ],
      rh_folha_tipo: [
        "mensal",
        "decimo_terceiro",
        "ferias",
        "rescisao",
        "complementar",
      ],
      rh_situacao_colaborador: [
        "ativo",
        "afastado",
        "ferias",
        "desligado",
        "suspenso",
      ],
      rh_status_solicitacao: [
        "solicitado",
        "aprovado",
        "reprovado",
        "cancelado",
        "concluido",
      ],
      rh_tipo_afastamento: [
        "atestado_medico",
        "licenca_maternidade",
        "licenca_paternidade",
        "acidente_trabalho",
        "licenca_nao_remunerada",
        "suspensao",
        "outro",
      ],
      rh_tipo_frequencia: [
        "normal",
        "falta",
        "falta_abonada",
        "ferias",
        "afastamento",
        "feriado",
        "folga",
        "hora_extra",
      ],
      rh_tipo_vinculo: [
        "clt",
        "estagio",
        "aprendiz",
        "temporario",
        "terceirizado",
        "prestador",
        "estatutario",
        "cedido",
      ],
      rh_verba_tipo: ["provento", "desconto", "informativa"],
      status_carencia: ["liberado", "em_carencia"],
      tipo_dependente: ["conjuge", "filho", "pai_mae", "outro"],
    },
  },
} as const
