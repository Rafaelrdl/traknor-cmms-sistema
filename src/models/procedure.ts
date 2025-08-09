export type ProcedureStatus = 'Ativo' | 'Inativo';
export type ProcedureFileType = 'pdf' | 'md';

export interface ProcedureCategory {
  id: string;         // uuid
  name: string;       // ex.: "Elétrico", "Higienização", "Chiller"
  color?: string;     // badge opcional
}

export interface ProcedureFileRef {
  id: string;         // key do IndexedDB (uuid)
  name: string;       // nome original
  type: ProcedureFileType;
  size: number;       // bytes
}

export interface Procedure {
  id: string;               // uuid
  title: string;
  description?: string;
  category_id?: string | null;
  status: ProcedureStatus;  // Ativo/Inativo
  tags?: string[];          // opcional p/ busca
  version: number;          // inicia em 1; +1 a cada reupload de arquivo
  file: ProcedureFileRef;   // referência ao binário no IndexedDB
  created_at: string;       // ISO
  updated_at: string;       // ISO
}