/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Layout, 
  ChevronRight, 
  FileText, 
  BrainCircuit, 
  Palette,
  Home,
  Trash2,
  X,
  Sparkles,
  ArrowLeft,
  PenTool,
  Eraser,
  Download,
  Video,
  Mic,
  FileCode,
  Terminal,
  Cpu,
  Globe,
  Upload,
  Moon,
  Wind,
  Layers,
  Map,
  CreditCard,
  Presentation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Module, Topic, Note, AppState, PracticeQuestion } from './types';
import { db } from './services/dbService';
import { cn } from './lib/utils';
import { searchNotes, generatePracticeQuestions, cartoonifyContent, generateStudyAid } from './services/geminiService';
import Markdown from 'react-markdown';

export default function App() {
  const [modules, setModules] = useState<Module[]>([]);
  const [state, setState] = useState<AppState>({ currentView: 'dashboard' });
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setModules(db.modules.getAll());
  }, []);

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    const colors = ['bg-sage', 'bg-terracotta', 'bg-sand', 'bg-clay', 'bg-terracotta-dark', 'bg-sage-light'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newModule = db.modules.add({ name: newModuleName, description: '', color });
    setModules([...modules, newModule]);
    setNewModuleName('');
    setIsAddingModule(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const allNotes = db.notes.getAll();
    const result = await searchNotes(searchQuery, allNotes);
    setSearchResults(result);
    setState({ ...state, currentView: 'search' });
    setIsSearching(false);
  };

  const deleteModule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.modules.delete(id);
    setModules(modules.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-ethereal-white font-sans text-earth selection:bg-terracotta/20">
      {/* Sidebar / Navigation */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-sand p-6 flex flex-col z-10 hidden md:flex">
        <div className="flex flex-col gap-1 mb-10 group cursor-default">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-terracotta/20 blur-xl rounded-full group-hover:bg-terracotta/40 transition-all duration-700" />
              <div className="relative bg-gradient-to-br from-sage via-terracotta to-sand p-2 rounded-2xl text-white shadow-sm overflow-hidden">
                <Wind size={24} className="animate-pulse" />
              </div>
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-earth uppercase italic">Solivance</h1>
          </div>
          <p className="text-[10px] font-bold text-terracotta/60 uppercase tracking-[0.2em] ml-11">Study Sanctuary</p>
        </div>

        <div className="space-y-1 flex-1">
          <NavButton 
            active={state.currentView === 'dashboard'} 
            onClick={() => setState({ currentView: 'dashboard' })}
            icon={<Home size={20} />}
            label="Sanctuary"
          />
          <NavButton 
            active={state.currentView === 'search'} 
            onClick={() => setState({ currentView: 'search' })}
            icon={<Search size={20} />}
            label="Mind Search"
          />
           <NavButton 
            active={state.currentView === 'practice'} 
            onClick={() => setState({ currentView: 'practice' })}
            icon={<Terminal size={20} />}
            label="Practical Lab"
          />
        </div>

        <div className="pt-6 border-t border-sand/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-clay/40 uppercase tracking-widest">IT Modules</span>
            <button 
              onClick={() => setIsAddingModule(true)}
              className="text-terracotta hover:bg-terracotta/10 p-1.5 rounded-full transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-64 pr-2">
            {modules.map(m => (
              <button
                key={m.id}
                onClick={() => setState({ currentView: 'module', selectedModuleId: m.id })}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                  state.selectedModuleId === m.id ? "bg-sand/30 text-terracotta-dark font-bold shadow-sm" : "text-clay hover:bg-sage/5"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", m.color)} />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-8 min-h-screen">
        <header className="max-w-5xl mx-auto flex items-center justify-between mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-clay/40" size={18} />
            <input 
              type="text" 
              placeholder="Search your library..."
              className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-sand rounded-2xl focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta outline-none transition-all shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <button className="flex items-center gap-2 px-5 py-3 bg-earth text-sand rounded-2xl hover:bg-clay transition-all shadow-xl shadow-earth/10 font-bold text-sm tracking-tight group">
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ethereal Insights</span>
          </button>
        </header>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {state.currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-earth tracking-tighter uppercase italic">Study Sanctuary</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {modules.map(m => (
                    <ModuleCard 
                      key={m.id} 
                      module={m} 
                      onClick={() => setState({ currentView: 'module', selectedModuleId: m.id })}
                      onDelete={(e) => deleteModule(m.id, e)}
                    />
                  ))}
                  <button 
                    onClick={() => setIsAddingModule(true)}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[40px] border-2 border-dashed border-sand hover:border-terracotta hover:bg-terracotta/5 transition-all text-clay/60 hover:text-terracotta group"
                  >
                    <div className="p-4 rounded-3xl bg-white shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <Plus size={28} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">Add Core Module</span>
                  </button>
                </div>
              </motion.div>
            )}

            {state.currentView === 'module' && (
              <ModuleDetail 
                moduleId={state.selectedModuleId!} 
                onBack={() => setState({ currentView: 'dashboard' })} 
                onOpenTopic={(topicId) => setState({ ...state, currentView: 'topic', selectedTopicId: topicId })}
              />
            )}

            {state.currentView === 'topic' && (
              <TopicDetail 
                topicId={state.selectedTopicId!} 
                moduleId={state.selectedModuleId!}
                onBack={() => setState({ ...state, currentView: 'module' })} 
              />
            )}

            {state.currentView === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-6 mb-12">
                  <button onClick={() => setState({ ...state, currentView: 'dashboard' })} className="p-4 bg-white/80 rounded-2xl shadow-sm border border-sand group transition-all hover:bg-white">
                    <ArrowLeft size={22} className="text-earth group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <h2 className="text-4xl font-black text-earth tracking-tighter uppercase italic">Ethereal Echoes</h2>
                </div>
                
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative">
                       <div className="absolute inset-0 bg-terracotta/20 blur-2xl rounded-full scale-150 animate-pulse" />
                       <div className="relative w-16 h-16 border-4 border-sand border-t-terracotta rounded-full animate-spin" />
                    </div>
                    <p className="text-clay font-black uppercase tracking-[0.3em] text-xs">Synchronizing with Sanctuary...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {searchResults.map(note => (
                      <NoteResultItem key={note.id} note={note} onClick={() => setState({ currentView: 'topic', selectedTopicId: note.topicId, selectedModuleId: note.moduleId })} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 border border-sand rounded-[48px] p-24 text-center shadow-sm">
                    <div className="w-24 h-24 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-8 text-sand">
                      <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-earth tracking-tighter uppercase italic mb-2">No Echoes Found</h3>
                    <p className="text-clay font-medium italic">Adjust your vibration or archive more artifacts.</p>
                  </div>
                )}
              </motion.div>
            )}

            {state.currentView === 'practice' && (
              <PracticalLab onBack={() => setState({ currentView: 'dashboard' })} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Module Modal */}
      <AnimatePresence>
        {isAddingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingModule(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl relative w-full max-w-md"
            >
              <button 
                onClick={() => setIsAddingModule(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-black mb-6 tracking-tight text-earth uppercase italic">Create New Module</h3>
              <form onSubmit={handleCreateModule} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-clay/40 uppercase tracking-widest mb-2">Module Designation</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-5 py-4 bg-ethereal-white border border-sand rounded-2xl focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta outline-none transition-all font-bold placeholder:text-clay/20"
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-terracotta transition-all shadow-xl shadow-earth/10">
                  Initialize Module
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all relative overflow-hidden group",
        active ? "text-terracotta" : "text-clay/60 hover:text-earth hover:bg-sand/20"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-pill" 
          className="absolute inset-0 bg-terracotta/10 border-l-4 border-terracotta"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 transition-transform group-hover:scale-110">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function ModuleCard({ module, onClick, onDelete }: { module: Module, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  return (
    <motion.div 
      whileHover={{ y: -8, rotate: -1 }}
      onClick={onClick}
      className="bg-white rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group border border-sand/50 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sand/10 rounded-full blur-2xl group-hover:bg-terracotta/10 transition-all duration-700" />
      
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div className={cn("p-5 rounded-3xl text-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500", module.color)}>
          <Cpu size={28} />
        </div>
        <button onClick={onDelete} className="p-2.5 text-sand hover:text-terracotta hover:bg-terracotta/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
          <Trash2 size={20} />
        </button>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-1 text-earth tracking-tighter uppercase italic">{module.name}</h3>
        <div className="flex items-center gap-2 text-clay/40 text-xs font-bold uppercase tracking-widest mt-4">
          <BookOpen size={14} /> 
          <span>Explore Knowledge</span>
          <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

function ModuleDetail({ moduleId, onBack, onOpenTopic }: { moduleId: string, onBack: () => void, onOpenTopic: (id: string) => void }) {
  const [module, setModule] = useState<Module | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    const modules = db.modules.getAll();
    const found = modules.find(m => m.id === moduleId);
    if (found) {
      setModule(found);
      setTopics(db.topics.getByModule(moduleId));
    }
  }, [moduleId]);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const newTopic = db.topics.add({ name: newTopicName, description: '', moduleId });
    setTopics([...topics, newTopic]);
    setNewTopicName('');
    setIsAddingTopic(false);
  };

  if (!module) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 bg-white/80 hover:bg-white rounded-2xl shadow-sm transition-all border border-sand group">
          <ArrowLeft size={22} className="text-earth group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-4 h-4 rounded-full shadow-inner", module.color)} />
            <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h2 className="text-4xl font-black text-earth tracking-tighter uppercase italic">{module.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-earth/80 uppercase tracking-tight italic">Domain Topics</h3>
            <button 
              onClick={() => setIsAddingTopic(true)}
              className="flex items-center gap-2 text-xs font-black text-terracotta uppercase tracking-widest hover:bg-terracotta/5 px-4 py-2 rounded-xl transition-all border border-terracotta/20"
            >
              <Plus size={16} /> New Territory
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map(t => (
              <button 
                key={t.id}
                onClick={() => onOpenTopic(t.id)}
                className="w-full group bg-white/60 p-6 rounded-[32px] border border-sand flex items-center justify-between hover:shadow-2xl transition-all hover:bg-white hover:border-terracotta/30"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-sand/20 flex items-center justify-center text-clay group-hover:bg-terracotta group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <Globe size={24} />
                  </div>
                  <span className="font-black text-earth tracking-tight group-hover:italic">{t.name}</span>
                </div>
                <ChevronRight size={20} className="text-sand group-hover:text-terracotta transition-all" />
              </button>
            ))}
            {topics.length === 0 && !isAddingTopic && (
              <div className="col-span-full bg-white/40 rounded-[40px] p-16 text-center border-2 border-dashed border-sand">
                <div className="w-16 h-16 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sand">
                  <Wind size={32} />
                </div>
                <p className="text-clay font-bold tracking-tight">This domain is currently empty. Define its territories.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-earth via-clay to-terracotta rounded-[48px] p-10 text-sand relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <BrainCircuit size={48} className="mb-8 opacity-40 animate-pulse" />
            <h3 className="text-3xl font-black mb-2 italic tracking-tighter uppercase">Sanctuary Mastery</h3>
            <p className="opacity-60 mb-10 text-xs font-bold uppercase tracking-widest leading-loose">Harness the power of ethereal insights to master your craft.</p>
            
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 group hover:border-white/20 transition-all">
                <span className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] block mb-2">Knowledge Spheres</span>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black italic tracking-tighter">{topics.length}</span>
                  <span className="text-[10px] opacity-40 mb-2 font-bold">Active Areas</span>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sand w-1/4 rounded-full" />
                </div>
                <p className="text-[10px] mt-2 opacity-40 font-black uppercase tracking-widest">Global Synchronization: 25%</p>
              </div>
            </div>
          </div>
          <div className="absolute -left-32 -bottom-32 w-80 h-80 bg-terracotta/20 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-10 w-20 h-20 bg-sage/10 rounded-full blur-3xl" />
        </div>
      </div>

      <AnimatePresence>
        {isAddingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingTopic(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 shadow-2xl relative w-full max-w-md">
              <h3 className="text-2xl font-black text-earth uppercase italic mb-6">Discovery Sphere</h3>
              <form onSubmit={handleAddTopic} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-clay/40 uppercase tracking-widest mb-2">Sphere Name</label>
                  <input autoFocus type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="e.g. Data Structures" className="w-full px-5 py-4 bg-ethereal-white border border-sand rounded-2xl focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta outline-none transition-all font-bold placeholder:text-clay/20" />
                </div>
                <button type="submit" className="w-full py-5 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-terracotta transition-all shadow-xl shadow-earth/10">Archive Sphere</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TopicDetail({ topicId, moduleId, onBack }: { topicId: string, moduleId: string, onBack: () => void }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<Note['type']>('text');
  const [isProcessing, setIsProcessing] = useState(false);

  // Practice & Cartoon states
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState(false);
  const [selectedNoteForCartoon, setSelectedNoteForCartoon] = useState<Note | null>(null);
  const [selectedAid, setSelectedAid] = useState<{ type: string, data: any, noteTitle: string } | null>(null);

  useEffect(() => {
    const topics = db.topics.getByModule(moduleId);
    const found = topics.find(t => t.id === topicId);
    if (found) {
      setTopic(found);
      setNotes(db.notes.getByTopic(topicId));
    }
  }, [topicId, moduleId]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewNoteTitle(file.name);
      // For a demo, we'll simulate processing by putting the file name/type in content
      setNewNoteContent(`[Device Artifact] Name: ${file.name} | Size: ${(file.size / 1024).toFixed(2)} KB | Type: ${file.type}`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    if (newNoteType !== 'text' && newNoteType !== 'code') {
      setIsUploading(true);
      for (let i = 0; i <= 100; i += 20) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 150));
      }
      setIsUploading(false);
      setUploadProgress(0);
    }

    const newNote = db.notes.add({ 
      title: newNoteTitle, 
      content: newNoteContent || `Multimedia reference for ${newNoteTitle}`, 
      topicId, 
      moduleId, 
      type: newNoteType 
    });
    setNotes([...notes, newNote]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteType('text');
    setIsAddingNote(false);
  };

  const handleGenerateQuestions = async () => {
    if (notes.length === 0) return;
    setIsGeneratingQuiz(true);
    const q = await generatePracticeQuestions(notes);
    setQuestions(q);
    setViewingQuiz(true);
    setIsGeneratingQuiz(false);
  };

  const handleStudyAid = async (note: Note, type: 'summary' | 'flashcards' | 'mindmap' | 'exampaper' | 'slides') => {
    setIsProcessing(true);
    try {
      const data = await generateStudyAid(note, type);
      setSelectedAid({ type, data, noteTitle: note.title });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCartoonify = async (note: Note) => {
    if (note.cartoonDescription) {
      setSelectedNoteForCartoon(note);
      return;
    }
    
    setIsProcessing(true);
    const cartoon = await cartoonifyContent(note);
    db.notes.update(note.id, { cartoonDescription: cartoon.description });
    
    const updatedNote = { ...note, cartoonDescription: cartoon.description };
    setNotes(notes.map(n => n.id === note.id ? updatedNote : n));
    setSelectedNoteForCartoon(updatedNote);
    setIsProcessing(false);
  };

  if (!topic) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ethereal-white/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-terracotta/20 rounded-full blur-3xl scale-150"
                  animate={{ scale: [1.5, 2, 1.5], rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div className="relative bg-white p-8 rounded-[40px] shadow-2xl border-4 border-sand/30">
                  <Cpu size={48} className="text-terracotta animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-earth uppercase italic tracking-tighter">Harmonizing Concepts</h3>
                <p className="text-[10px] font-black text-clay uppercase tracking-[0.4em] animate-pulse">Consulting the Ethereal Archive...</p>
              </div>
              <div className="w-64 h-1 bg-sand/20 rounded-full overflow-hidden mt-4">
                <motion.div 
                  className="h-full bg-terracotta"
                  animate={{ x: [-256, 256] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cartoon Viewer Overlay */}
      <AnimatePresence>
        {selectedAid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAid(null)} className="absolute inset-0 bg-earth/40 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 30 }} 
              className="bg-ethereal-white rounded-[48px] p-10 shadow-2xl relative w-full max-w-4xl max-h-[85vh] overflow-y-auto border-4 border-white scroll-smooth"
            >
              <button onClick={() => setSelectedAid(null)} className="absolute top-8 right-8 p-3 hover:bg-white rounded-full transition-all text-clay shadow-sm"><X size={24} /></button>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-earth text-sand rounded-[24px] shadow-lg">
                  {selectedAid.type === 'summary' && <Layers size={28} />}
                  {selectedAid.type === 'mindmap' && <Map size={28} />}
                  {selectedAid.type === 'flashcards' && <CreditCard size={28} />}
                  {selectedAid.type === 'slides' && <Presentation size={28} />}
                  {selectedAid.type === 'exampaper' && <FileCode size={28} />}
                </div>
                <div>
                    <h3 className="text-3xl font-black text-earth tracking-tighter uppercase italic">{selectedAid.type} Artifact</h3>
                    <p className="text-xs font-bold text-terracotta uppercase tracking-[0.2em]">{selectedAid.noteTitle}</p>
                </div>
              </div>

              <div className="space-y-8">
                {selectedAid.type === 'summary' && (
                  <div className="prose prose-lg max-w-none text-earth font-medium leading-loose bg-white/50 p-10 rounded-[40px] border border-sand">
                    {selectedAid.data}
                  </div>
                )}

                {selectedAid.type === 'exampaper' && (
                  <div className="markdown-body p-10 bg-white shadow-inner rounded-[32px] border border-sand overflow-auto">
                    <Markdown>{selectedAid.data}</Markdown>
                  </div>
                )}

                {selectedAid.type === 'flashcards' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {selectedAid.data.map((card: any, i: number) => (
                      <Flashcard key={i} question={card.question} answer={card.answer} index={i} />
                    ))}
                  </div>
                )}

                {selectedAid.type === 'slides' && (
                  <div className="space-y-12">
                    {selectedAid.data.map((slide: any, i: number) => (
                      <div key={i} className="bg-white aspect-video rounded-[48px] p-12 shadow-sm border border-sand flex flex-col justify-center relative overflow-hidden group hover:border-terracotta/30 transition-all">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-sand/10 rounded-full blur-3xl group-hover:bg-terracotta/5 transition-all" />
                        <h4 className="text-3xl font-black text-earth italic tracking-tighter uppercase mb-8 relative z-10">
                          {slide.title}
                        </h4>
                        <ul className="space-y-4 relative z-10">
                          {slide.bulletPoints.map((bp: string, j: number) => (
                            <li key={j} className="flex items-start gap-4 text-clay font-bold group/li">
                              <CheckCircle2 size={24} className="text-sage mt-1 group-hover/li:scale-110 transition-transform" />
                              <span className="text-lg leading-snug">{bp}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="absolute bottom-10 right-10 text-[10px] font-black text-clay/20 uppercase tracking-[0.5em]">Slide {i+1} of {selectedAid.data.length}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAid.type === 'mindmap' && (
                  <div className="bg-white p-12 rounded-[48px] border border-sand shadow-inner min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-5 pointer-events-none">
                      {Array.from({length: 144}).map((_, i) => <div key={i} className="border border-clay" />)}
                    </div>
                    
                    <div className="relative flex flex-col items-center gap-12">
                       <div className="px-10 py-5 bg-earth text-sand rounded-3xl font-black italic tracking-tighter uppercase text-xl shadow-xl z-20">
                         {selectedAid.data.name}
                       </div>
                       
                       <div className="flex flex-wrap justify-center gap-8">
                         {selectedAid.data.children?.map((child: any, i: number) => (
                           <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-6 py-4 bg-terracotta/10 border border-terracotta/30 text-terracotta-dark rounded-2xl font-black text-sm relative"
                           >
                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-terracotta/20" />
                             {child.name}
                             {child.children?.length > 0 && (
                               <div className="mt-4 pt-4 border-t border-terracotta/20 flex flex-col gap-2">
                                 {child.children.map((sub: any, j: number) => (
                                   <div key={j} className="text-[10px] uppercase font-bold tracking-widest text-clay opacity-80 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                                     {sub.name}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </motion.div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-center">
                 <button 
                  onClick={() => setSelectedAid(null)}
                  className="px-12 py-5 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-clay transition-all shadow-xl shadow-earth/20"
                 >
                   Sync to Knowledge Base
                 </button>
              </div>
            </motion.div>
          </div>
        )}
        {selectedNoteForCartoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNoteForCartoon(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[40px] p-10 shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedNoteForCartoon(null)} className="absolute top-8 right-8 p-3 hover:bg-ethereal-white rounded-2xl transition-all text-clay"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-terracotta/10 text-terracotta rounded-2xl"><Palette size={24} /></div>
                <h3 className="text-3xl font-black italic tracking-tighter text-earth uppercase">Abstracted Visual</h3>
              </div>

              <div className="aspect-video bg-sand/10 rounded-[32px] mb-8 flex items-center justify-center overflow-hidden border-4 border-earth shadow-[12px_12px_0px_var(--color-terracotta)]">
                 <img 
                   src={`https://picsum.photos/seed/${selectedNoteForCartoon.id}/800/450?grayscale&blur=2`} 
                   className="w-full h-full object-cover grayscale opacity-20"
                   alt="Concept Art"
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                   <p className="text-2xl font-black text-earth leading-tight italic uppercase tracking-tighter">
                     {selectedNoteForCartoon.title}
                   </p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-sand/5 rounded-[40px] border-2 border-sand/30">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-terracotta mb-4">Core Resonance</h4>
                  <p className="text-xl text-earth font-bold leading-relaxed italic">{selectedNoteForCartoon.cartoonDescription}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Overlay */}
      <AnimatePresence>
        {viewingQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingQuiz(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-[40px] p-10 shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-3xl font-black mb-8 italic tracking-tighter uppercase text-earth">Ethereal Exam</h3>
              <div className="space-y-10">
                {questions.map((q, idx) => (
                  <div key={idx} className="space-y-6">
                    <h4 className="text-xl font-black text-earth italic tracking-tight">Q{idx + 1}: {q.question}</h4>
                    <div className="grid grid-cols-1 gap-3">
                       {q.options.map((opt, oIdx) => (
                          <button key={oIdx} className="p-5 bg-ethereal-white border border-sand rounded-[24px] text-left hover:border-terracotta hover:bg-terracotta/5 transition-all font-bold text-sm text-clay group">
                            <span className="inline-block w-8 h-8 rounded-full bg-sand/20 text-clay text-center leading-8 text-xs font-black mr-4 group-hover:bg-terracotta group-hover:text-white transition-all">{String.fromCharCode(65 + oIdx)}</span>
                            {opt}
                          </button>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setViewingQuiz(false)}
                className="mt-12 w-full py-5 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-terracotta transition-all shadow-xl shadow-earth/20"
              >
                Conclude Session
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/80 rounded-2xl shadow-sm border border-sand group transition-all hover:bg-white">
            <ArrowLeft size={22} className="text-earth group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-earth tracking-tighter uppercase italic">{topic.name}</h2>
            <p className="text-[10px] font-black text-clay uppercase tracking-[0.2em]">Territory Knowledge</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            disabled={isGeneratingQuiz || notes.length === 0}
            onClick={handleGenerateQuestions}
            className="flex items-center gap-3 px-8 py-3 bg-earth text-sand rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-clay transition-all disabled:opacity-30 shadow-xl shadow-earth/10"
          >
            {isGeneratingQuiz ? <div className="w-4 h-4 border-2 border-sand/30 border-t-sand rounded-full animate-spin" /> : <BrainCircuit size={18} />}
            Ethereal Exam
          </button>
          <button 
            onClick={() => setIsAddingNote(true)}
            className="flex items-center gap-3 px-8 py-3 bg-white text-earth border border-sand rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-sand/10 transition-all"
          >
            <Plus size={18} /> New Artifact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {notes.map(note => (
          <motion.div 
            key={note.id} 
            layout
            className="bg-white/80 rounded-[40px] p-10 border border-sand relative group overflow-hidden hover:shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sand/20 text-terracotta rounded-2xl">
                   {note.type === 'code' ? <Terminal size={20} /> : note.type === 'video' ? <Video size={20} /> : note.type === 'audio' ? <Mic size={20} /> : <FileText size={20} />}
                </div>
                <h3 className="text-2xl font-black text-earth tracking-tighter italic">{note.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCartoonify(note)}
                  disabled={isProcessing}
                  title="Cartoonify"
                  className="p-2.5 bg-terracotta/10 text-terracotta rounded-2xl hover:bg-terracotta hover:text-white transition-all shadow-sm"
                >
                  <Palette size={18} />
                </button>
                <div className="h-8 w-px bg-sand/30" />
                <button 
                   onClick={() => handleStudyAid(note, 'summary')}
                   disabled={isProcessing}
                   title="Summary"
                   className="p-2.5 bg-sage/10 text-sage rounded-2xl hover:bg-sage hover:text-white transition-all shadow-sm"
                >
                  <Layers size={18} />
                </button>
                <button 
                   onClick={() => handleStudyAid(note, 'mindmap')}
                   disabled={isProcessing}
                   title="Mind Map"
                   className="p-2.5 bg-sand/20 text-clay rounded-2xl hover:bg-clay hover:text-white transition-all shadow-sm"
                >
                  <Map size={18} />
                </button>
                <button 
                   onClick={() => handleStudyAid(note, 'flashcards')}
                   disabled={isProcessing}
                   title="Flashcards"
                   className="p-2.5 bg-terracotta/5 text-terracotta-dark rounded-2xl hover:bg-terracotta-dark hover:text-white transition-all shadow-sm"
                >
                  <CreditCard size={18} />
                </button>
                <button 
                   onClick={() => handleStudyAid(note, 'slides')}
                   disabled={isProcessing}
                   title="Slides"
                   className="p-2.5 bg-earth/5 text-earth rounded-2xl hover:bg-earth hover:text-white transition-all shadow-sm"
                >
                  <Presentation size={18} />
                </button>
                <button 
                   onClick={() => handleStudyAid(note, 'exampaper')}
                   disabled={isProcessing}
                   title="Exam Paper"
                   className="p-2.5 bg-clay/10 text-clay rounded-2xl hover:bg-clay hover:text-white transition-all shadow-sm"
                >
                  <FileCode size={18} />
                </button>
                <button className="p-2.5 text-sand hover:text-terracotta rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className={cn(
              "prose prose-sm max-w-none text-clay leading-relaxed",
              note.type === 'code' ? "font-mono bg-earth/5 p-6 rounded-3xl" : "font-medium"
            )}>
              {note.content}
            </div>
            {note.cartoonDescription && (
              <div className="mt-8 p-6 bg-sage/5 rounded-[32px] border border-sage/20 flex items-center gap-4">
                <div className="p-2 bg-sage rounded-full text-white animate-bounce"><Sparkles size={16} /></div>
                <p className="text-[11px] font-black text-sage uppercase tracking-widest">Ethereal Concept Abstracted</p>
              </div>
            )}
          </motion.div>
        ))}

        {notes.length === 0 && !isAddingNote && (
          <div className="bg-white/40 rounded-[48px] p-24 text-center border-2 border-dashed border-sand flex flex-col items-center">
            <div className="w-24 h-24 bg-sand/20 rounded-full flex items-center justify-center mb-10 text-sand shadow-inner">
               <div className="relative">
                 <FileText size={48} />
                 <Plus size={20} className="absolute -top-2 -right-2 text-terracotta" />
               </div>
            </div>
            <h3 className="text-3xl font-black mb-4 text-earth tracking-tighter uppercase italic">The Void is Still</h3>
            <p className="text-clay font-bold tracking-tight mb-12 max-w-sm italic opacity-60 uppercase text-[10px] leading-loose">Archive your artifacts to begin the transformation process.</p>
            <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/40 backdrop-blur-sm border border-sand rounded-2xl shadow-inner group">
             <div className="w-10 h-10 bg-sand/20 rounded-xl flex items-center justify-center text-sand group-hover:text-terracotta transition-colors">
               <Cpu size={20} />
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-clay">Ethereal Engine</span>
                <span className="text-[10px] font-bold text-earth">v3-Flash Synchronized</span>
             </div>
          </div>
          <button onClick={() => setIsAddingNote(true)} className="px-10 py-4 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-clay transition-all shadow-2xl shadow-earth/20 flex items-center gap-3">
             <Plus size={20} />
             Add Artifact
          </button>
        </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingNote(false)} className="absolute inset-0 bg-earth/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[40px] p-10 shadow-2xl relative w-full max-w-xl">
              <h3 className="text-3xl font-black mb-8 italic tracking-tighter uppercase text-earth">Archive New Artifact</h3>
              <form onSubmit={handleAddNote} className="space-y-8">
                <div className="grid grid-cols-3 gap-2">
                   <TypeBadge active={newNoteType === 'text'} onClick={() => setNewNoteType('text')} icon={<FileText size={16} />} label="Text" />
                   <TypeBadge active={newNoteType === 'code'} onClick={() => setNewNoteType('code')} icon={<Terminal size={16} />} label="Code" />
                   <TypeBadge active={newNoteType === 'image'} onClick={() => setNewNoteType('image')} icon={<Palette size={16} />} label="Visual" />
                   <TypeBadge active={newNoteType === 'video'} onClick={() => setNewNoteType('video')} icon={<Video size={16} />} label="Video" />
                   <TypeBadge active={newNoteType === 'audio'} onClick={() => setNewNoteType('audio')} icon={<Mic size={16} />} label="Voice" />
                   <TypeBadge active={newNoteType === 'document'} onClick={() => setNewNoteType('document')} icon={<Download size={16} />} label="File" />
                </div>
                
                <div className="space-y-4">
                  {newNoteType === 'audio' ? (
                    <VoiceRecorder 
                      onStop={(title, content) => {
                        setNewNoteTitle(title);
                        setNewNoteContent(content);
                      }} 
                    />
                  ) : newNoteType !== 'text' && newNoteType !== 'code' ? (
                    <div 
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className="p-10 border-2 border-dashed border-sand rounded-[32px] bg-sand/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-sand/10 transition-all relative overflow-hidden"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept={
                          newNoteType === 'image' ? 'image/*' :
                          newNoteType === 'video' ? 'video/*' :
                          newNoteType === 'document' ? '.pdf,.doc,.docx,.txt' :
                          '*'
                        }
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                           <div className="h-1 w-full bg-sand/20 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-terracotta" 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                              />
                           </div>
                           <span className="text-[10px] font-black text-terracotta uppercase tracking-widest animate-pulse">Transmitting Artifact...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-clay shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black text-earth uppercase tracking-tight italic">Synchronize {newNoteType}</p>
                            <p className="text-[10px] text-clay/60 font-bold uppercase tracking-widest mt-1">Select from local storage</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-[10px] font-black text-clay/40 uppercase tracking-[0.2em] mb-2">Artifact Designation</label>
                    <input autoFocus type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="e.g. System Decomposition" className="w-full px-5 py-4 bg-ethereal-white border border-sand rounded-2xl focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta outline-none transition-all font-bold placeholder:text-clay/20" />
                  </div>
                  {(newNoteType === 'text' || newNoteType === 'code' || newNoteType === 'audio') && (
                    <div>
                      <label className="block text-[10px] font-black text-clay/40 uppercase tracking-[0.2em] mb-2">Essence</label>
                      <textarea rows={6} value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder={newNoteType === 'code' ? "// Paste your code snippet here..." : "Describe the core insights..."} className="w-full px-5 py-4 bg-ethereal-white border border-sand rounded-2xl focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta outline-none transition-all resize-none placeholder:text-clay/20 font-medium" />
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-5 bg-earth text-sand rounded-[32px] font-black uppercase tracking-widest hover:bg-terracotta transition-all shadow-xl shadow-earth/10">Archive Artifact</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TypeBadge({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all",
        active ? "bg-terracotta/5 border-terracotta text-terracotta shadow-inner" : "border-sand/50 text-clay hover:bg-sand/30"
      )}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Flashcard({ question, answer, index }: { question: string, answer: string, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 h-[300px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white p-8 rounded-[40px] border-2 border-sand shadow-sm flex flex-col items-center justify-center text-center">
          <div className="absolute top-6 left-8 text-[10px] font-black text-terracotta uppercase tracking-[0.4em]">Artifact {index + 1}</div>
          <div className="p-4 bg-terracotta/5 rounded-2xl mb-6">
            <CreditCard size={32} className="text-terracotta" />
          </div>
          <p className="text-xl font-black text-earth italic tracking-tight leading-relaxed">{question}</p>
          <div className="mt-8 text-[9px] font-black text-clay/40 uppercase tracking-widest">Click to reveal essence</div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden bg-earth p-8 rounded-[40px] border-2 border-clay shadow-xl flex flex-col items-center justify-center text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-6 left-8 text-[10px] font-black text-sand/40 uppercase tracking-[0.4em]">Resolution</div>
          <p className="text-lg font-bold text-sand leading-relaxed">{answer}</p>
          <div className="mt-8 text-[9px] font-black text-sand/40 uppercase tracking-widest">Click to return</div>
        </div>
      </motion.div>
    </div>
  );
}

function VoiceRecorder({ onStop }: { onStop: (title: string, content: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-10 bg-terracotta/5 border-2 border-dashed border-terracotta/30 rounded-[32px] flex flex-col items-center gap-6">
      <div className="relative">
        {isRecording && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-terracotta rounded-full blur-2xl"
          />
        )}
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl",
            isRecording ? "bg-earth text-terracotta scale-110" : "bg-terracotta text-white hover:scale-105"
          )}
        >
          {isRecording ? <div className="w-6 h-6 bg-terracotta rounded-sm" /> : <Mic size={32} />}
        </button>
      </div>

      <div className="text-center">
        <p className="text-2xl font-black text-earth tabular-nums">{formatTime(timer)}</p>
        <p className="text-[10px] font-black text-clay uppercase tracking-[0.3em] mt-2">
          {isRecording ? "Capturing Ethereal Voice..." : "Ready to manifest spoken knowledge"}
        </p>
      </div>

      {!isRecording && timer > 0 && (
        <button 
          onClick={() => onStop(`Voice Artifact ${new Date().toLocaleTimeString()}`, "A digital resonance of spoken IT insights.")}
          className="px-8 py-3 bg-earth text-sand rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-clay transition-all"
        >
          Archive Recording
        </button>
      )}
    </div>
  );
}

function NoteResultItem({ note, onClick }: { note: Note, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/60 p-6 rounded-[32px] border border-sand hover:shadow-2xl hover:border-terracotta/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-lg text-earth group-hover:text-terracotta transition-colors italic tracking-tighter">{note.title}</h3>
        <span className="text-[10px] font-black text-terracotta bg-terracotta/5 px-3 py-1 rounded-full uppercase tracking-widest">Resonant Artifact</span>
      </div>
      <p className="text-sm text-clay/80 line-clamp-2 italic">{note.content}</p>
    </div>
  );
}

function PracticalLab({ onBack }: { onBack: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'code'>('code');
  const [color, setColor] = useState('#D98C71');
  const [code, setCode] = useState('// Welcome to the Sanctuary Code Lab...\n\nfunction apprentice() {\n  console.log("I am learning!");\n}');

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 550;
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
  }, [tool]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'code') return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'code') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? 30 : 3;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/80 rounded-2xl shadow-sm border border-sand group transition-all hover:bg-white">
            <ArrowLeft size={22} className="text-earth group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-earth tracking-tighter uppercase italic">Practical Laboratory</h2>
            <p className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em]">IT Sketchpad & Code Sanctuary</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCanvas} className="px-6 py-3 bg-white border border-sand rounded-2xl text-xs font-black uppercase tracking-widest text-clay hover:bg-sand/10 transition-all">Reset Lab</button>
          <button className="flex items-center gap-2 px-6 py-3 bg-earth text-sand rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-clay transition-all shadow-xl shadow-earth/20">
            <Download size={18} /> Sync Progress
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(77,69,62,0.1)] border border-sand flex flex-col h-[750px]">
        <div className="p-6 bg-ethereal-white border-b border-sand flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex bg-sand/20 p-1.5 rounded-2xl border border-sand/30">
              <button 
                onClick={() => setTool('code')}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest", tool === 'code' ? "bg-earth text-white shadow-lg" : "text-clay hover:bg-white/50")}
              >
                <Terminal size={18} /> Code
              </button>
              <button 
                onClick={() => setTool('pen')}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest", tool === 'pen' ? "bg-earth text-white shadow-lg" : "text-clay hover:bg-white/50")}
              >
                <PenTool size={18} /> Canvas
              </button>
              <button 
                onClick={() => setTool('eraser')}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest", tool === 'eraser' ? "bg-earth text-white shadow-lg" : "text-clay hover:bg-white/50")}
              >
                <Eraser size={18} /> Erase
              </button>
            </div>
            
            {tool !== 'code' && (
              <div className="flex gap-3">
                {['#4D453E', '#9CAF88', '#D98C71', '#8C7365', '#E6D5B8'].map(c => (
                  <button 
                    key={c}
                    onClick={() => { setColor(c); setTool('pen'); }}
                    className={cn("w-7 h-7 rounded-full border-4 transition-all hover:scale-125", color === c ? "border-earth ring-4 ring-terracotta/10" : "border-white")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 px-6 py-2 border-l border-sand">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-terracotta">CPU Resonance</span>
               <span className="text-xs font-bold text-earth">82% Operational</span>
             </div>
             <div className="p-3 bg-sage/10 text-sage rounded-2xl animate-pulse"><Cpu size={20} /></div>
          </div>
        </div>
        
        <div className="flex-1 bg-white relative">
          {tool === 'code' ? (
            <div className="w-full h-full p-8 font-mono text-sm leading-relaxed bg-earth/5 focus-within:bg-white transition-all overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-earth/30">
                <div className="w-2.5 h-2.5 rounded-full bg-terracotta/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-sand/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-sage/40" />
                <span className="ml-4 text-[10px] font-black uppercase tracking-[0.3em]">Sanctuary_Node_v1.0.js</span>
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent outline-none resize-none text-earth selection:bg-terracotta/20 custom-scrollbar"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-white cursor-crosshair touch-none overflow-hidden">
              <canvas 
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
