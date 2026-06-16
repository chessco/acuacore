import React, { useState } from 'react';
import { FileText, Files, Lightbulb, Bot, Search, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotesView } from './NotesView';
import { DocumentsView } from './DocumentsView';
import { IdeasView } from './IdeasView';
import { AIAssistantView } from './AIAssistantView';
import { SearchView } from './SearchView';
import { Overview } from './Overview';

export function WorkspaceView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'search', label: 'Search', icon: Search },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview': return <Overview />;
      case 'notes': return <NotesView />;
      case 'documents': return <DocumentsView />;
      case 'ideas': return <IdeasView />;
      case 'ai': return <AIAssistantView />;
      case 'search': return <SearchView />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex gap-4 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${
                isActive ? 'text-brand-blue bg-brand-blue-light/50 shadow-inner' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="workspace-active-tab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
