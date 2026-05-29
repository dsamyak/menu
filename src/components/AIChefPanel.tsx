import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChefHat, RotateCcw, Flame } from 'lucide-react';
import { Dish, ChatMessage, LightThemeType } from '../types';

interface AIChefPanelProps {
  selectedDish: Dish;
  onTriggerTheme: (theme: LightThemeType) => void;
  onTriggerExplode: (level: number) => void;
  onAddToCart: () => void;
  explodeLevel: number;
  currentTheme: LightThemeType;
}

export function AIChefPanel({
  selectedDish,
  onTriggerTheme,
  onTriggerExplode,
  onAddToCart,
  explodeLevel,
  currentTheme,
}: AIChefPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set initial welcome greeting depending on the active dish
  useEffect(() => {
    setMessages([
      {
        id: 'init-Jacques',
        role: 'assistant',
        content: `Greetings, culinary traveler! I am **Chef Jacques**. 
You are inspecting my crafted masterwork: the *${selectedDish.name}*. 

Ask me anything about its rare ingredients, organic sourcing, or secret culinary assemblies. You can evenask me to *deconstruct the layers* in front of your eyes or *dim the lights* to standard candlelight!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [selectedDish]);

  // Keep messages scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const rawQuery = textToSend || input;
    if (!rawQuery.trim() || sending) return;

    if (!textToSend) setInput('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: rawQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chef/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawQuery,
          dishName: selectedDish.name,
          dishDetails: selectedDish,
          chatHistory: messages.slice(-4), // Send recent context
        }),
      });

      if (!response.ok) throw new Error('Failed to ask Chef');
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction?.type !== 'none' ? data.suggestedAction : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Apply automatic scene trigger from Chef's thoughts
      if (data.suggestedAction && data.suggestedAction.type !== 'none') {
        const { type, value } = data.suggestedAction;
        if (type === 'set_theme') {
          onTriggerTheme(value as LightThemeType);
        } else if (type === 'explode_layers') {
          onTriggerExplode(parseFloat(value));
        } else if (type === 'add_to_cart') {
          onAddToCart();
        }
      }
    } catch (err) {
      console.error(err);
      const errResponse: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: `My apologies. The kitchen has grown chaotic. Let's inspect the **${selectedDish.name}** or adjust its ingredients. What can I clarify about this gourmet recipe?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errResponse]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    { label: '🍷 Suggest wine pairings', query: 'What wine pairings go best with this dish?' },
    { label: '🍔 Explode layers', query: 'Deconstruct the layers so I can inspect what is inside' },
    { label: '🕯️ Romantic vibe', query: 'Change the visual theme of the restaurant to candlelight' },
    { label: '⚡ Cyberpunk lighting', query: 'I want a high-contrast cyberpunk visual theme for this dish' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/60 backdrop-blur-md rounded-xl border border-slate-900 overflow-hidden" id="ai-chef-chat-panel">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600/20 to-slate-950 px-4 py-3 border-b border-rose-950/20">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
            <ChefHat className="w-5 h-5 text-amber-400" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-sans text-sm font-semibold text-slate-100 tracking-tight">Chef Jacques</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
              AI SOMMELIER
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Head Chef & Culinary Director</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" style={{ maxHeight: '420px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              {msg.role === 'assistant' && <ChefHat className="w-3 h-3 text-amber-500/80" />}
              <span>{msg.role === 'user' ? 'YOU' : 'CHEF JACQUES'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 md:text-[13px] leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-amber-600/20 border border-amber-500/40 rounded-tr-sm'
                  : 'bg-slate-900/90 border border-slate-800 rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Activated state visual triggers */}
              {msg.suggestedAction && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span>Interactive scene triggered: <strong>{msg.suggestedAction.type.toUpperCase()}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono pl-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Chef Jacques is studying ingredients...</span>
          </div>
        )}
      </div>

      {/* Chat Action Suggestions */}
      <div className="px-4 py-2 border-t border-slate-900/60 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-950/40" id="ai-chef-quick-queries">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.query)}
            disabled={sending}
            className="px-2.5 py-1.5 rounded-full text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Interactive Controls Overlay */}
      <div className="p-3 bg-slate-950 flex flex-wrap gap-2 items-center justify-between border-t border-slate-900" id="ai-chef-manual-sliders">
        <div className="flex items-center gap-2 select-none">
          <span className="text-[10px] font-mono text-slate-400">EXPLODE:</span>
          <button
            onClick={() => onTriggerExplode(explodeLevel > 0 ? 0 : 0.85)}
            className={`p-1.5 rounded text-xs font-mono border transition ${
              explodeLevel > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
            }`}
            title="Slices individual gourmet food layers"
          >
            {explodeLevel > 0 ? 'RESET ASSEMBLY' : 'DECONSTRUCT LAYER'}
          </button>
        </div>

        <div className="flex gap-1">
          {(['warm', 'candle', 'cyberpunk', 'cool'] as LightThemeType[]).map((theme) => (
            <button
              key={theme}
              onClick={() => onTriggerTheme(theme)}
              className={`px-1.5 py-1 rounded text-[9px] uppercase font-mono border transition ${
                currentTheme === theme
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 bg-slate-950 border-t border-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-full flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={`Ask Jacques about the ${selectedDish.name}...`}
            className="w-full text-xs md:text-sm text-slate-100 placeholder-slate-500 bg-slate-900 pl-4 pr-12 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500/60 disabled:opacity-70 transition"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="absolute right-1.5 p-1.5 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer disabled:opacity-40 disabled:hover:bg-amber-500"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
