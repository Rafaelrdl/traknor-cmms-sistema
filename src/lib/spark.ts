/**
 * GitHub Spark API wrapper and utilities
 * This file ensures proper integration with the Spark runtime
 */

// Type declarations for Spark global
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}

// Spark API utilities
export const sparkAPI = {
  /**
   * Check if Spark is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'spark' in window;
  },

  /**
   * Create a prompt for LLM usage
   */
  createPrompt(strings: TemplateStringsArray, ...values: any[]): string {
    if (this.isAvailable()) {
      return window.spark.llmPrompt(strings, ...values);
    }
    // Fallback for development
    return strings.join('');
  },

  /**
   * Call LLM with a prompt
   */
  async callLLM(prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> {
    if (this.isAvailable()) {
      return window.spark.llm(prompt, modelName, jsonMode);
    }
    // Fallback for development
    console.warn('Spark not available, returning mock response');
    return JSON.stringify({ message: 'Mock response - Spark not available' });
  },

  /**
   * Get current user information
   */
  async getUser() {
    if (this.isAvailable()) {
      return window.spark.user();
    }
    // Fallback for development
    return {
      avatarUrl: 'https://github.com/github.png',
      email: 'dev@example.com',
      id: 'dev-user',
      isOwner: true,
      login: 'developer'
    };
  },

  /**
   * Key-Value storage operations
   */
  kv: {
    async get<T>(key: string): Promise<T | undefined> {
      if (sparkAPI.isAvailable()) {
        return window.spark.kv.get<T>(key);
      }
      // Fallback to localStorage for development
      try {
        const item = localStorage.getItem(`spark:${key}`);
        return item ? JSON.parse(item) : undefined;
      } catch {
        return undefined;
      }
    },

    async set<T>(key: string, value: T): Promise<void> {
      if (sparkAPI.isAvailable()) {
        return window.spark.kv.set(key, value);
      }
      // Fallback to localStorage for development
      try {
        localStorage.setItem(`spark:${key}`, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },

    async delete(key: string): Promise<void> {
      if (sparkAPI.isAvailable()) {
        return window.spark.kv.delete(key);
      }
      // Fallback to localStorage for development
      localStorage.removeItem(`spark:${key}`);
    },

    async keys(): Promise<string[]> {
      if (sparkAPI.isAvailable()) {
        return window.spark.kv.keys();
      }
      // Fallback to localStorage for development
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('spark:')) {
          keys.push(key.replace('spark:', ''));
        }
      }
      return keys;
    }
  }
};

export default sparkAPI;