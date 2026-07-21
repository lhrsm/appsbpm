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
      associados: {
        Row: {
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
      carencias: {
        Row: {
          associado_id: string
          created_at: string
          data_liberacao: string | null
          id: string
          procedimento: string
          status: Database["public"]["Enums"]["status_carencia"]
          updated_at: string
        }
        Insert: {
          associado_id: string
          created_at?: string
          data_liberacao?: string | null
          id?: string
          procedimento: string
          status?: Database["public"]["Enums"]["status_carencia"]
          updated_at?: string
        }
        Update: {
          associado_id?: string
          created_at?: string
          data_liberacao?: string | null
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
        ]
      }
      clinicas_parceiros: {
        Row: {
          ativo: boolean
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
      dependentes: {
        Row: {
          associado_id: string
          ativo: boolean
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          foto_url: string | null
          id: string
          nome: string
          status: string
          tipo: Database["public"]["Enums"]["tipo_dependente"]
          updated_at: string
        }
        Insert: {
          associado_id: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          status?: string
          tipo?: Database["public"]["Enums"]["tipo_dependente"]
          updated_at?: string
        }
        Update: {
          associado_id?: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          status?: string
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
      historico_limite: {
        Row: {
          associado_id: string
          created_at: string
          data_utilizacao: string
          descricao: string | null
          id: string
          valor: number
        }
        Insert: {
          associado_id: string
          created_at?: string
          data_utilizacao?: string
          descricao?: string | null
          id?: string
          valor: number
        }
        Update: {
          associado_id?: string
          created_at?: string
          data_utilizacao?: string
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
          id: string
        }
        Insert: {
          ano: number
          arquivo_url?: string | null
          associado_id: string
          created_at?: string
          id?: string
        }
        Update: {
          ano?: number
          arquivo_url?: string | null
          associado_id?: string
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      status_carencia: ["liberado", "em_carencia"],
      tipo_dependente: ["conjuge", "filho", "pai_mae", "outro"],
    },
  },
} as const
