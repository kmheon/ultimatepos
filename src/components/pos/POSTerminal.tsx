import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  PauseCircle, 
  CreditCard, 
  RotateCcw, 
  Package, 
  Layers, 
  Tag, 
  Check, 
  Sparkles, 
  AlertCircle,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product, Contact, Transaction } from '../../types';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { HeldOrdersModal } from './HeldOrdersModal';
import { QuickAddCustomerModal } from './QuickAddCustomerModal';

export const POSTerminal: React.FC = () => {
  const {
    products,
    categories,
    brands,
    contacts,
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateCartItemQty,
    updateCartItemPrice,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    holdCurrentOrder,
    heldOrders,
    cartSubtotal,
    cartTaxAmount,
    cartDiscountAmount,
    cartTotal,
    settings,
  } = usePOS();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [holdNote, setHoldNote] = useState('');
  const [showHoldPrompt, setShowHoldPrompt] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || product.brandId === selectedBrand;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.barcode.includes(q);

      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery]);

  // Filter customers for dropdown
  const filteredCustomers = useMemo(() => {
    const customersOnly = contacts.filter(c => c.type === 'customer' || c.type === 'both');
    if (!customerSearch.trim()) return customersOnly;
    const q = customerSearch.toLowerCase();
    return customersOnly.filter(
      c => c.name.toLowerCase().includes(q) || (c.mobile && c.mobile.includes(q)) || (c.businessName && c.businessName.toLowerCase().includes(q))
    );
  }, [contacts, customerSearch]);

  // Global POS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a modal text area
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsCheckoutOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setShowHoldPrompt(true);
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (heldOrders.length > 0) setIsHeldModalOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddCustomerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldOrders]);

  // Handle barcode search enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const exactMatch = products.find(
      p => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (exactMatch) {
      addToCart(exactMatch, 1);
      setSearchQuery('');
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    holdCurrentOrder(holdNote.trim() || undefined);
    setHoldNote('');
    setShowHoldPrompt(false);
  };

  const handleCheckoutSuccess = (tx: Transaction) => {
    setIsCheckoutOpen(false);
    setCompletedTx(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* LEFT: Product Catalog & Category Nav */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 border-r border-slate-200">
        {/* Top Control Bar: Search & Category Chips */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products by Name, SKU, or Scan Barcode (Press Enter)..."
                className="w-full pl-9 pr-24 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-medium text-slate-800"
              />
              <div className="absolute right-2.5 top-2 flex items-center gap-1 text-[11px] text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">
                <Barcode className="w-3.5 h-3.5 text-slate-500" />
                <span>Scanner</span>
              </div>
            </form>

            {/* Brand Filter */}
            <div className="relative hidden sm:block">
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 py-2 px-3 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Brands</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips Scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Items ({products.length})
            </button>

            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <Package className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-sm text-slate-600">No matching products found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or selected category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(c => c.product.id === product.id);
                const isOutOfStock = product.currentStock <= 0;
                const isLowStock = product.currentStock > 0 && product.currentStock <= product.alertQuantity;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product, 1)}
                    className={`group relative bg-white rounded-xl border transition-all duration-150 flex flex-col overflow-hidden select-none cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : inCart
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-28 sm:h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-xs">
                            {product.currentStock} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-600/90 text-white px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs">
                            Stock: {product.currentStock}
                          </span>
                        )}
                      </div>

                      {/* In-Cart Badge */}
                      {inCart && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 font-mono">
                          <span>{product.sku}</span>
                          <span>{product.unit}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          {settings.currencySymbol}
                          {product.sellingPrice.toFixed(2)}
                        </span>
                        <button
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Billing Terminal */}
      <div className="w-full lg:w-[420px] xl:w-[460px] bg-white flex flex-col h-full shrink-0 shadow-lg border-l border-slate-200 z-10">
        {/* Customer Header */}
        <div className="p-3 bg-slate-900 text-white border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Account
            </span>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Customer</span>
            </button>
          </div>

          {/* Customer Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold truncate">{selectedCustomer.name}</span>
                {selectedCustomer.mobile && selectedCustomer.mobile !== 'N/A' && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">({selectedCustomer.mobile})</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search customer by name or phone..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowCustomerDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        c.id === selectedCustomer.id ? 'bg-blue-50/80 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.businessName || c.mobile}</p>
                      </div>
                      {c.totalSaleDue && c.totalSaleDue > 0 ? (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          Due: {settings.currencySymbol}{c.totalSaleDue.toFixed(2)}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">POS Cart is Empty</p>
              <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
                Click on products on the left or scan barcodes to begin billing.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-xs text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">{item.product.sku}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateCartItemQty(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-9 text-center text-xs font-bold bg-transparent border-0 focus:outline-hidden text-slate-900"
                    />
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price input */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[11px] text-slate-400">@</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateCartItemPrice(item.product.id, parseFloat(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded text-right focus:bg-white"
                    />
                  </div>

                  {/* Subtotal */}
                  <span className="font-extrabold text-xs text-slate-900">
                    {settings.currencySymbol}
                    {item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Hold / Action Banner */}
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHeldModalOpen(true)}
              className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Held ({heldOrders.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <>
                {showHoldPrompt ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Hold note (optional)..."
                      value={holdNote}
                      onChange={e => setHoldNote(e.target.value)}
                      className="px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded"
                    />
                    <button
                      onClick={handleHoldOrder}
                      className="px-2 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded"
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => setShowHoldPrompt(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHoldPrompt(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    Hold Cart
                  </button>
                )}
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Financial Summary & Checkout */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {/* Detailed Calculations */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">
                {settings.currencySymbol}
                {cartSubtotal.toFixed(2)}
              </span>
            </div>
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-semibold">
                  -{settings.currencySymbol}
                  {cartDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{settings.taxName} ({settings.taxRate}%):</span>
              <span className="font-semibold text-slate-800">
                {settings.currencySymbol}
                {cartTaxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
              <span className="font-bold text-sm">Grand Total:</span>
              <span className="text-2xl font-black text-blue-600 tracking-tight">
                {settings.currencySymbol}
                {cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Pay Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              disabled={cart.length === 0}
              onClick={() => {
                if (cart.length === 0) return;
                setIsCheckoutOpen(true);
              }}
              className={`sm:col-span-3 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 active:scale-98'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay & Checkout ({settings.currencySymbol}{cartTotal.toFixed(2)})</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 bg-emerald-800/60 rounded text-[10px] font-mono">F8</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={completedTx}
      />

      <HeldOrdersModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
      />

      <QuickAddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerCreated={newCustomer => setSelectedCustomer(newCustomer)}
      />
    </div>
  );
};
