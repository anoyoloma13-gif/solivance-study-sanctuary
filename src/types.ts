export interface Module {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: number;
}

export interface Topic {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Note {
  id: string;
  topicId: string;
  moduleId: string;
  title: string;
  content: string;
  type: 'text' | 'document' | 'image' | 'video' | 'audio' | 'code';
  fileUrl?: string;
  cartoonDescription?: string;
  summary?: string;
  flashcards?: { question: string; answer: string }[];
  mindMapData?: string; // Structured JSON for mind map
  examPaper?: string; // Markdown or complex object
  slides?: { title: string; bulletPoints: string[] }[];
  cartoonImageUrl?: string;
  createdAt: number;
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AppState {
  currentView: 'dashboard' | 'module' | 'topic' | 'search' | 'cartoon' | 'practice';
  selectedModuleId?: string;
  selectedTopicId?: string;
  selectedNoteId?: string;
}
