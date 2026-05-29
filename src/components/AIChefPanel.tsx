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
    <div className="flex flex-col h-full bg-[#0a0a0a] backdrop-blur-md rounded-xl border border-white/10 overflow-hidden" id="ai-chef-chat-panel">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent px-4 py-4 border-b border-white/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
            <ChefHat className="w-5 h-5 text-amber-500" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-sm font-semibold text-white tracking-tight">Chef Jacques</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
              AI SOMMELIER
            </span>
          </div>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5 font-bold">Head Chef</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" style={{ maxHeight: '420px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-white/30 uppercase">
              {msg.role === 'assistant' && <ChefHat className="w-3 h-3 text-amber-500" />}
              <span>{msg.role === 'user' ? 'YOU' : 'CHEF'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-amber-500/10 border border-amber-500/30 rounded-tr-sm text-amber-50'
                  : 'bg-white/5 border border-white/10 rounded-tl-sm text-white/80'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Activated state visual triggers */}
              {msg.suggestedAction && (
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span>Interactive scene triggered: <strong>{msg.suggestedAction.type.toUpperCase()}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-amber-500 font-bold uppercase pl-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Jacques is thinking...</span>
          </div>
        )}
      </div>

      {/* Chat Action Suggestions */}
      <div className="px-4 py-3 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-transparent" id="ai-chef-quick-queries">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.query)}
            disabled={sending}
            className="px-3 py-2 rounded-full text-[10px] font-medium bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 hover:border-amber-500/40 transition cursor-pointer disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Interactive Controls Overlay */}
      <div className="p-4 bg-transparent flex flex-wrap gap-2 items-center justify-between border-t border-white/5" id="ai-chef-manual-sliders">
        <div className="flex items-center gap-3 select-none">
          <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">EXPLODE:</span>
          <button
            onClick={() => onTriggerExplode(explodeLevel > 0 ? 0 : 0.85)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border transition cursor-pointer ${
              explodeLevel > 0
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/80'
            }`}
            title="Slices individual gourmet food layers"
          >
            {explodeLevel > 0 ? 'RESET' : 'DECONSTRUCT'}
          </button>
        </div>

        <div className="flex gap-1.5">
          {(['warm', 'candle', 'cyberpunk', 'cool'] as LightThemeType[]).map((theme) => (
            <button
              key={theme}
              onClick={() => onTriggerTheme(theme)}
              className={`px-2 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-widest border transition ${
                currentTheme === theme
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 cursor-pointer'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 bg-transparent">
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
            className="w-full text-xs md:text-sm text-white placeholder-white/30 bg-white/5 pl-4 pr-12 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500/60 disabled:opacity-70 transition"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-40 disabled:grayscale"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
