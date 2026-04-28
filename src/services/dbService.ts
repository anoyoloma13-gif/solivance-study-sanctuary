import { Module, Topic, Note } from "../types";

const STORAGE_KEYS = {
  MODULES: 'mm_modules',
  TOPICS: 'mm_topics',
  NOTES: 'mm_notes',
};

function get<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const db = {
  modules: {
    getAll: () => get<Module>(STORAGE_KEYS.MODULES),
    add: (module: Omit<Module, 'id' | 'createdAt'>) => {
      const all = get<Module>(STORAGE_KEYS.MODULES);
      const newItem: Module = { ...module, id: crypto.randomUUID(), createdAt: Date.now() };
      set(STORAGE_KEYS.MODULES, [...all, newItem]);
      return newItem;
    },
    delete: (id: string) => {
      const all = get<Module>(STORAGE_KEYS.MODULES);
      set(STORAGE_KEYS.MODULES, all.filter(m => m.id !== id));
    }
  },
  topics: {
    getByModule: (moduleId: string) => get<Topic>(STORAGE_KEYS.TOPICS).filter(t => t.moduleId === moduleId),
    add: (topic: Omit<Topic, 'id' | 'createdAt'>) => {
      const all = get<Topic>(STORAGE_KEYS.TOPICS);
      const newItem: Topic = { ...topic, id: crypto.randomUUID(), createdAt: Date.now() };
      set(STORAGE_KEYS.TOPICS, [...all, newItem]);
      return newItem;
    },
    delete: (id: string) => {
      const all = get<Topic>(STORAGE_KEYS.TOPICS);
      set(STORAGE_KEYS.TOPICS, all.filter(t => t.id !== id));
    }
  },
  notes: {
    getByTopic: (topicId: string) => get<Note>(STORAGE_KEYS.NOTES).filter(n => n.topicId === topicId),
    getAll: () => get<Note>(STORAGE_KEYS.NOTES),
    add: (note: Omit<Note, 'id' | 'createdAt'>) => {
      const all = get<Note>(STORAGE_KEYS.NOTES);
      const newItem: Note = { ...note, id: crypto.randomUUID(), createdAt: Date.now() };
      set(STORAGE_KEYS.NOTES, [...all, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Note>) => {
      const all = get<Note>(STORAGE_KEYS.NOTES);
      const updated = all.map(n => n.id === id ? { ...n, ...updates } : n);
      set(STORAGE_KEYS.NOTES, updated);
    },
    delete: (id: string) => {
      const all = get<Note>(STORAGE_KEYS.NOTES);
      set(STORAGE_KEYS.NOTES, all.filter(n => n.id !== id));
    }
  }
};
