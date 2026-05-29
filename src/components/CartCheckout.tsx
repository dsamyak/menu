import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, CreditCard, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import { CartItem, Dish, OrderDetails } from '../types';

interface CartCheckoutProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CartCheckout({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isOpen,
  onClose,
}: CartCheckoutProps) {
  const [step, setStep] = useState<'cart' | 'details' | 'processing' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableNumber, setTableNumber] = useState('07');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'crypto'>('card');
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const itemTotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const michelinCoverTax = itemTotal > 0 ? 4.50 : 0; // standard fine dining administrative cover
  const grandTotal = itemTotal + michelinCoverTax;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Transition to processing visual state
    setStep('processing');

    setTimeout(() => {
      setOrderId('D-DISH-' + Math.floor(100000 + Math.random() * 900000));
      setStep('success');
    }, 2400); // 2.4 seconds mock network luxury transaction
  };

  const resetAll = () => {
    onClearCart();
    setStep('cart');
    setCustomerName('');
    setCustomerEmail('');
    setTableNumber('07');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="checkout-slide-over-mask">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={step !== 'processing' ? onClose : undefined}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col justify-between" id="checkout-slide-over-body">
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10 bg-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-white tracking-widest uppercase">
                {step === 'success' ? 'Order Complete' : 'Your Basket'}
              </h2>
            </div>
            {step !== 'processing' && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Core Body Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12" id="checkout-empty-basket">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-white/20" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase">Basket is empty</h3>
                      <p className="text-xs text-white/40 mt-3 max-w-[240px] mx-auto leading-relaxed">
                        Return to our 3D showroom and add luxury Chef selections to your ticket.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] tracking-widest uppercase font-bold border border-white/10 transition cursor-pointer"
                    >
                      BROWSE DISHES
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4" id="checkout-item-list">
                    <div className="flex justify-between items-center text-[10px] tracking-widest font-bold text-white/30 border-b border-white/10 pb-3">
                      <span>PRODUCT SELECTION</span>
                      <span>SUBTOTAL</span>
                    </div>

                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between bg-white/5 p-4 rounded-xl border border-white/10"
                      >
                        <div className="space-y-1.5 max-w-[70%]">
                          <h4 className="text-xs font-bold text-white tracking-wide">{item.dish.name}</h4>
                          <p className="text-[10px] text-white/40 truncate italic">{item.dish.tagline}</p>
                          {item.customizationNotes && (
                            <p className="text-[9px] font-mono text-amber-500/80 mt-1">
                              Chef Note: "{item.customizationNotes}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => onUpdateQuantity(idx, -1)}
                              className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white w-2 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(idx, 1)}
                              className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between h-full space-y-6">
                          <span className="text-sm font-medium text-amber-500">
                            ${(item.dish.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-[9px] font-bold tracking-widest uppercase text-rose-500/80 hover:text-rose-400 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 'details' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-5" id="checkout-delivery-form">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/10 pb-3">
                  <span>SHOWROOM TABLE TICKET</span>
                  <span>STEP 2 OF 2</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-white/40 mb-2 uppercase">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Samyak Sam"
                    className="w-full text-xs text-white bg-white/5 px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-white/40 mb-2 uppercase">Email (For receipt)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. guest@restaurant.com"
                    className="w-full text-xs text-white bg-white/5 px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-white/40 mb-2 uppercase">Table Number</label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-xs text-white bg-[#0a0a0a] px-3 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="01">Table 01 - Window Seat</option>
                      <option value="04">Table 04 - VIP Lounge</option>
                      <option value="07">Table 07 - Core Bar</option>
                      <option value="12">Table 12 - Rooftop Edge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-white/40 mb-2 uppercase">Cover Style</label>
                    <div className="w-full text-[11px] text-amber-500 tracking-wider bg-amber-500/10 px-3 py-3 rounded-lg border border-amber-500/30 font-medium flex items-center justify-center uppercase">
                      Michelin Elite
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-white/40 mb-2 uppercase">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 rounded-lg border text-center text-[9px] tracking-widest uppercase transition font-bold ${
                        paymentMethod === 'card'
                          ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-white/10 text-white/40 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      CREDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-3 rounded-lg border text-center text-[9px] tracking-widest uppercase transition font-bold ${
                        paymentMethod === 'apple_pay'
                          ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-white/10 text-white/40 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      APPLE PAY
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`py-3 rounded-lg border text-center text-[9px] tracking-widest uppercase transition font-bold ${
                        paymentMethod === 'crypto'
                          ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-white/10 text-white/40 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      CYBER
                    </button>
                  </div>
                </div>

                {/* Submit button wrapper inside form */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs tracking-widest uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/20 hover:brightness-110 active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    CONFIRM & PLACE ORDER (${grandTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-6" id="checkout-progress">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest text-white uppercase">Processing fine dining order...</h3>
                  <p className="text-[10px] text-white/40 mt-3 max-w-[240px] mx-auto uppercase tracking-widest">
                    Routing tokens to luxury kitchen...
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center space-y-8" id="checkout-finished-ticket">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white tracking-tight leading-tight">VOTRE COMMANDE <br/><span className="text-amber-500">EST EN ROUTE</span></h3>
                  <p className="text-[10px] tracking-widest uppercase text-white/40 mt-4 max-w-[260px] mx-auto">
                    Jacques has approved your receipt. Sizzling preparations have started.
                  </p>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 text-left">
                  <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-bold text-white/30 border-b border-white/10 pb-3">
                    <span>RECEIPT REFERENCE</span>
                    <span className="text-white">{orderId}</span>
                  </div>

                  <div className="space-y-2 mt-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/80">
                        <span>{item.quantity}x {item.dish.name}</span>
                        <span>${(item.dish.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3 text-xs">
                    <div className="flex justify-between text-white/50">
                      <span>Fine Dining Tax Cover</span>
                      <span>${michelinCoverTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-medium text-sm pt-2">
                      <span>Total Ticket</span>
                      <span className="text-amber-500">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-amber-500/70 border-t border-white/10 pt-4 flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-amber-500/70 shrink-0" />
                    <span className="leading-relaxed">Scan this desk receipt at Table **{tableNumber}** to view live prep video.</span>
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] tracking-widest uppercase font-bold border border-white/10 transition cursor-pointer"
                >
                  RETURN TO SHOWROOM
                </button>
              </div>
            )}
          </div>

          {/* Bottom Summary Bar for 'cart' step */}
          {step === 'cart' && cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/20 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-white/40">
                  <span>Cover tax (Admin cover)</span>
                  <span>${michelinCoverTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-light text-white">
                  <span>Estimated Ticket</span>
                  <span className="text-amber-500 font-medium text-xl">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClearCart}
                  className="px-4 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 transition text-[10px] font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap"
                  title="Clear ticket items"
                >
                  Clear
                </button>
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black text-center font-bold text-xs rounded-xl transition shadow-xl shadow-amber-500/20 cursor-pointer uppercase tracking-widest active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
