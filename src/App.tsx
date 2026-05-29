import { useState } from 'react';
import { ChefHat, ShoppingBag, Eye, HelpCircle, Star, Flame, Clock, Heart, Sliders, Sparkles } from 'lucide-react';
import { DISHES } from './data';
import { Dish, CartItem, LightThemeType } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { AIChefPanel } from './components/AIChefPanel';
import { CartCheckout } from './components/CartCheckout';

export default function App() {
  const [selectedDish, setSelectedDish] = useState<Dish>(DISHES[0]);
  const [lightTheme, setLightTheme] = useState<LightThemeType>(DISHES[0].defaultTheme);
  const [explodeLevel, setExplodeLevel] = useState<number>(0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [hoveredIngredient, setHoveredIngredient] = useState<string | null>(null);

  // Cart / Order state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Customization controls
  const [customNotes, setCustomNotes] = useState('');
  const [selectedAdjustments, setSelectedAdjustments] = useState<Record<string, boolean>>({});

  const handleSelectDish = (dish: Dish) => {
    setSelectedDish(dish);
    setLightTheme(dish.defaultTheme);
    setExplodeLevel(0);
    setCustomNotes('');
    setSelectedAdjustments({});
  };

  const handleToggleAdjustment = (adjName: string) => {
    setSelectedAdjustments((prev) => ({
      ...prev,
      [adjName]: !prev[adjName],
    }));
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      dish: selectedDish,
      quantity: 1,
      customizationNotes: customNotes,
      selectedAdjustments: { ...selectedAdjustments },
    };

    setCart((prev) => [...prev, item]);
    setIsCartOpen(true); // Open basket so they see their gorgeous selection added

    // Small reset
    setCustomNotes('');
    setSelectedAdjustments({});
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity = Math.max(1, copy[index].quantity + delta);
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none overflow-hidden" id="applet-view-root">
      {/* Immersive Top Bar */}
      <header className="h-16 px-8 bg-black/40 border-b border-white/10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
            <ChefHat className="w-5 h-5 text-black" />
          </div>
          <div className="flex items-center">
            <h1 className="text-xl font-medium tracking-tight text-white uppercase mt-0.5">D-DISH</h1>
            <span className="text-amber-500 uppercase text-[10px] tracking-[0.2em] ml-2 font-bold mt-1">Showcase</span>
          </div>
        </div>

        {/* Global Stats bar & Cart toggler */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-medium tracking-wide">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>KITCHEN STATUS: <strong className="text-emerald-400 font-bold uppercase">READY</strong></span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center cursor-pointer hover:bg-amber-500/20 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] flex items-center justify-center rounded-full text-black font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Immersive Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#050505]">
        
        {/* Left Specification & Customization Rail */}
        <section className="w-full lg:w-[420px] xl:w-[480px] lg:border-r border-white/5 bg-black/40 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-64px)] backdrop-blur-md" id="left-culinary-info-sidebar">
          
          {/* 1. Curated Dish Selector Slider */}
          <div className="p-8 border-b border-white/5 bg-transparent">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-4">
              SELECT SIGNATURE OFFERINGS
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {DISHES.map((dish) => {
                const isSelected = selectedDish.id === dish.id;
                return (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(dish)}
                    className={`flex-1 min-w-[160px] text-left p-4 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-white/10 to-transparent border-amber-500 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-amber-500/80 mb-2 uppercase tracking-widest">
                      {dish.category}
                    </span>
                    <h3 className={`text-sm font-medium leading-tight truncate ${isSelected ? 'text-amber-500' : 'text-white'}`}>
                      {dish.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-4 text-[11px] font-medium text-white/40">
                      <span>${dish.price.toFixed(2)}</span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {dish.rating}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gourmet Information View */}
          <div className="p-8 space-y-6 border-b border-white/5 bg-transparent">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-500 tracking-[0.3em] uppercase">
                  {selectedDish.category} Selection
                </span>
              </div>

              <h2 className="text-4xl font-light tracking-tight text-white leading-tight">
                {selectedDish.name}
              </h2>
              <p className="text-xs text-amber-500/80 font-mono mt-3 italic leading-relaxed">
                "{selectedDish.tagline}"
              </p>
              <p className="text-sm text-white/40 mt-4 leading-relaxed max-w-sm">
                {selectedDish.longDescription}
              </p>
            </div>
            
            {/* Quick stats replacing old pills */}
            <div className="flex gap-10 mt-6 pt-2">
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Prep Time</div>
                <div className="text-lg font-light text-white flex items-center gap-2"><Clock className="w-4 h-4 text-white/40"/> {selectedDish.prepTime}</div>
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Energy</div>
                <div className="text-lg font-light text-white flex items-center gap-2"><Flame className="w-4 h-4 text-white/40"/> {selectedDish.calories} <span className="text-white/40 text-sm">kcal</span></div>
              </div>
            </div>

            {/* Chef Tip Callout */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-start mt-4">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[10px] tracking-widest font-bold text-white/60 uppercase">Chef Jacques' Recommendation</h4>
                <p className="text-xs text-white/50 leading-relaxed max-w-xs">{selectedDish.chefTip}</p>
              </div>
            </div>
          </div>

          {/* 3. Ingredient Interactive Board */}
          <div className="p-8 border-b border-white/5 bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] tracking-widest font-bold text-white/30 uppercase">
                Ingredients Visualization
              </h3>
              <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest">Hover to Inspect</span>
            </div>

            <div className="space-y-3" id="spec-sheet-ingredients">
              {selectedDish.ingredients.map((ing, idx) => (
                <div
                  key={ing.name}
                  onMouseEnter={() => setHoveredIngredient(ing.name)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition cursor-pointer select-none ${
                    hoveredIngredient && ing.name.toLowerCase().includes(hoveredIngredient.toLowerCase())
                      ? 'bg-white/10 border-amber-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-mono text-white/20 uppercase">
                    OBJ {idx+1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{ing.name}</div>
                    <div className="h-1 w-full bg-white/10 rounded-full mt-2">
                       <div className="h-full bg-white/30 rounded-full transition-all duration-300" style={{ width: `${Math.max(20, 100 - (idx * 20))}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-white/40">{ing.quantity}</div>
                    {ing.optional && <div className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest mt-1">Add-on</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Ticket Customization Block */}
          <div className="p-8 border-b border-white/5 bg-transparent">
            <h3 className="text-[10px] tracking-widest font-bold text-white/30 mb-4 uppercase">
              Customize Experience
            </h3>

            <div className="space-y-6">
              {/* Extra toppings */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">Culinary Alterations</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Extra White Truffle Butter', 'Glistening Glaze', 'Dredged Chili Shards', 'Foil Flakes'].map((adj) => {
                    const isSelected = !!selectedAdjustments[adj];
                    return (
                      <button
                        key={adj}
                        type="button"
                        onClick={() => handleToggleAdjustment(adj)}
                        className={`h-11 px-3 rounded-lg text-xs font-medium border transition cursor-pointer select-none text-left truncate leading-tight ${
                          isSelected
                            ? 'bg-white/10 border-amber-500 text-white shadow-lg'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-amber-500/50 hover:bg-white/10'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {adj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Written request notes */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">
                  Special Request
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Any preparation notes for Head Chef Jacques..."
                  rows={2}
                  className="w-full text-xs text-white placeholder-white/30 bg-white/5 p-4 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
              >
                <span className="font-bold uppercase tracking-widest text-xs sm:text-sm text-black">Add to Experience</span>
                <span className="font-medium text-black text-sm">${(selectedDish.price).toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* 5. Embedded Conversational AI Jacques Chat */}
          <div className="p-8 flex-1 min-h-[500px]">
            <AIChefPanel
              selectedDish={selectedDish}
              onTriggerTheme={setLightTheme}
              onTriggerExplode={setExplodeLevel}
              onAddToCart={handleAddToCart}
              explodeLevel={explodeLevel}
              currentTheme={lightTheme}
            />
          </div>
        </section>

        {/* Right 3D Render Viewport Area */}
        <section className="flex-1 relative flex flex-col min-h-[500px] lg:h-auto overflow-hidden bg-[#050505]" id="right-viewport-canvas-container">
          
          {/* Floating UI: Top Viewport Overlay Controls */}
          <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-4 select-none" id="viewport-stage-overlay-controls">
            {/* Visual Lights Theme Selector */}
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-1 px-2 shadow-lg">
              <span className="text-[10px] font-bold text-white/40 px-3 uppercase tracking-widest">Theme</span>
              <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
              {(['warm', 'cool', 'cyberpunk', 'candle'] as LightThemeType[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setLightTheme(theme)}
                  className={`px-3 py-1.5 text-[10px] text-center font-bold uppercase tracking-widest rounded-full transition cursor-pointer ${
                    lightTheme === theme
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            {/* Wireframe Toggle */}
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-4 py-1.5 bg-white/5 backdrop-blur-xl border rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-2 cursor-pointer ${
                wireframe
                  ? 'border-amber-500 text-amber-500'
                  : 'border-white/10 text-white/40 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{wireframe ? 'Solid' : 'Wireframe'}</span>
            </button>
          </div>

          {/* Interactive Floating Sliders */}
          <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-2" id="explode-slider-container">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 shadow-lg flex items-center gap-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0">Deconstruct</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeLevel}
                onChange={(e) => setExplodeLevel(parseFloat(e.target.value))}
                className="w-28 sm:w-32 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Three.js Render Stage */}
          <div className="w-full h-full min-h-[500px]">
            {/* Soft Ambient Radiance behind canvas matching design template */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#2a2a2e_0%,#050505_100%)]"></div>
            <div className="absolute w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <ThreeCanvas
              selectedDish={selectedDish}
              lightTheme={lightTheme}
              explodeLevel={explodeLevel}
              wireframe={wireframe}
              onHoverIngredient={setHoveredIngredient}
              hoveredIngredientName={hoveredIngredient}
            />
          </div>

          {/* Interactive UI bottom pills */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full pointer-events-none select-none">
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest pb-0.5">Drag to Rotate</div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest pb-0.5 whitespace-nowrap">Hover List to Inspect</div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest pb-0.5">Scroll to Zoom</div>
          </div>
        </section>
      </main>

      {/* Cart checkout Slideover Drawer */}
      <CartCheckout
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
