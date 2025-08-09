import { v4 as uuidv4 } from 'uuid';
import { Procedure, ProcedureCategory, ProcedureFileRef, ProcedureStatus } from '@/models/procedure';
import proceduresData from '@/mocks/procedures.json';
import categoriesData from '@/mocks/procedure_categories.json';

const PROCEDURES_KEY = 'procedures:db';
const CATEGORIES_KEY = 'procedure_categories:db';
const DB_NAME = 'ProceduresDB';
const DB_VERSION = 1;
const FILE_STORE_NAME = 'files';

// IndexedDB for file storage
class FileStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
          db.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async putFile(file: File): Promise<ProcedureFileRef> {
    if (!this.db) await this.init();
    
    const fileId = uuidv4();
    const fileRef: ProcedureFileRef = {
      id: fileId,
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'pdf' : 'md',
      size: file.size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(FILE_STORE_NAME);
      
      const fileData = {
        id: fileId,
        blob: file,
        metadata: fileRef
      };
      
      const request = store.put(fileData);
      request.onsuccess = () => resolve(fileRef);
      request.onerror = () => reject(request.error);
    });
  }

  async getFileBlob(fileId: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE_NAME], 'readonly');
      const store = transaction.objectStore(FILE_STORE_NAME);
      const request = store.get(fileId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(FILE_STORE_NAME);
      const request = store.delete(fileId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const fileStorage = new FileStorage();

// Helper functions
function load<T>(key: string, seed: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : seed;
  } catch {
    return seed;
  }
}

function save<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Categories
export function listCategories(): ProcedureCategory[] {
  return load(CATEGORIES_KEY, categoriesData as ProcedureCategory[]);
}

export function getCategoryById(id: string): ProcedureCategory | null {
  const categories = listCategories();
  return categories.find(cat => cat.id === id) || null;
}

// Procedures
export function listProcedures(): Procedure[] {
  return load(PROCEDURES_KEY, proceduresData as Procedure[]);
}

export function createProcedure(
  data: Omit<Procedure, 'id' | 'created_at' | 'updated_at' | 'version'> & { version?: number }
): Procedure {
  const procedures = listProcedures();
  const now = new Date().toISOString();
  
  const newProcedure: Procedure = {
    ...data,
    id: uuidv4(),
    version: data.version || 1,
    created_at: now,
    updated_at: now,
  };
  
  procedures.push(newProcedure);
  save(PROCEDURES_KEY, procedures);
  return newProcedure;
}

export function updateProcedure(procedure: Procedure): Procedure {
  const procedures = listProcedures();
  const index = procedures.findIndex(p => p.id === procedure.id);
  
  if (index === -1) {
    throw new Error('Procedure not found');
  }
  
  const updatedProcedure = {
    ...procedure,
    updated_at: new Date().toISOString(),
  };
  
  procedures[index] = updatedProcedure;
  save(PROCEDURES_KEY, procedures);
  return updatedProcedure;
}

export function deleteProcedure(id: string): void {
  const procedures = listProcedures();
  const procedure = procedures.find(p => p.id === id);
  
  if (procedure) {
    // Delete file from IndexedDB
    fileStorage.deleteFile(procedure.file.id).catch(console.error);
    
    // Remove from procedures list
    const filtered = procedures.filter(p => p.id !== id);
    save(PROCEDURES_KEY, filtered);
  }
}

export function bumpVersion(procedure: Procedure): Procedure {
  return updateProcedure({
    ...procedure,
    version: procedure.version + 1,
  });
}

export function filterProcedures(filters: {
  category_id?: string | null;
  status?: ProcedureStatus;
  q?: string;
}): Procedure[] {
  const procedures = listProcedures();
  
  return procedures.filter(procedure => {
    // Category filter
    if (filters.category_id && procedure.category_id !== filters.category_id) {
      return false;
    }
    
    // Status filter
    if (filters.status && procedure.status !== filters.status) {
      return false;
    }
    
    // Search query
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const searchableText = [
        procedure.title,
        procedure.description || '',
        ...(procedure.tags || [])
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
}

// File operations
export async function putFile(file: File): Promise<ProcedureFileRef> {
  return fileStorage.putFile(file);
}

export async function getFileBlob(fileId: string): Promise<Blob | null> {
  return fileStorage.getFileBlob(fileId);
}

export async function deleteFile(fileId: string): Promise<void> {
  return fileStorage.deleteFile(fileId);
}

// Initialize storage on first load
export function initializeStorage(): void {
  // Ensure categories and procedures are loaded with defaults
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    save(CATEGORIES_KEY, categoriesData as ProcedureCategory[]);
  }
  if (!localStorage.getItem(PROCEDURES_KEY)) {
    save(PROCEDURES_KEY, proceduresData as Procedure[]);
  }
}

// Create sample files for existing procedures (mock data)
export async function createSampleFiles(): Promise<void> {
  const procedures = listProcedures();
  
  for (const procedure of procedures) {
    try {
      // Check if file already exists
      const existingBlob = await getFileBlob(procedure.file.id);
      if (existingBlob) continue;
      
      // Create sample content based on file type
      let content: string;
      let mimeType: string;
      
      if (procedure.file.type === 'md') {
        content = `# ${procedure.title}

## Descrição
${procedure.description || 'Sem descrição disponível'}

## Tags
${(procedure.tags || []).map(tag => `- ${tag}`).join('\n')}

## Procedimento
Este é um arquivo de exemplo para demonstração do sistema de procedimentos.

### Passos principais:
1. Primeiro passo do procedimento
2. Segundo passo do procedimento  
3. Terceiro passo do procedimento

### Observações importantes:
- Observe sempre as normas de segurança
- Utilize os EPIs adequados
- Documente todas as ações realizadas

### Conclusão
Após concluir todos os passos, registre a execução no sistema.
`;
        mimeType = 'text/markdown';
      } else {
        // For PDF, we'll create a simple text content as placeholder
        content = `Procedimento: ${procedure.title}\n\nEste é um arquivo PDF de exemplo para demonstração.`;
        mimeType = 'text/plain';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const file = new File([blob], procedure.file.name, { type: mimeType });
      
      // Store in IndexedDB with the expected ID
      await fileStorage.init();
      const transaction = fileStorage.db!.transaction([FILE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(FILE_STORE_NAME);
      
      const fileData = {
        id: procedure.file.id,
        blob: file,
        metadata: procedure.file
      };
      
      store.put(fileData);
    } catch (error) {
      console.warn(`Failed to create sample file for procedure ${procedure.id}:`, error);
    }
  }
}