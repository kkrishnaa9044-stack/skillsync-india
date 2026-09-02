import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Trash2, MessageSquare, Zap } from 'lucide-react';
import { getChatbotResponse, quickQuestions, welcomeMessage, type ChatMessage, type ChatAction } from '@/services/chatbotService';

const STORAGE_KEY = 'skillsync_chat_history';

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {
    // ignore
  }
}

function formatContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let listType: 'ordered' | 'unordered' | null = null;
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    if (listType === 'ordered') {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal ml-5 space-y-1 my-2">
          {listItems.map((item, i) => <li key={i} className="text-sm">{renderInline(item)}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-none ml-1 space-y-1 my-2">
          {listItems.map((item, i) => <li key={i} className="text-sm flex gap-1.5"><span className="text-blue-500 shrink-0">•</span><span>{renderInline(item)}</span></li>)}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-600">
              {tableRows[0].map((cell, i) => (
                <th key={i} className="px-2 py-1.5 text-left font-semibold text-gray-700 dark:text-gray-200">{renderInline(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 dark:border-slate-700/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  }

  for (const line of lines) {
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      inTable = true;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (!cells.every((c) => c.replace(/[-:]/g, '').trim() === '')) {
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ordered') { flushList(); listType = 'ordered'; }
      listItems.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }

    if (line.startsWith('• ')) {
      if (listType !== 'unordered') { flushList(); listType = 'unordered'; }
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${elements.length}`} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${elements.length}`} className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-1">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={`p-${elements.length}`} className="text-sm font-semibold text-gray-900 dark:text-white my-1">{renderInline(line.slice(2, -2))}</p>);
    } else if (line.trim() === '') {
      elements.push(<div key={`br-${elements.length}`} className="h-1" />);
    } else {
      elements.push(<p key={`p-${elements.length}`} className="text-sm text-gray-700 dark:text-gray-300 my-0.5">{renderInline(line)}</p>);
    }
  }

  flushList();
  flushTable();

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contextRef = useRef<{ lastJobRole?: string; lastIndustry?: string; lastState?: string }>({});

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  function detectContext(message: string) {
    const allJobRoles = ['Data Analyst', 'Cybersecurity Analyst', 'Cloud Engineer', 'Full Stack Developer', 'AI Engineer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer', 'Power BI Developer', 'Tableau Developer', 'EV Engineer', 'Robotics Engineer', 'Financial Analyst', 'Risk Analyst', 'Healthcare Data Analyst', 'Medical Lab Technician', 'Solar Energy Engineer', 'Supply Chain Analyst', 'Network Engineer', '5G Network Specialist', 'Cloud Architect', 'Embedded Systems Engineer', 'Automation Engineer', 'Automation Specialist', 'Battery Systems Engineer', 'Automotive Electronics Engineer', 'Wind Energy Technician', 'Retail Analyst', 'BIM Engineer', 'Project Manager', 'Logistics Coordinator'];
    for (const role of allJobRoles) {
      if (message.toLowerCase().includes(role.toLowerCase())) {
        contextRef.current.lastJobRole = role;
        break;
      }
    }
    for (const ind of ['IT & Software', 'Manufacturing', 'Healthcare', 'Automobile', 'BFSI', 'Retail', 'Logistics', 'Renewable Energy', 'Telecom', 'Construction']) {
      if (message.toLowerCase().includes(ind.toLowerCase())) {
        contextRef.current.lastIndustry = ind;
        break;
      }
    }
    const stateNames = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Haryana'];
    for (const s of stateNames) {
      if (message.toLowerCase().includes(s.toLowerCase())) {
        contextRef.current.lastState = s;
        break;
      }
    }
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    detectContext(trimmed);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowQuickQuestions(false);

    const delay = 500 + Math.random() * 700;
    setTimeout(() => {
      const response = getChatbotResponse(trimmed, contextRef.current);
      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        actions: response.actions,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    contextRef.current = {};
    setShowQuickQuestions(true);
  }

  function handleQuickQuestion(question: string) {
    sendMessage(question);
  }

  function handleActionClick(action: ChatAction) {
    navigate(action.path);
    setIsOpen(false);
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open SkillSync AI chatbot'}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-blue-900 hover:bg-blue-800 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 sm:w-[400px] sm:h-[600px] sm:max-h-[85vh] bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeInUp_0.2s_ease-out] border border-gray-100 dark:border-slate-700"
          role="dialog"
          aria-label="SkillSync AI Chat"
        >
          {/* Header */}
          <div className="bg-blue-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">SkillSync AI</p>
                  <span className="flex items-center gap-1 text-[10px] text-green-300">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 truncate">Ask me anything about skills, jobs and industry demand.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hasMessages && (
                <button
                  onClick={clearChat}
                  aria-label="Clear conversation"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 dark:bg-slate-900">
            {!hasMessages && (
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700 max-w-[85%]">
                    {formatContent(welcomeMessage)}
                  </div>
                </div>

                {/* Quick questions */}
                <div className="pl-10">
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => handleQuickQuestion(q.question)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Zap className="w-3 h-3 text-blue-500" />
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700'}`}>
                  {formatContent(msg.content)}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(action)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border border-gray-100 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about skills, jobs, training..."
                aria-label="Type your message"
                className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
              SkillSync AI uses demo data. Press Enter to send, Esc to close.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
