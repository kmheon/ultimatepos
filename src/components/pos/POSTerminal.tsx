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
  ChevronDown,
  Wrench,
  FileText,
  Clock,
  Receipt,
  Building2,
  Banknote,
  QrCode,
  Printer,
  Mail,
  MessageSquare,
  ShieldCheck,
  Truck,
  User,
  Calculator,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Smartphone,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product, Contact, Transaction } from '../../types';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { HeldOrdersModal } from './HeldOrdersModal';
import { QuickAddCustomerModal } from './QuickAddCustomerModal';
import { NebulaPage } from '../../core/ui';

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
    productRevenue,
    installationRevenue,
    deliveryRevenue,
    installationCharge,
    setInstallationCharge,
    deliveryCharge,
    setDeliveryCharge,
    settings,
    locations,
    currentLocation,
    transactions,
    quotations,
    repairJobSheets
  } = usePOS();

  // Active POS Sub-Tab (Workspace)
  const [activePosTab, setActivePosTab] = useState('retail');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Sales Types & Enterprise Fields (CamneX Bangladesh)
  const [salesType, setSalesType] = useState<'retail' | 'service' | 'installation' | 'maintenance' | 'rental' | 'subscription' | 'internal'>('retail');
  const [drafts, setDrafts] = useState<Array<{ id: string; invoiceNo: string; customer: string; date: string; itemsCount: number; total: number; cart: any[] }>>([
    { id: 'draft-1', invoiceNo: 'DRF-2026-001', customer: 'Rahim Enterprise', date: '2026-09-04 10:30', itemsCount: 3, total: 24500, cart: [] },
    { id: 'draft-2', invoiceNo: 'DRF-2026-002', customer: 'Dhaka Cyber Cafe', date: '2026-09-04 11:15', itemsCount: 1, total: 8500, cart: [] },
  ]);

  const handleSaveDraft = () => {
    if (cart.length === 0) return;
    const newDraft = {
      id: `draft-${Date.now()}`,
      invoiceNo: `DRF-2026-${String(drafts.length + 1).padStart(3, '0')}`,
      customer: selectedCustomer?.name || 'Walk-in Customer',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      itemsCount: cart.reduce((acc, i) => acc + i.quantity, 0),
      total: cartTotal,
      cart: [...cart]
    };
    setDrafts(prev => [newDraft, ...prev]);
    clearCart();
    alert(`Order saved as draft (${newDraft.invoiceNo}) successfully!`);
  };
  const [salesperson, setSalesperson] = useState('Tanvir Ahmed (CamneX Lead)');
  const [selectedBranch, setSelectedBranch] = useState(currentLocation.name);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Main Dhaka Central WH');
  const [priceGroup, setPriceGroup] = useState('Standard Retail BDT');

  // Installation & Service Specific Metadata
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedTeam, setAssignedTeam] = useState('Field Squad Alpha (CCTV & Fiber)');
  const [siteAddress, setSiteAddress] = useState('House 42, Road 11, Banani, Dhaka');
  const [installationNotes, setInstallationNotes] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [holdNote, setHoldNote] = useState('');
  const [showHoldPrompt, setShowHoldPrompt] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'catalog' | 'accessories' | 'packages' | 'analytics'>('catalog');

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
      } else if (e.key === 'Escape') {
        setShowHoldPrompt(false);
        setShowCustomerDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldOrders]);

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

  const handleCheckoutSuccess = (tx: Transaction) => {
    setIsCheckoutOpen(false);
    setCompletedTx(tx);
    setIsReceiptOpen(true);
  };

  // CamneX Upsell Bundle Suggestions
  const upsellAccessories = [
    { name: 'Hikvision 4K PoE Switch (8-Port)', sku: 'SW-POE-8P', price: 4500, category: 'Networking' },
    { name: 'Dahua Cat6 Shielded Cable (305m Box)', sku: 'CBL-CAT6-305', price: 8500, category: 'Cables' },
    { name: 'Modular RJ45 Connectors (Pack of 100)', sku: 'ACC-RJ45-100', price: 650, category: 'Accessories' },
    { name: 'Prolink 1200VA Online UPS Backup', sku: 'UPS-PRL-1200', price: 14500, category: 'Power' },
    { name: 'Professional CCTV Installation Service', sku: 'SRV-CCTV-INST', price: 2500, category: 'Labour' },
    { name: 'Enterprise Network Configuration Package', sku: 'SRV-NET-CFG', price: 5000, category: 'Service' },
  ];

  return (
    <NebulaPage
      icon={ShoppingBag}
      title="POS Terminal"
      description="Enterprise Sales & Service Checkout (CamneX Bangladesh)"
      badge="Register #01 • Online (BD Fiscal Compliant)"
      workspaces={[
        { id: 'retail', label: 'Retail Sales', icon: ShoppingBag, priority: 1 },
        { id: 'service', label: 'Service Sales', icon: Wrench, priority: 2, badge: repairJobSheets.length > 0 ? String(repairJobSheets.length) : undefined },
        { id: 'quotations', label: 'Quotations', icon: FileText, priority: 3, badge: quotations.length > 0 ? String(quotations.length) : undefined },
        { id: 'drafts', label: 'Drafts', icon: FileText, priority: 3.1, badge: drafts.length > 0 ? String(drafts.length) : undefined },
        { id: 'returns', label: 'Returns', icon: RotateCcw, priority: 4 },
        { id: 'layaway', label: 'Layaway', icon: Clock, priority: 5 },
        { id: 'transactions', label: 'Recent Transactions', icon: Receipt, priority: 6, badge: String(transactions.length) },
      ]}
      activeWorkspace={activePosTab}
      onWorkspaceChange={(id) => setActivePosTab(id)}
      actions={
        <div className="flex items-center gap-2">
          {heldOrders.length > 0 && (
            <button
              onClick={() => setIsHeldModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 shadow-xs"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Resume Held ({heldOrders.length})</span>
            </button>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={cart.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
          <button
            onClick={() => {
              if (cart.length > 0) setShowHoldPrompt(true);
            }}
            disabled={cart.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300 disabled:opacity-50"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Suspend</span>
          </button>
          <button
            onClick={() => {
              if (cart.length > 0 && confirm('Are you sure you want to clear the current cart?')) {
                clearCart();
              }
            }}
            disabled={cart.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      }
    >
      {activePosTab === 'drafts' ? (
        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto -m-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Saved Draft Orders</h2>
                <p className="text-sm text-slate-500">Manage, resume, or delete unfinished sales and draft invoices.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                {drafts.length} Active Drafts
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                    <th className="p-4">Draft Reference</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Items</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {drafts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No draft orders saved currently.
                      </td>
                    </tr>
                  ) : (
                    drafts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-indigo-600">{d.invoiceNo}</td>
                        <td className="p-4 font-medium text-slate-800">{d.customer}</td>
                        <td className="p-4 text-slate-500 text-xs">{d.date}</td>
                        <td className="p-4 text-slate-700">{d.itemsCount} items</td>
                        <td className="p-4 text-right font-bold text-slate-900">{settings.currencySymbol}{d.total.toLocaleString()}</td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => {
                              alert(`Resumed draft ${d.invoiceNo}`);
                              setActivePosTab('retail');
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                          >
                            Resume
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete draft ${d.invoiceNo}?`)) {
                                setDrafts(prev => prev.filter(item => item.id !== d.id));
                              }
                            }}
                            className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 -m-6">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: CUSTOMER & ENTERPRISE SALE METADATA                           */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Customer & Account</span>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
            </div>

            {/* Customer Search Selector */}
            <div className="relative">
              <div 
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">{selectedCustomer.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{selectedCustomer.mobile || 'Walk-in Customer'}</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowCustomerDropdown(false);
                          setCustomerSearch('');
                        }}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.mobile} {c.businessName ? `• ${c.businessName}` : ''}</div>
                        </div>
                        {selectedCustomer.id === c.id && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Credit Status & Analytics Card */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Credit Limit:</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}50,000.00</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-bold text-rose-600">{settings.currencySymbol}4,250.00</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Active Warranty Assets:</span>
                <span className="font-bold text-emerald-700">3 Units Registered</span>
              </div>
            </div>
          </div>

          {/* Sales Type & Operational Parameters */}
          <div className="p-4 space-y-3.5 flex-1 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Transaction Mode</label>
              <select
                value={salesType}
                onChange={e => setSalesType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="retail">🛒 Retail Product Sale</option>
                <option value="service">🛠️ Service & Repair Order</option>
                <option value="installation">📡 IT / CCTV Installation Contract</option>
                <option value="maintenance">📋 AMC Maintenance Contract</option>
                <option value="rental">⏱️ Equipment Rental</option>
                <option value="subscription">🔄 Software / Cloud Subscription</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Salesperson</label>
                <select
                  value={salesperson}
                  onChange={e => setSalesperson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Tanvir Ahmed (CamneX Lead)">Tanvir Ahmed</option>
                  <option value="Rahim Khan (Field Engineer)">Rahim Khan</option>
                  <option value="Nusrat Jahan (Counter Cashier)">Nusrat Jahan</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Warehouse</label>
                <select
                  value={selectedWarehouse}
                  onChange={e => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Main Dhaka Central WH">Dhaka Central WH</option>
                  <option value="Gulshan Showroom Stock">Gulshan Showroom</option>
                  <option value="Uttara Depot">Uttara Depot</option>
                </select>
              </div>
            </div>

            {/* Conditional Installation / Service Details */}
            {(salesType === 'installation' || salesType === 'service') && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Field Deployment Metadata</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Site Address</label>
                  <input
                    type="text"
                    value={siteAddress}
                    onChange={e => setSiteAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    placeholder="Enter installation site..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Scheduled Date</label>
                    <input
                      type="date"
                      value={installationDate}
                      onChange={e => setInstallationDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Assigned Squad</label>
                    <input
                      type="text"
                      value={assignedTeam}
                      onChange={e => setAssignedTeam(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Installation Workflow Panel (Progressive Disclosure) */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installationCharge.enabled}
                  onChange={e => setInstallationCharge(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Installation Required</span>
                </span>
              </label>

              {installationCharge.enabled && (
                <div className="space-y-2 pt-1 border-t border-indigo-200/60 pl-1 text-[11px]">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Installation Type</label>
                    <select
                      value={installationCharge.serviceType}
                      onChange={e => {
                        const val = e.target.value;
                        const prices: Record<string, number> = {
                          'Standard Installation': 700,
                          'Advanced Installation': 1200,
                          'Premium Installation': 1500,
                          'Outdoor Installation': 2000,
                          'Commercial Installation': 3500,
                          'AMC Maintenance': 1000,
                          'Network Setup': 2500,
                        };
                        const price = prices[val] || 700;
                        setInstallationCharge(prev => ({ ...prev, serviceType: val, standardPrice: price, overridePrice: undefined }));
                      }}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 font-medium text-slate-800"
                    >
                      <option value="Standard Installation">Standard Installation (700 BDT)</option>
                      <option value="Advanced Installation">Advanced Installation (1,200 BDT)</option>
                      <option value="Premium Installation">Premium Installation (1,500 BDT)</option>
                      <option value="Outdoor Installation">Outdoor Installation (2,000 BDT)</option>
                      <option value="Commercial Installation">Commercial Installation (3,500 BDT)</option>
                      <option value="AMC Maintenance">AMC Maintenance Contract (1,000 BDT)</option>
                      <option value="Network Setup">Network Infrastructure Setup (2,500 BDT)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Price ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        value={installationCharge.overridePrice ?? installationCharge.standardPrice}
                        onChange={e => setInstallationCharge(prev => ({ ...prev, overridePrice: parseFloat(e.target.value) || prev.standardPrice }))}
                        className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-lg font-bold text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Assigned Squad</label>
                      <input
                        type="text"
                        value={installationCharge.assignedTeam || ''}
                        onChange={e => setInstallationCharge(prev => ({ ...prev, assignedTeam: e.target.value }))}
                        className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-lg"
                      />
                    </div>
                  </div>

                  {installationCharge.overridePrice !== undefined && installationCharge.overridePrice !== installationCharge.standardPrice && (
                    <div>
                      <label className="block font-semibold text-rose-700 mb-0.5">Override Reason (Mandatory Audit)</label>
                      <input
                        type="text"
                        placeholder="e.g. Special VIP Discount"
                        value={installationCharge.overrideReason || ''}
                        onChange={e => setInstallationCharge(prev => ({ ...prev, overrideReason: e.target.value }))}
                        className="w-full px-2 py-1 bg-white border border-rose-200 rounded-lg text-rose-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Preferred Date & Site Address</label>
                    <input
                      type="date"
                      value={installationCharge.scheduledDate || ''}
                      onChange={e => setInstallationCharge(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-lg mb-1"
                    />
                    <input
                      type="text"
                      placeholder="Site address..."
                      value={installationCharge.siteAddress || ''}
                      onChange={e => setInstallationCharge(prev => ({ ...prev, siteAddress: e.target.value }))}
                      className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Workflow Panel (Progressive Disclosure) */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deliveryCharge.enabled}
                  onChange={e => setDeliveryCharge(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Required</span>
                </span>
              </label>

              {deliveryCharge.enabled && (
                <div className="space-y-2 pt-1 border-t border-emerald-200/60 pl-1 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Courier Provider</label>
                      <select
                        value={deliveryCharge.provider}
                        onChange={e => setDeliveryCharge(prev => ({ ...prev, provider: e.target.value }))}
                        className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1 font-medium text-slate-800"
                      >
                        <option value="Steadfast">Steadfast Courier</option>
                        <option value="Pathao">Pathao Delivery</option>
                        <option value="RedX">RedX Express</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="Sundarban">Sundarban Courier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Zone / Method</label>
                      <select
                        value={deliveryCharge.method}
                        onChange={e => {
                          const m = e.target.value;
                          const pr = m.includes('Inside') ? 80 : m.includes('Outside') ? 130 : 150;
                          setDeliveryCharge(prev => ({ ...prev, method: m, standardPrice: pr, overridePrice: undefined }));
                        }}
                        className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1 font-medium text-slate-800"
                      >
                        <option value="Inside Dhaka">Inside Dhaka (80 BDT)</option>
                        <option value="Outside Dhaka">Outside Dhaka (130 BDT)</option>
                        <option value="Same Day Express">Same Day Express (150 BDT)</option>
                        <option value="Next Day">Next Day (100 BDT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Charge ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        value={deliveryCharge.overridePrice ?? deliveryCharge.standardPrice}
                        onChange={e => setDeliveryCharge(prev => ({ ...prev, overridePrice: parseFloat(e.target.value) || prev.standardPrice }))}
                        className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-lg font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Expected Date</label>
                      <input
                        type="date"
                        value={deliveryCharge.expectedDate || ''}
                        onChange={e => setDeliveryCharge(prev => ({ ...prev, expectedDate: e.target.value }))}
                        className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-lg"
                      />
                    </div>
                  </div>

                  {deliveryCharge.overridePrice !== undefined && deliveryCharge.overridePrice !== deliveryCharge.standardPrice && (
                    <div>
                      <label className="block font-semibold text-rose-700 mb-0.5">Override Reason (Mandatory Audit)</label>
                      <input
                        type="text"
                        placeholder="e.g. Bulk Shipping Discount"
                        value={deliveryCharge.overrideReason || ''}
                        onChange={e => setDeliveryCharge(prev => ({ ...prev, overrideReason: e.target.value }))}
                        className="w-full px-2 py-1 bg-white border border-rose-200 rounded-lg text-rose-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Shipping Address</label>
                    <input
                      type="text"
                      placeholder="Destination address..."
                      value={deliveryCharge.deliveryAddress || ''}
                      onChange={e => setDeliveryCharge(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Hint Footer */}
            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-700">Quick Shortcuts:</div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                <div className="bg-slate-100 px-1.5 py-0.5 rounded flex justify-between"><span>Scan/Focus:</span><span className="font-bold text-blue-600">F2</span></div>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded flex justify-between"><span>Checkout:</span><span className="font-bold text-emerald-600">F8</span></div>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded flex justify-between"><span>Hold:</span><span className="font-bold text-amber-600">F9</span></div>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded flex justify-between"><span>Customer:</span><span className="font-bold text-indigo-600">Alt+N</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER PANEL: CART & CHECKOUT WORKSPACE                                   */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 border-r border-slate-200">
          {/* Cart Header */}
          <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">Current Sales Cart</h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Mode: <span className="uppercase font-bold text-blue-600">{salesType}</span>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                <ShoppingBag className="w-16 h-16 text-slate-300 mb-3 animate-pulse" />
                <p className="font-bold text-base text-slate-600">Cart is Empty</p>
                <p className="text-xs text-slate-400 max-w-xs text-center mt-1">
                  Scan barcode, search products from the catalog, or pick from CamneX enterprise bundles to start a sale.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Item & SKU</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3 text-right">Unit Price</th>
                      <th className="py-3 px-3 text-right">Disc.</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map(item => (
                      <tr key={item.product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.product.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>SKU: {item.product.sku}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">1-Yr CamneX Warranty</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateCartItemQty(item.product.id, parseInt(e.target.value) || 1)}
                              className="w-10 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-md py-0.5"
                            />
                            <button
                              onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800">
                          {settings.currencySymbol}{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-600 font-semibold">
                          {item.discount > 0 ? `-${settings.currencySymbol}${item.discount}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {settings.currencySymbol}{((item.unitPrice * item.quantity) - item.discount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cart Bottom Summary & Payment Options */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3 shrink-0 shadow-lg">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Product Revenue ({cart.reduce((a, b) => a + b.quantity, 0)} items):</span>
                <span className="font-semibold">{settings.currencySymbol}{productRevenue.toFixed(2)}</span>
              </div>
              {installationCharge.enabled && (
                <div className="flex justify-between text-indigo-700 font-medium">
                  <span>Installation Revenue ({installationCharge.serviceType}):</span>
                  <span>+{settings.currencySymbol}{(installationCharge.overridePrice ?? installationCharge.standardPrice).toFixed(2)}</span>
                </div>
              )}
              {deliveryCharge.enabled && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Delivery Revenue ({deliveryCharge.provider}):</span>
                  <span>+{settings.currencySymbol}{(deliveryCharge.overridePrice ?? deliveryCharge.standardPrice).toFixed(2)}</span>
                </div>
              )}
              {cartDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount:</span>
                  <span>-{settings.currencySymbol}{cartDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>{settings.taxName} ({settings.taxRate}%):</span>
                <span className="font-semibold">{settings.currencySymbol}{cartTaxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                <span className="font-bold text-sm">Grand Total (BDT):</span>
                <span className="text-2xl font-black text-blue-600 tracking-tight">
                  {settings.currencySymbol}{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Save as Draft Button */}
            <div className="pt-1">
              <button
                disabled={cart.length === 0}
                onClick={handleSaveDraft}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
              >
                <FileText className="w-4 h-4" />
                <span>Save as Draft</span>
              </button>
            </div>

            {/* Bangladesh Payment Methods & Quick Checkout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                <span>bKash / Nagad</span>
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>Card / Bank</span>
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 sm:col-span-1 col-span-2"
              >
                <Check className="w-4 h-4" />
                <span>Checkout (F8)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: QUICK CATALOG SEARCH, BUNDLES & CAMNEX RECOMMENDATIONS        */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
          {/* Right Panel Sub-Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1 shrink-0">
            {[
              { id: 'catalog', label: 'Catalog & Scan' },
              { id: 'accessories', label: 'Accessories' },
              { id: 'packages', label: 'Service Bundles' },
              { id: 'analytics', label: 'Register KPI' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id as any)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                  activeRightTab === tab.id ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeRightTab === 'catalog' && (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search SKU, Barcode, Camera Model..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Categories</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          selectedCategory === c.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Select Catalog</span>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredProducts.slice(0, 8).map(product => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product, 1)}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-slate-500">SKU: {product.sku}</div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-600">{settings.currencySymbol}{product.sellingPrice}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Stock: {product.currentStock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'accessories' && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>CamneX Smart Upsell Recommendations</span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1">Automatically matched cables, PoE switches, and surge protection for CCTV & Networking hardware.</p>
                </div>
                <div className="space-y-2">
                  {upsellAccessories.map((acc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-blue-400 transition-all">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                        <div className="text-[10px] text-slate-500">{acc.category} • SKU: {acc.sku}</div>
                        <div className="text-xs font-extrabold text-blue-600 mt-0.5">{settings.currencySymbol}{acc.price}</div>
                      </div>
                      <button
                        onClick={() => {
                          const matchingProd = products.find(p => p.sku === acc.sku || p.name.toLowerCase().includes(acc.name.toLowerCase().split(' ')[0]));
                          if (matchingProd) {
                            addToCart(matchingProd, 1);
                          } else {
                            // Create temporary product object if not in list
                            addToCart({
                              id: `acc-${Date.now()}-${idx}`,
                              name: acc.name,
                              sku: acc.sku,
                              barcode: acc.sku,
                              categoryId: 'cctv-acc',
                              categoryName: acc.category,
                              brandId: 'brand-camnex',
                              brandName: 'CamneX',
                              unit: 'pcs',
                              purchasePrice: acc.price * 0.7,
                              sellingPrice: acc.price,
                              currentStock: 50,
                              alertQuantity: 5,
                              taxRate: 15
                            }, 1);
                          }
                        }}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                        title="Add to Sale"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeRightTab === 'packages' && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="text-xs font-bold text-indigo-900">CamneX Enterprise Bundles</div>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Pre-configured turnkey packages for corporate offices, residential CCTV, and ISP networking.</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-900">4-Camera 4K ColorVu Security Bundle</div>
                        <div className="text-[10px] text-slate-500">Includes NVR, 4x 4K Turret Cams, 1TB WD Purple, Cabling & Installation</div>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600">৳38,500</span>
                    </div>
                    <button
                      onClick={() => {
                        const bundleProd = products[0] || { id: 'b-1', name: '4-Camera 4K Security Bundle', sku: 'BND-4K-CCTV', sellingPrice: 38500, currentStock: 10 };
                        addToCart(bundleProd as any, 1);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bundle to Cart</span>
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Corporate Wi-Fi 6 Mesh Setup (3 APs)</div>
                        <div className="text-[10px] text-slate-500">TP-Link Omada Wi-Fi 6 AX3000 Business System with PoE Injectors</div>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600">৳24,900</span>
                    </div>
                    <button
                      onClick={() => {
                        const bundleProd = products[1] || { id: 'b-2', name: 'Corporate Wi-Fi 6 Mesh Setup', sku: 'BND-WIFI6', sellingPrice: 24900, currentStock: 15 };
                        addToCart(bundleProd as any, 1);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bundle to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'analytics' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="font-bold text-emerald-900">Register #01 Performance Telemetry</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Real-time shift summary and revenue counters for CamneX Dhaka Branch.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Today's Sales</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">{transactions.length + 12} Orders</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Revenue</div>
                    <div className="text-lg font-extrabold text-emerald-600 mt-1">৳1,48,500</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Avg. Order Value</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">৳12,375</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Items Cleared</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">48 Units</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      )}

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
    </NebulaPage>
  );
};
