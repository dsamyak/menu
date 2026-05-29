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
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col justify-between" id="checkout-slide-over-body">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                {step === 'success' ? 'Order Complete' : 'Your Gourmet Basket'}
              </h2>
            </div>
            {step !== 'processing' && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition"
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
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">Basket is empty</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
                        Return to our 3D showroom and add luxury Chef selections to your ticket.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-800 transition cursor-pointer"
                    >
                      BROWSE DISHES
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4" id="checkout-item-list">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-500 border-b border-slate-900 pb-2">
                      <span>PRODUCT SELECTION</span>
                      <span>SUBTOTAL</span>
                    </div>

                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-900"
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <h4 className="text-xs font-semibold text-slate-200">{item.dish.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{item.dish.tagline}</p>
                          {item.customizationNotes && (
                            <p className="text-[9px] font-mono text-amber-500/80">
                              Chef Note: "{item.customizationNotes}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onUpdateQuantity(idx, -1)}
                              className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono text-slate-200">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(idx, 1)}
                              className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between h-full space-y-4">
                          <span className="text-xs font-mono font-medium text-amber-500">
                            ${(item.dish.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-[10px] font-mono text-rose-500/80 hover:text-rose-400 text-right underline decoration-dotted"
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
              <form onSubmit={handleCheckoutSubmit} className="space-y-4" id="checkout-delivery-form">
                <div className="flex justify-between items-center text-xs font-mono text-slate-500 border-b border-slate-900 pb-2">
                  <span>SHOWROOM TABLE TICKET</span>
                  <span>STEP 2 OF 2</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Samyak Sam"
                    className="w-full text-xs text-slate-200 bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Email (For receipt)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. guest@restaurant.com"
                    className="w-full text-xs text-slate-200 bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Table Number</label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-xs text-slate-200 bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="01">Table 01 - Window Seat</option>
                      <option value="04">Table 04 - VIP Lounge</option>
                      <option value="07">Table 07 - Core Bar</option>
                      <option value="12">Table 12 - Rooftop Edge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Cover Style</label>
                    <div className="w-full text-xs text-amber-500/80 bg-amber-500/5 px-3 py-2.5 rounded-lg border border-amber-900/30 font-mono font-medium flex items-center justify-center">
                      ⚜️ Michelin Elite
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 rounded-lg border text-center text-[11px] leading-snug font-mono transition font-medium ${
                        paymentMethod === 'card'
                          ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                          : 'border-slate-900 text-slate-400 bg-slate-900/30'
                      }`}
                    >
                      CREDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-2 rounded-lg border text-center text-[11px] leading-snug font-mono transition font-medium ${
                        paymentMethod === 'apple_pay'
                          ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                          : 'border-slate-900 text-slate-400 bg-slate-900/30'
                      }`}
                    >
                      APPLE PAY
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`py-2 rounded-lg border text-center text-[11px] leading-snug font-mono transition font-medium ${
                        paymentMethod === 'crypto'
                          ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                          : 'border-slate-900 text-slate-400 bg-slate-900/30'
                      }`}
                    >
                      CYBER COINS
                    </button>
                  </div>
                </div>

                {/* Submit button wrapper inside form */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-sans font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xl shadow-amber-950/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    CONFIRM & PLACE ORDER (${grandTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-5" id="checkout-progress">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Processing fine dining order...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto font-mono">
                    Routing security tokens to luxury kitchen...
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center space-y-6" id="checkout-finished-ticket">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">VOTRE COMMANDE EST EN ROUTE!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto">
                    Jacques has approved your receipt. Sizzling preparations have started.
                  </p>
                </div>

                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3.5 text-left font-mono">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800 pb-2">
                    <span>RECEIPT REFERENCE</span>
                    <span className="text-slate-300 font-semibold">{orderId}</span>
                  </div>

                  <div className="space-y-1.5">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-300">
                        <span>{item.quantity}x {item.dish.name}</span>
                        <span>${(item.dish.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Fine Dining Tax Cover</span>
                      <span>${michelinCoverTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-200 font-semibold text-sm pt-1">
                      <span>Total Ticket</span>
                      <span className="text-amber-500">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-slate-800/50 pt-2 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-500/70" />
                    <span>Scan this desk receipt at Table **{tableNumber}** to view live prep video.</span>
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition cursor-pointer"
                >
                  RETURN TO SHOWROOM
                </button>
              </div>
            )}
          </div>

          {/* Bottom Summary Bar for 'cart' step */}
          {step === 'cart' && cart.length > 0 && (
            <div className="p-6 border-t border-slate-900 bg-slate-950 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>Cover tax (Administrative cover)</span>
                  <span>${michelinCoverTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>Estimated Ticket</span>
                  <span className="text-amber-500 font-mono text-base">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={onClearCart}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-500 hover:text-rose-400 border border-slate-800 transition text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                  title="Clear ticket items"
                >
                  Clear Bag
                </button>
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-center font-sans font-semibold text-xs rounded-lg transition tracking-wide shadow-xl shadow-amber-950/25 cursor-pointer uppercase"
                >
                  Proceed to Table Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
