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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="applet-view-root">
      {/* Immersive Top Bar */}
      <header className="px-6 py-4 bg-slate-950/95 border-b border-slate-900 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-950/20">
            <ChefHat className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase sm:text-base">D-DISH 3D</h1>
            <p className="text-[9px] font-mono tracking-widest text-amber-500/80">CRAFTING SPATIAL GASTRONOMY</p>
          </div>
        </div>

        {/* Global Stats bar & Cart toggler */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>KITCHEN STATUS: <strong className="text-emerald-400 font-semibold uppercase">READY</strong></span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-slate-950 text-xs sm:text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Ticket</span>
            {cart.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-amber-500 min-w-[20px] text-center border border-amber-500/20">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Immersive Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-950">
        
        {/* Left Specification & Customization Rail */}
        <section className="w-full lg:w-[480px] xl:w-[520px] lg:border-r border-slate-900 bg-slate-950 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-73px)]" id="left-culinary-info-sidebar">
          
          {/* 1. Curated Dish Selector Slider */}
          <div className="p-5 border-b border-slate-900 bg-slate-950/40">
            <h2 className="text-[11px] font-mono tracking-wider text-slate-500 mb-3 uppercase">
              SELECT SIGNATURE OFFERINGS
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {DISHES.map((dish) => {
                const isSelected = selectedDish.id === dish.id;
                return (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(dish)}
                    className={`flex-1 min-w-[155px] text-left p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-900 to-slate-950/80 border-amber-500/60 shadow-lg'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/50'
                    }`}
                  >
                    <span className="block text-[10px] font-mono text-amber-500/80 mb-1">
                      {dish.category.toUpperCase()}
                    </span>
                    <h3 className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-amber-500' : 'text-slate-200'}`}>
                      {dish.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                      <span>${dish.price.toFixed(2)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {dish.rating}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gourmet Information View */}
          <div className="p-5 space-y-4 border-b border-slate-900">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-medium">
                  {selectedDish.category}
                </span>
                
                <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    {selectedDish.calories} kcal
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedDish.prepTime}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold font-sans mt-2.5 text-slate-100 tracking-tight leading-snug">
                {selectedDish.name}
              </h2>
              <p className="text-xs text-amber-500/90 font-mono mt-1 italic italic leading-relaxed">
                "{selectedDish.tagline}"
              </p>
              <p className="text-xs md:text-[13px] text-slate-400 mt-2.5 leading-relaxed">
                {selectedDish.longDescription}
              </p>
            </div>

            {/* Chef Tip Callout */}
            <div className="p-3 bg-rose-950/10 rounded-xl border border-rose-950/20 flex gap-2.5 items-start">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase">Chef Jacques' Recommendation</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{selectedDish.chefTip}</p>
              </div>
            </div>
          </div>

          {/* 3. Ingredient Interactive Board */}
          <div className="p-5 border-b border-slate-900 bg-slate-950/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
                INTERACTIVE INGREDIENT LIST
              </h3>
              <span className="text-[9px] font-mono text-amber-500/70">HOVER ITEM TO HIGHLIGHT IN 3D</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="spec-sheet-ingredients">
              {selectedDish.ingredients.map((ing) => (
                <div
                  key={ing.name}
                  onMouseEnter={() => setHoveredIngredient(ing.name)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                  className={`p-2.5 rounded-lg border text-left transition select-none ${
                    hoveredIngredient && ing.name.toLowerCase().includes(hoveredIngredient.toLowerCase())
                      ? 'bg-amber-600/10 border-amber-500/60 text-slate-100'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:border-slate-800'
                  }`}
                >
                  <div className="font-semibold text-xs truncate">{ing.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex justify-between">
                    <span>{ing.quantity}</span>
                    {ing.optional && <span className="text-amber-500/70 font-bold uppercase text-[8px]">Optional addon</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Ticket Customization Block */}
          <div className="p-5 border-b border-slate-900 bg-slate-950">
            <h3 className="text-[11px] font-mono tracking-wider text-slate-500 mb-3.5 uppercase">
              CUSTOMIZE PREPARATION
            </h3>

            <div className="space-y-4">
              {/* Extra toppings */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-2 uppercase">CULINARY ALTERATIONS</label>
                <div className="flex flex-wrap gap-2">
                  {['Extra White Truffle Butter', 'Glistening Glaze', 'Dredged Chili Shards', 'Foil Flakes'].map((adj) => {
                    const isSelected = !!selectedAdjustments[adj];
                    return (
                      <button
                        key={adj}
                        type="button"
                        onClick={() => handleToggleAdjustment(adj)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
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
                <label className="block text-[10px] font-mono text-slate-400 mb-2 uppercase">
                  SPECIAL REQUEST TO JACQUES
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Please sear burger medium-rare / cook ramen broth extra spicy with green sprouts..."
                  rows={2}
                  className="w-full text-xs text-slate-200 placeholder-slate-600 bg-slate-900 p-3 rounded-lg border border-slate-850 focus:outline-none focus:border-amber-500/60 transition resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-slate-950 font-sans font-bold text-xs rounded-xl transition tracking-wider shadow-lg shadow-amber-950/20 cursor-pointer text-center uppercase"
              >
                ADD SELECTION TO ORDER TICKET — ${(selectedDish.price).toFixed(2)}
              </button>
            </div>
          </div>

          {/* 5. Embedded Conversational AI Jacques Chat */}
          <div className="p-5 flex-1 min-h-[500px]">
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
        <section className="flex-1 relative flex flex-col min-h-[500px] lg:h-auto" id="right-viewport-canvas-container">
          
          {/* Floating UI: Top Viewport Overlay Controls */}
          <div className="absolute top-5 left-5 z-20 flex flex-wrap gap-2 select-none" id="viewport-stage-overlay-controls">
            {/* Visual Lights Theme Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-850 rounded-lg p-1 shadow-lg">
              <span className="text-[9px] font-mono font-semibold text-slate-500 px-2 uppercase">Theme</span>
              {(['warm', 'cool', 'cyberpunk', 'candle'] as LightThemeType[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setLightTheme(theme)}
                  className={`px-2.5 py-1 text-[10px] font-mono leading-none font-bold uppercase rounded transition cursor-pointer ${
                    lightTheme === theme
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            {/* Wireframe Toggle */}
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-2 bg-slate-950/85 backdrop-blur-md border rounded-lg shadow-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                wireframe
                  ? 'border-amber-500 text-amber-400'
                  : 'border-slate-850 text-slate-400 hover:text-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{wireframe ? 'Solid' : 'Wireframe'}</span>
            </button>
          </div>

          {/* Interactive Floating Sliders */}
          <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-2" id="explode-slider-container">
            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-850 rounded-lg p-3 shadow-lg flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">DECONSTRUCT LAYERS</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeLevel}
                onChange={(e) => setExplodeLevel(parseFloat(e.target.value))}
                className="w-28 sm:w-36 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Three.js Render Stage */}
          <div className="w-full h-full min-h-[500px]">
            <ThreeCanvas
              selectedDish={selectedDish}
              lightTheme={lightTheme}
              explodeLevel={explodeLevel}
              wireframe={wireframe}
              onHoverIngredient={setHoveredIngredient}
              hoveredIngredientName={hoveredIngredient}
            />
          </div>

          {/* Tiny Info Banner inside Scene viewport */}
          <div className="absolute bottom-5 left-5 z-20 bg-slate-950/80 backdrop-blur-sm px-3.5 py-2.5 rounded-lg border border-slate-900 text-[11px] font-mono text-slate-400 select-none max-w-sm hidden sm:block">
            🎁 Drag mouse to orbit. Scroll wheel zooms. Hover over the ingredient list in the sidebar on the left to highlight parts.
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
