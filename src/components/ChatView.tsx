import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatViewProps {
  messages: any[];
  input: string;
  setInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isTyping: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  placeholder: string;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, input, setInput, onSend, isTyping, title, subtitle, icon, placeholder, chatEndRef 
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] min-h-[400px]">
      <div className="flex items-center mb-4 md:mb-6 flex-shrink-0">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 bg-white shadow-sm border border-stone-100`}>
          {icon}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">{title}</h1>
          <p className="text-[10px] md:text-sm font-bold text-stone-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 bg-white border border-stone-200 rounded-[24px] md:rounded-[40px] flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 bg-stone-50/30 [&::-webkit-scrollbar]:hidden">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' || !msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl max-w-[90%] md:max-w-[80%] text-xs md:text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' || (!msg.isAdmin && msg.content) ? `bg-stone-900 text-white rounded-tr-sm` : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm whitespace-pre-wrap'}`}>
                {msg.text || msg.content}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-stone-400 font-bold text-xs md:text-sm ml-2 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-2"/> Procesando...</div>}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={onSend} className="p-2 md:p-4 bg-white border-t border-stone-200 relative m-2 md:m-4 rounded-xl md:rounded-[24px] shadow-sm">
          <input 
            type="text" 
            placeholder={placeholder} 
            className="w-full pl-4 md:pl-6 pr-12 md:pr-16 py-3 md:py-4 bg-stone-50 border border-stone-200 rounded-lg md:rounded-2xl outline-none font-medium text-xs md:text-sm focus:border-stone-400 focus:bg-white transition-colors" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            disabled={isTyping} 
          />
          <button type="submit" disabled={!input.trim() || isTyping} className={`absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-stone-900 text-white rounded-lg md:rounded-xl shadow-md disabled:opacity-50 active:scale-95 transition-all`}>
            <Send className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;