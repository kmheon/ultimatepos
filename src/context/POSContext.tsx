import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Category, 
  Brand, 
  Contact, 
  CartItem, 
  Transaction, 
  Expense, 
  CashRegister, 
  BusinessSettings, 
  BusinessLocation,
  ActiveTab,
  TransactionItem,
  RepairJobSheet,
  Quotation,
  StockTransfer,
  SaleReturn,
  ServiceTechnician,
  ServiceScheduleSlot,
  UltimatePOSImportSummary,
  InstallationCharge,
  DeliveryCharge,
  RevenueBreakdown,
  AuditLog
} from '../types';
import { 
  initialProducts, 
  initialCategories, 
  initialBrands, 
  initialContacts, 
  initialTransactions, 
  initialExpenses, 
  initialCashRegister, 
  initialSettings, 
  initialLocations,
  initialRepairJobSheets,
  initialQuotations,
  initialTransfers,
  initialSaleReturns,
  initialTechnicians,
  initialScheduleSlots
} from '../data/mockData';

interface HeldOrder {
  id: string;
  timestamp: string;
  customer: Contact;
  cart: CartItem[];
  note?: string;
  total: number;
}

interface POSContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  contacts: Contact[];
  transactions: Transaction[];
  expenses: Expense[];
  cart: CartItem[];
  selectedCustomer: Contact;
  cashRegister: CashRegister;
  settings: BusinessSettings;
  locations: BusinessLocation[];
  currentLocation: BusinessLocation;
  activeTab: ActiveTab;
  heldOrders: HeldOrder[];
  cartSubtotal: number;
  cartTaxAmount: number;
  cartDiscountAmount: number;
  cartTotal: number;
  productRevenue: number;
  installationRevenue: number;
  deliveryRevenue: number;
  serviceRevenue: number;
  installationCharge: InstallationCharge;
  setInstallationCharge: React.Dispatch<React.SetStateAction<InstallationCharge>>;
  deliveryCharge: DeliveryCharge;
  setDeliveryCharge: React.Dispatch<React.SetStateAction<DeliveryCharge>>;
  
  // Service Management & Technicians
  technicians: ServiceTechnician[];
  addTechnician: (tech: Omit<ServiceTechnician, 'id'>) => ServiceTechnician;
  updateTechnician: (id: string, updates: Partial<ServiceTechnician>) => void;
  deleteTechnician: (id: string) => void;

  // Service Scheduling
  scheduleSlots: ServiceScheduleSlot[];
  addScheduleSlot: (slot: Omit<ServiceScheduleSlot, 'id'>) => ServiceScheduleSlot;
  updateScheduleSlot: (id: string, updates: Partial<ServiceScheduleSlot>) => void;
  deleteScheduleSlot: (id: string) => void;

  // UltimatePOS Migration & Import
  importUltimatePOSData: (payload: {
    products?: Partial<Product>[];
    categories?: Partial<Category>[];
    brands?: Partial<Brand>[];
    contacts?: Partial<Contact>[];
    transactions?: Partial<Transaction>[];
    repairJobSheets?: Partial<RepairJobSheet>[];
    expenses?: Partial<Expense>[];
    sourceType?: 'sql_dump' | 'json_backup' | 'csv_bundle';
    mode?: 'merge' | 'overwrite';
  }) => UltimatePOSImportSummary;

  // Repair Job Sheets
  repairJobSheets: RepairJobSheet[];
  addRepairJobSheet: (job: Omit<RepairJobSheet, 'id' | 'jobSheetNumber' | 'createdAt'>) => RepairJobSheet;
  updateRepairJobSheet: (id: string, updates: Partial<RepairJobSheet>) => void;
  deleteRepairJobSheet: (id: string) => void;
  updateRepairStatus: (id: string, status: RepairJobSheet['status'], notes?: string) => void;

  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'quoteNo' | 'date'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToSale: (quotationId: string) => void;

  // Stock Transfers
  stockTransfers: StockTransfer[];
  addStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'refNo' | 'date'>) => StockTransfer;
  updateStockTransferStatus: (id: string, status: StockTransfer['status']) => void;

  // Sales Returns
  saleReturns: SaleReturn[];
  addSaleReturn: (returnData: Omit<SaleReturn, 'id' | 'returnNo' | 'date'>) => SaleReturn;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  addToCart: (product: Product, quantity?: number, selectedSerial?: string) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, unitPrice: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  updateCartItemSerial: (productId: string, serial: string) => void;
  updateCartItemWarranty: (productId: string, warrantyMonths: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedCustomer: (customer: Contact) => void;
  holdCurrentOrder: (note?: string) => void;
  resumeHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;
  processCheckout: (paymentData: {
    method: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
    amountPaid: number;
    notes?: string;
    discountPercent?: number;
  }) => Transaction;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, change: number, reason: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  addContact: (contact: Omit<Contact, 'id'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addPurchase: (purchaseData: {
    supplierId: string;
    items: { product: Product; quantity: number; purchasePrice: number }[];
    paymentStatus: 'paid' | 'due' | 'partial';
    amountPaid: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
    notes?: string;
  }) => void;
  addPurchaseTransaction: (purchaseData: {
    supplierId: string;
    items: { product: Product; quantity: number; purchasePrice: number }[];
    paymentStatus: 'paid' | 'due' | 'partial';
    amountPaid: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
    notes?: string;
  }) => void;
  addExpense: (expense: Omit<Expense, 'id'> | (Omit<Expense, 'id' | 'refNo'> & { refNo?: string })) => void;
  deleteExpense: (id: string) => void;
  deleteTransaction: (id: string) => void;
  recordInvoicePayment: (transactionId: string, amount: number, method: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  setCurrentLocation: (location: BusinessLocation) => void;
  openRegister: (openingCash: number) => void;
  closeRegister: (closingCash: number, note?: string) => void;
  resetToDemoData: () => void;
  resetToDefaultData: () => void;
  clearAllStoreData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or Fallback to pre-seeded mockData
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('upos_products_v2');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('upos_categories_v2');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('upos_brands_v2');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('upos_contacts_v2');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('upos_transactions_v2');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('upos_expenses_v2');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [cashRegister, setCashRegister] = useState<CashRegister>(() => {
    const saved = localStorage.getItem('upos_register_v2');
    return saved ? JSON.parse(saved) : initialCashRegister;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('upos_settings_v2');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [repairJobSheets, setRepairJobSheets] = useState<RepairJobSheet[]>(() => {
    const saved = localStorage.getItem('upos_repairs_v2');
    return saved ? JSON.parse(saved) : initialRepairJobSheets;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('upos_quotations_v2');
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem('upos_transfers_v2');
    return saved ? JSON.parse(saved) : initialTransfers;
  });

  const [saleReturns, setSaleReturns] = useState<SaleReturn[]>(() => {
    const saved = localStorage.getItem('upos_returns_v2');
    return saved ? JSON.parse(saved) : initialSaleReturns;
  });

  const [technicians, setTechnicians] = useState<ServiceTechnician[]>(() => {
    const saved = localStorage.getItem('upos_technicians_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8 && parsed[0]?.employeeId) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return initialTechnicians;
  });

  const [scheduleSlots, setScheduleSlots] = useState<ServiceScheduleSlot[]>(() => {
    const saved = localStorage.getItem('upos_schedule_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8 && parsed[0]?.serviceType) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return initialScheduleSlots;
  });

  const [locations] = useState<BusinessLocation[]>(initialLocations);
  const [currentLocation, setCurrentLocation] = useState<BusinessLocation>(initialLocations[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Contact>(initialContacts[0]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  const [installationCharge, setInstallationCharge] = useState<InstallationCharge>({
    enabled: false,
    serviceType: 'Standard Installation',
    standardPrice: 700,
    assignedTeam: 'Field Squad Alpha',
    scheduledDate: new Date().toISOString().split('T')[0],
    siteAddress: 'House 42, Road 11, Banani, Dhaka',
  });

  const [deliveryCharge, setDeliveryCharge] = useState<DeliveryCharge>({
    enabled: false,
    provider: 'Steadfast',
    method: 'Inside Dhaka',
    standardPrice: 80,
    expectedDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'House 42, Road 11, Banani, Dhaka',
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('upos_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('upos_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('upos_brands_v2', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('upos_contacts_v2', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('upos_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('upos_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('upos_register_v2', JSON.stringify(cashRegister));
  }, [cashRegister]);

  useEffect(() => {
    localStorage.setItem('upos_settings_v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('upos_repairs_v2', JSON.stringify(repairJobSheets));
  }, [repairJobSheets]);

  useEffect(() => {
    localStorage.setItem('upos_quotations_v2', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('upos_transfers_v2', JSON.stringify(stockTransfers));
  }, [stockTransfers]);

  useEffect(() => {
    localStorage.setItem('upos_returns_v2', JSON.stringify(saleReturns));
  }, [saleReturns]);

  useEffect(() => {
    localStorage.setItem('upos_technicians_v2', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('upos_schedule_v2', JSON.stringify(scheduleSlots));
  }, [scheduleSlots]);

  // Cart Calculations & Independent Revenue Streams
  const productRevenue = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice) - item.discount, 0);
  const installationRevenue = installationCharge.enabled ? (installationCharge.overridePrice ?? installationCharge.standardPrice) : 0;
  const deliveryRevenue = deliveryCharge.enabled ? (deliveryCharge.overridePrice ?? deliveryCharge.standardPrice) : 0;
  const serviceRevenue = 0;

  const cartSubtotal = productRevenue;
  const cartDiscountAmount = cart.reduce((sum, item) => sum + item.discount, 0);
  const cartTaxAmount = cart.reduce((sum, item) => {
    const itemSub = (item.quantity * item.unitPrice) - item.discount;
    return sum + (itemSub * (item.taxRate / 100));
  }, 0);
  const cartTotal = Math.max(0, productRevenue - cartDiscountAmount + cartTaxAmount + installationRevenue + deliveryRevenue);

  // Cart Actions
  const addToCart = (product: Product, quantity = 1, selectedSerial?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && (!selectedSerial || item.selectedSerial === selectedSerial));
      if (existing) {
        const newQty = existing.quantity + quantity;
        return prev.map(item =>
          item === existing
            ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice - item.discount }
            : item
        );
      } else {
        const itemSubtotal = quantity * product.sellingPrice;
        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: product.sellingPrice,
            discount: 0,
            taxRate: product.taxRate,
            subtotal: itemSubtotal,
            selectedSerial: selectedSerial || (product.serialNumbers && product.serialNumbers.length > 0 ? product.serialNumbers[0] : undefined),
            warrantyMonths: product.warrantyMonths || 12,
          },
        ];
      }
    });
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const subtotal = quantity * item.unitPrice - item.discount;
          return { ...item, quantity, subtotal };
        }
        return item;
      })
    );
  };

  const updateCartItemPrice = (productId: string, unitPrice: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const subtotal = item.quantity * unitPrice - item.discount;
          return { ...item, unitPrice, subtotal };
        }
        return item;
      })
    );
  };

  const updateCartItemDiscount = (productId: string, discount: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const subtotal = item.quantity * item.unitPrice - discount;
          return { ...item, discount, subtotal };
        }
        return item;
      })
    );
  };

  const updateCartItemSerial = (productId: string, serial: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, selectedSerial: serial };
        }
        return item;
      })
    );
  };

  const updateCartItemWarranty = (productId: string, warrantyMonths: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, warrantyMonths };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const holdCurrentOrder = (note?: string) => {
    if (cart.length === 0) return;
    const newHeld: HeldOrder = {
      id: `hold-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: selectedCustomer,
      cart: [...cart],
      note,
      total: cartTotal,
    };
    setHeldOrders(prev => [newHeld, ...prev]);
    clearCart();
    setSelectedCustomer(contacts[0] || initialContacts[0]);
  };

  const resumeHeldOrder = (orderId: string) => {
    const order = heldOrders.find(o => o.id === orderId);
    if (!order) return;
    setCart(order.cart);
    setSelectedCustomer(order.customer);
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const processCheckout = (paymentData: {
    method: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
    amountPaid: number;
    notes?: string;
    discountPercent?: number;
  }): Transaction => {
    const invoiceNumber = `${settings.invoicePrefix}${String(transactions.length + 101).padStart(4, '0')}`;
    const refNumber = `REC-${Date.now().toString().slice(-6)}`;
    
    let calculatedFinalTotal = cartTotal;
    let extraDiscount = 0;

    if (paymentData.discountPercent && paymentData.discountPercent > 0) {
      extraDiscount = (cartSubtotal * paymentData.discountPercent) / 100;
      calculatedFinalTotal = Math.max(0, cartSubtotal - (cartDiscountAmount + extraDiscount) + cartTaxAmount);
    }

    const isFullyPaid = paymentData.amountPaid >= calculatedFinalTotal;
    const paymentStatus: 'paid' | 'due' | 'partial' = 
      paymentData.amountPaid === 0 ? 'due' : isFullyPaid ? 'paid' : 'partial';

    const changeReturn = paymentData.amountPaid > calculatedFinalTotal ? paymentData.amountPaid - calculatedFinalTotal : 0;

    const transactionItems: TransactionItem[] = cart.map(item => {
      const itemSubtotal = item.quantity * item.unitPrice - item.discount;
      const itemTax = itemSubtotal * (item.taxRate / 100);
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasePrice: item.product.purchasePrice,
        subtotal: itemSubtotal,
        taxAmount: itemTax,
        discount: item.discount,
        selectedSerial: item.selectedSerial,
        warrantyInfo: item.warrantyMonths ? `${item.warrantyMonths} Months Warranty` : item.product.warrantyType,
      };
    });

    const auditLogs: AuditLog[] = [];
    if (installationCharge.enabled && installationCharge.overridePrice !== undefined && installationCharge.overridePrice !== installationCharge.standardPrice) {
      auditLogs.push({
        id: `audit-${Date.now()}-inst`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        user: 'Admin / Current Cashier',
        action: 'Installation Price Override',
        originalValue: installationCharge.standardPrice,
        newValue: installationCharge.overridePrice,
        reason: installationCharge.overrideReason || 'Special Discount / VIP',
      });
    }
    if (deliveryCharge.enabled && deliveryCharge.overridePrice !== undefined && deliveryCharge.overridePrice !== deliveryCharge.standardPrice) {
      auditLogs.push({
        id: `audit-${Date.now()}-del`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        user: 'Admin / Current Cashier',
        action: 'Delivery Price Override',
        originalValue: deliveryCharge.standardPrice,
        newValue: deliveryCharge.overridePrice,
        reason: deliveryCharge.overrideReason || 'Special Discount / VIP',
      });
    }

    const revenueBreakdown: RevenueBreakdown = {
      productRevenue: Math.max(0, productRevenue - cartDiscountAmount),
      installationRevenue,
      deliveryRevenue,
      serviceRevenue,
    };

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNo: invoiceNumber,
      refNo: refNumber,
      type: 'sell',
      contactId: selectedCustomer.id,
      contactName: selectedCustomer.name,
      contactMobile: selectedCustomer.mobile,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      status: 'final',
      paymentStatus,
      paymentMethod: paymentData.method,
      transactionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      totalBeforeTax: productRevenue + installationRevenue + deliveryRevenue,
      taxAmount: cartTaxAmount,
      discountAmount: cartDiscountAmount + extraDiscount,
      finalTotal: calculatedFinalTotal,
      amountPaid: Math.min(paymentData.amountPaid, calculatedFinalTotal),
      changeReturn,
      items: transactionItems,
      revenueBreakdown,
      installation: installationCharge.enabled ? { ...installationCharge } : undefined,
      delivery: deliveryCharge.enabled ? { ...deliveryCharge } : undefined,
      auditLogs: auditLogs.length > 0 ? auditLogs : undefined,
      notes: paymentData.notes,
      staffName: 'Admin / Current Cashier',
    };

    if (installationCharge.enabled) {
      const newJob: RepairJobSheet = {
        id: `rep-${Date.now()}`,
        jobSheetNumber: `JOB-${new Date().getFullYear()}-${String(repairJobSheets.length + 95).padStart(3, '0')}`,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerMobile: selectedCustomer.mobile,
        deviceBrand: cart[0]?.product.brandName || 'CamneX Security / IT',
        deviceModel: cart[0]?.product.name || installationCharge.serviceType,
        serialNumberOrIMEI: cart[0]?.selectedSerial || invoiceNumber,
        accessoriesHandedOver: ['Power Supply', 'Mounting Bracket', 'Cabling Kit'],
        defectsDescription: `Installation & Site Deployment (${installationCharge.serviceType}) for Invoice ${invoiceNumber}. Site: ${installationCharge.siteAddress || 'N/A'}`,
        physicalCondition: 'New Sale Deployment',
        technicianAssigned: installationCharge.assignedTeam || 'Field Squad Alpha',
        serviceType: installationCharge.serviceType,
        assetCategory: 'CCTV & IT Infrastructure',
        estimatedCost: installationRevenue,
        partsCost: 0,
        laborCost: installationRevenue,
        finalTotal: installationRevenue,
        amountPaid: isFullyPaid ? installationRevenue : 0,
        status: 'pending',
        stageId: 'new_requests',
        priority: 'normal',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        estimatedDeliveryDate: installationCharge.scheduledDate || new Date().toISOString().split('T')[0],
        warrantyTerms: '1 Year Installation & Service Warranty',
        locationId: currentLocation.id,
        locationName: currentLocation.name,
      };
      setRepairJobSheets(prev => [newJob, ...prev]);
    }

    // Deduct stock and remove used serial numbers
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const cartItem = cart.find(c => c.product.id === prod.id);
        if (cartItem) {
          const newSerials = prod.serialNumbers && cartItem.selectedSerial
            ? prod.serialNumbers.filter(s => s !== cartItem.selectedSerial)
            : prod.serialNumbers;
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - cartItem.quantity),
            serialNumbers: newSerials,
          };
        }
        return prod;
      })
    );

    // Update Cash Register if cash was paid
    if (paymentData.method === 'cash') {
      const cashReceived = Math.min(paymentData.amountPaid, calculatedFinalTotal);
      setCashRegister(prev => ({
        ...prev,
        totalCashSales: prev.totalCashSales + cashReceived,
        cashInDrawer: prev.cashInDrawer + cashReceived,
      }));
    } else if (paymentData.method === 'card') {
      setCashRegister(prev => ({
        ...prev,
        totalCardSales: prev.totalCardSales + calculatedFinalTotal,
      }));
    } else {
      setCashRegister(prev => ({
        ...prev,
        totalOtherSales: prev.totalOtherSales + calculatedFinalTotal,
      }));
    }

    // Update Customer due balance if unpaid
    if (paymentStatus !== 'paid') {
      const dueAmount = calculatedFinalTotal - paymentData.amountPaid;
      setContacts(prev =>
        prev.map(c =>
          c.id === selectedCustomer.id
            ? { ...c, totalSaleDue: (c.totalSaleDue || 0) + dueAmount }
            : c
        )
      );
    }

    setTransactions(prev => [newTransaction, ...prev]);
    clearCart();
    return newTransaction;
  };

  // Repair Job Sheet Actions
  const addRepairJobSheet = (job: Omit<RepairJobSheet, 'id' | 'jobSheetNumber' | 'createdAt'>): RepairJobSheet => {
    const jobSheetNumber = `JOB-${new Date().getFullYear()}-${String(repairJobSheets.length + 84).padStart(3, '0')}`;
    const newJob: RepairJobSheet = {
      ...job,
      id: `rep-${Date.now()}`,
      jobSheetNumber,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    };
    setRepairJobSheets(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateRepairJobSheet = (id: string, updates: Partial<RepairJobSheet>) => {
    setRepairJobSheets(prev =>
      prev.map(job => (job.id === id ? { ...job, ...updates } : job))
    );
  };

  const deleteRepairJobSheet = (id: string) => {
    setRepairJobSheets(prev => prev.filter(job => job.id !== id));
  };

  const updateRepairStatus = (id: string, status: RepairJobSheet['status'], notes?: string) => {
    setRepairJobSheets(prev =>
      prev.map(job => {
        if (job.id === id) {
          const completedAt = (status === 'repaired' || status === 'delivered') 
            ? new Date().toISOString().replace('T', ' ').slice(0, 16) 
            : job.completedAt;
          return {
            ...job,
            status,
            completedAt,
            technicianNotes: notes ? `${job.technicianNotes || ''}\n[${status.toUpperCase()}]: ${notes}` : job.technicianNotes,
          };
        }
        return job;
      })
    );
  };

  // Technician Actions
  const addTechnician = (tech: Omit<ServiceTechnician, 'id'>): ServiceTechnician => {
    const newTech: ServiceTechnician = {
      ...tech,
      id: `tech-${Date.now()}`,
    };
    setTechnicians(prev => [...prev, newTech]);
    return newTech;
  };

  const updateTechnician = (id: string, updates: Partial<ServiceTechnician>) => {
    setTechnicians(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  // Service Schedule Actions
  const addScheduleSlot = (slot: Omit<ServiceScheduleSlot, 'id'>): ServiceScheduleSlot => {
    const newSlot: ServiceScheduleSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
    };
    setScheduleSlots(prev => [...prev, newSlot]);
    return newSlot;
  };

  const updateScheduleSlot = (id: string, updates: Partial<ServiceScheduleSlot>) => {
    setScheduleSlots(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteScheduleSlot = (id: string) => {
    setScheduleSlots(prev => prev.filter(s => s.id !== id));
  };

  // UltimatePOS Migration & Bulk Import Engine
  const importUltimatePOSData = (payload: {
    products?: Partial<Product>[];
    categories?: Partial<Category>[];
    brands?: Partial<Brand>[];
    contacts?: Partial<Contact>[];
    transactions?: Partial<Transaction>[];
    repairJobSheets?: Partial<RepairJobSheet>[];
    expenses?: Partial<Expense>[];
    sourceType?: 'sql_dump' | 'json_backup' | 'csv_bundle';
    mode?: 'merge' | 'overwrite';
  }): UltimatePOSImportSummary => {
    const mode = payload.mode || 'merge';
    const errors: string[] = [];

    // Handle Categories
    let importedCategoriesCount = 0;
    if (payload.categories && payload.categories.length > 0) {
      const sanitizedCats: Category[] = payload.categories.map((c, idx) => ({
        id: c.id || `cat-imp-${Date.now()}-${idx}`,
        name: c.name || `Category ${idx + 1}`,
        shortCode: c.shortCode || (c.name ? c.name.slice(0, 4).toUpperCase() : 'CAT'),
        description: c.description || 'Imported from UltimatePOS',
        productCount: c.productCount || 0,
      }));
      if (mode === 'overwrite') {
        setCategories(sanitizedCats);
      } else {
        setCategories(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
          const newOnes = sanitizedCats.filter(c => !existingIds.has(c.id) && !existingNames.has(c.name.toLowerCase()));
          return [...prev, ...newOnes];
        });
      }
      importedCategoriesCount = sanitizedCats.length;
    }

    // Handle Brands
    let importedBrandsCount = 0;
    if (payload.brands && payload.brands.length > 0) {
      const sanitizedBrands: Brand[] = payload.brands.map((b, idx) => ({
        id: b.id || `br-imp-${Date.now()}-${idx}`,
        name: b.name || `Brand ${idx + 1}`,
        description: b.description || 'Imported from UltimatePOS',
      }));
      if (mode === 'overwrite') {
        setBrands(sanitizedBrands);
      } else {
        setBrands(prev => {
          const existingIds = new Set(prev.map(b => b.id));
          const existingNames = new Set(prev.map(b => b.name.toLowerCase()));
          const newOnes = sanitizedBrands.filter(b => !existingIds.has(b.id) && !existingNames.has(b.name.toLowerCase()));
          return [...prev, ...newOnes];
        });
      }
      importedBrandsCount = sanitizedBrands.length;
    }

    // Handle Products
    let importedProductsCount = 0;
    if (payload.products && payload.products.length > 0) {
      const sanitizedProducts: Product[] = payload.products.map((p, idx) => ({
        id: p.id || `prod-imp-${Date.now()}-${idx}`,
        name: p.name || `Product ${idx + 1}`,
        sku: p.sku || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
        barcode: p.barcode || p.sku || `BAR-${Date.now().toString().slice(-4)}-${idx}`,
        categoryId: p.categoryId || 'cat-1',
        categoryName: p.categoryName || 'General',
        brandId: p.brandId,
        brandName: p.brandName,
        modelNumber: p.modelNumber,
        specs: p.specs,
        unit: p.unit || 'Pc',
        purchasePrice: Number(p.purchasePrice) || 0,
        sellingPrice: Number(p.sellingPrice) || 0,
        currentStock: Number(p.currentStock) || 0,
        alertQuantity: Number(p.alertQuantity) || 2,
        image: p.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
        taxRate: Number(p.taxRate) || 0,
        description: p.description,
        warrantyMonths: p.warrantyMonths || 12,
        warrantyType: p.warrantyType || 'Store Warranty',
        serialNumbers: p.serialNumbers || [],
        imeiTracking: p.imeiTracking ?? true,
      }));

      if (mode === 'overwrite') {
        setProducts(sanitizedProducts);
      } else {
        setProducts(prev => {
          const existingSkus = new Set(prev.map(p => p.sku.toLowerCase()));
          const newOnes = sanitizedProducts.filter(p => !existingSkus.has(p.sku.toLowerCase()));
          return [...newOnes, ...prev];
        });
      }
      importedProductsCount = sanitizedProducts.length;
    }

    // Handle Contacts (Customers and Suppliers)
    let importedCustomersCount = 0;
    let importedSuppliersCount = 0;
    if (payload.contacts && payload.contacts.length > 0) {
      const sanitizedContacts: Contact[] = payload.contacts.map((c, idx) => {
        const type = c.type || (c.businessName ? 'supplier' : 'customer');
        if (type === 'customer') importedCustomersCount++;
        else importedSuppliersCount++;

        return {
          id: c.id || `contact-imp-${Date.now()}-${idx}`,
          type,
          name: c.name || `Contact ${idx + 1}`,
          businessName: c.businessName,
          email: c.email,
          mobile: c.mobile || 'N/A',
          address: c.address,
          city: c.city,
          state: c.state,
          country: c.country || 'USA',
          taxNumber: c.taxNumber,
          creditLimit: c.creditLimit,
          totalSaleDue: Number(c.totalSaleDue) || 0,
          totalPurchaseDue: Number(c.totalPurchaseDue) || 0,
        };
      });

      if (mode === 'overwrite') {
        setContacts(sanitizedContacts);
      } else {
        setContacts(prev => {
          const existingMobiles = new Set(prev.map(c => c.mobile));
          const newOnes = sanitizedContacts.filter(c => c.mobile === 'N/A' || !existingMobiles.has(c.mobile));
          return [...prev, ...newOnes];
        });
      }
    }

    // Handle Sales & Invoices
    let importedSalesCount = 0;
    if (payload.transactions && payload.transactions.length > 0) {
      const sanitizedTx: Transaction[] = payload.transactions.map((t, idx) => ({
        id: t.id || `tx-imp-${Date.now()}-${idx}`,
        invoiceNo: t.invoiceNo || `INV-IMP-${String(idx + 1).padStart(4, '0')}`,
        type: t.type || 'sale',
        contactId: t.contactId || 'cust-1',
        contactName: t.contactName || 'Walk-In Customer',
        contactMobile: t.contactMobile,
        locationId: t.locationId || currentLocation.id,
        locationName: t.locationName || currentLocation.name,
        status: t.status || 'final',
        paymentStatus: t.paymentStatus || 'paid',
        paymentMethod: t.paymentMethod || 'cash',
        transactionDate: t.transactionDate || new Date().toISOString().replace('T', ' ').slice(0, 16),
        totalBeforeTax: Number(t.totalBeforeTax) || Number(t.finalTotal) || 0,
        taxAmount: Number(t.taxAmount) || 0,
        discountAmount: Number(t.discountAmount) || 0,
        finalTotal: Number(t.finalTotal) || 0,
        amountPaid: Number(t.amountPaid) || Number(t.finalTotal) || 0,
        items: t.items || [],
        notes: t.notes || 'Imported from legacy UltimatePOS database',
        staffName: t.staffName || 'System Import',
      }));

      if (mode === 'overwrite') {
        setTransactions(sanitizedTx);
      } else {
        setTransactions(prev => {
          const existingInvoices = new Set(prev.map(tx => tx.invoiceNo));
          const newOnes = sanitizedTx.filter(tx => !existingInvoices.has(tx.invoiceNo));
          return [...newOnes, ...prev];
        });
      }
      importedSalesCount = sanitizedTx.length;
    }

    // Handle Service Requests / Repair Sheets
    let importedServiceRequestsCount = 0;
    if (payload.repairJobSheets && payload.repairJobSheets.length > 0) {
      const sanitizedJobs: RepairJobSheet[] = payload.repairJobSheets.map((j, idx) => ({
        id: j.id || `rep-imp-${Date.now()}-${idx}`,
        jobSheetNumber: j.jobSheetNumber || `JOB-IMP-${String(idx + 1).padStart(4, '0')}`,
        customerId: j.customerId || 'cust-1',
        customerName: j.customerName || 'Service Client',
        customerMobile: j.customerMobile || 'N/A',
        deviceBrand: j.deviceBrand || 'Generic',
        deviceModel: j.deviceModel || 'Device Model',
        serialNumberOrIMEI: j.serialNumberOrIMEI || 'N/A',
        securityPasswordOrPattern: j.securityPasswordOrPattern,
        accessoriesHandedOver: j.accessoriesHandedOver || ['Main Device'],
        defectsDescription: j.defectsDescription || 'Service required',
        physicalCondition: j.physicalCondition || 'Normal wear',
        technicianAssigned: j.technicianAssigned || 'Alex Rivera, Lead Micro-Soldering',
        estimatedCost: Number(j.estimatedCost) || 0,
        partsCost: Number(j.partsCost) || 0,
        laborCost: Number(j.laborCost) || 0,
        finalTotal: Number(j.finalTotal) || 0,
        amountPaid: Number(j.amountPaid) || 0,
        status: j.status || 'pending',
        priority: j.priority || 'normal',
        createdAt: j.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
        estimatedDeliveryDate: j.estimatedDeliveryDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        completedAt: j.completedAt,
        technicianNotes: j.technicianNotes || 'Imported service record',
        locationId: currentLocation.id,
        locationName: currentLocation.name,
      }));

      if (mode === 'overwrite') {
        setRepairJobSheets(sanitizedJobs);
      } else {
        setRepairJobSheets(prev => {
          const existingJobNos = new Set(prev.map(job => job.jobSheetNumber));
          const newOnes = sanitizedJobs.filter(j => !existingJobNos.has(j.jobSheetNumber));
          return [...newOnes, ...prev];
        });
      }
      importedServiceRequestsCount = sanitizedJobs.length;
    }

    // Handle Expenses
    let importedExpensesCount = 0;
    if (payload.expenses && payload.expenses.length > 0) {
      const sanitizedExp: Expense[] = payload.expenses.map((e, idx) => ({
        id: e.id || `exp-imp-${Date.now()}-${idx}`,
        refNo: e.refNo || `EXP-IMP-${String(idx + 1).padStart(4, '0')}`,
        category: e.category || e.categoryName || 'Store Operations',
        categoryId: e.categoryId || 'cat-general',
        categoryName: e.categoryName || e.category || 'Store Operations',
        amount: Number(e.amount) || 0,
        expenseDate: e.expenseDate || new Date().toISOString().slice(0, 10),
        paymentMethod: e.paymentMethod || 'cash',
        note: e.note || 'Imported Expense',
        locationId: currentLocation.id,
      }));

      if (mode === 'overwrite') {
        setExpenses(sanitizedExp);
      } else {
        setExpenses(prev => [...sanitizedExp, ...prev]);
      }
      importedExpensesCount = sanitizedExp.length;
    }

    return {
      productsCount: importedProductsCount,
      customersCount: importedCustomersCount,
      suppliersCount: importedSuppliersCount,
      salesCount: importedSalesCount,
      serviceRequestsCount: importedServiceRequestsCount,
      accountsCount: importedCategoriesCount + importedBrandsCount,
      expensesCount: importedExpensesCount,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      sourceType: payload.sourceType || 'json_backup',
      status: 'completed',
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  // Quotation Actions
  const addQuotation = (quotation: Omit<Quotation, 'id' | 'quoteNo' | 'date'>): Quotation => {
    const quoteNo = `QUO-${new Date().getFullYear()}-${String(quotations.length + 13).padStart(4, '0')}`;
    const newQuo: Quotation = {
      ...quotation,
      id: `quo-${Date.now()}`,
      quoteNo,
      date: new Date().toISOString().slice(0, 10),
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    };
    setQuotations(prev => [newQuo, ...prev]);
    return newQuo;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const convertQuotationToSale = (quotationId: string) => {
    const quo = quotations.find(q => q.id === quotationId);
    if (!quo) return;

    // Load customer
    const cust = contacts.find(c => c.id === quo.customerId) || {
      id: quo.customerId,
      name: quo.customerName,
      mobile: quo.customerMobile || '',
      type: 'customer' as const,
    };
    setSelectedCustomer(cust);

    // Populate cart
    const newCartItems: CartItem[] = quo.items.map(item => {
      const prod = products.find(p => p.id === item.productId) || {
        id: item.productId,
        name: item.productName,
        sku: item.sku,
        barcode: item.sku,
        categoryId: 'cat-1',
        categoryName: 'General',
        unit: 'Pc',
        purchasePrice: item.unitPrice * 0.8,
        sellingPrice: item.unitPrice,
        currentStock: 10,
        alertQuantity: 2,
        taxRate: item.taxRate,
      };
      return {
        product: prod,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: item.taxRate,
        subtotal: item.subtotal,
      };
    });

    setCart(newCartItems);
    updateQuotation(quotationId, { status: 'converted' });
    setActiveTab('pos');
  };

  // Stock Transfer Actions
  const addStockTransfer = (transfer: Omit<StockTransfer, 'id' | 'refNo' | 'date'>): StockTransfer => {
    const refNo = `TR-${new Date().getFullYear()}-${String(stockTransfers.length + 4).padStart(3, '0')}`;
    const newTransfer: StockTransfer = {
      ...transfer,
      id: `tr-${Date.now()}`,
      refNo,
      date: new Date().toISOString().slice(0, 10),
    };
    setStockTransfers(prev => [newTransfer, ...prev]);

    // If completed immediately, update stock
    if (transfer.status === 'completed') {
      setProducts(prev =>
        prev.map(prod => {
          const item = transfer.items.find(i => i.productId === prod.id);
          if (item) {
            return {
              ...prod,
              currentStock: Math.max(0, prod.currentStock - item.quantity),
            };
          }
          return prod;
        })
      );
    }

    return newTransfer;
  };

  const updateStockTransferStatus = (id: string, status: StockTransfer['status']) => {
    setStockTransfers(prev =>
      prev.map(t => {
        if (t.id === id) {
          if (status === 'completed' && t.status !== 'completed') {
            // Deduct source stock
            setProducts(pList =>
              pList.map(prod => {
                const item = t.items.find(i => i.productId === prod.id);
                if (item) {
                  return { ...prod, currentStock: Math.max(0, prod.currentStock - item.quantity) };
                }
                return prod;
              })
            );
          }
          return { ...t, status };
        }
        return t;
      })
    );
  };

  // Sale Return Actions
  const addSaleReturn = (returnData: Omit<SaleReturn, 'id' | 'returnNo' | 'date'>): SaleReturn => {
    const returnNo = `RET-${new Date().getFullYear()}-${String(saleReturns.length + 2).padStart(3, '0')}`;
    const newReturn: SaleReturn = {
      ...returnData,
      id: `ret-${Date.now()}`,
      returnNo,
      date: new Date().toISOString().slice(0, 10),
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    };

    setSaleReturns(prev => [newReturn, ...prev]);

    // Restock items if flagged
    setProducts(prev =>
      prev.map(prod => {
        const item = returnData.items.find(i => i.productId === prod.id && i.restockStock);
        if (item) {
          return { ...prod, currentStock: prod.currentStock + item.quantity };
        }
        return prod;
      })
    );

    // Adjust cash drawer if refunded in cash
    if (returnData.refundMethod === 'cash') {
      setCashRegister(prev => ({
        ...prev,
        cashInDrawer: Math.max(0, prev.cashInDrawer - returnData.totalRefund),
        totalExpenses: prev.totalExpenses + returnData.totalRefund,
      }));
    }

    return newReturn;
  };

  // Products CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const p: Product = { ...newProd, id };
    setProducts(prev => [p, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (productId: string, change: number, reason: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.currentStock + change);
          return { ...p, currentStock: newStock };
        }
        return p;
      })
    );
  };

  // Categories & Brands
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    setCategories(prev => [...prev, { ...cat, id, productCount: 0 }]);
  };

  const addBrand = (b: Omit<Brand, 'id'>) => {
    const id = `br-${Date.now()}`;
    setBrands(prev => [...prev, { ...b, id }]);
  };

  // Contacts
  const addContact = (c: Omit<Contact, 'id'>): Contact => {
    const newContact: Contact = {
      ...c,
      id: `con-${Date.now()}`,
      totalSaleDue: 0,
      totalPurchaseDue: 0,
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Purchases
  const addPurchase = (data: {
    supplierId: string;
    items: { product: Product; quantity: number; purchasePrice: number }[];
    paymentStatus: 'paid' | 'due' | 'partial';
    amountPaid: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
    notes?: string;
  }) => {
    const supplier = contacts.find(c => c.id === data.supplierId);
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    const finalTotal = subtotal;

    const txItems: TransactionItem[] = data.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.purchasePrice,
      purchasePrice: item.purchasePrice,
      subtotal: item.quantity * item.purchasePrice,
      taxAmount: 0,
      discount: 0,
    }));

    const newTx: Transaction = {
      id: `tx-purch-${Date.now()}`,
      invoiceNo: `PO-${Date.now().toString().slice(-6)}`,
      type: 'purchase',
      contactId: data.supplierId,
      contactName: supplier ? supplier.name : 'Unknown Supplier',
      contactMobile: supplier?.mobile,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      status: 'received',
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      transactionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      totalBeforeTax: subtotal,
      taxAmount: 0,
      discountAmount: 0,
      finalTotal,
      amountPaid: data.amountPaid,
      items: txItems,
      notes: data.notes,
      staffName: 'Admin / Inventory Lead',
    };

    // Increment stocks
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const pItem = data.items.find(i => i.product.id === prod.id);
        if (pItem) {
          return {
            ...prod,
            currentStock: prod.currentStock + pItem.quantity,
            purchasePrice: pItem.purchasePrice,
          };
        }
        return prod;
      })
    );

    // Update supplier due if partial/due
    if (data.paymentStatus !== 'paid' && supplier) {
      const due = finalTotal - data.amountPaid;
      setContacts(prev =>
        prev.map(c =>
          c.id === supplier.id
            ? { ...c, totalPurchaseDue: (c.totalPurchaseDue || 0) + due }
            : c
        )
      );
    }

    setTransactions(prev => [newTx, ...prev]);
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id'> | (Omit<Expense, 'id' | 'refNo'> & { refNo?: string })) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      refNo: (expense as any).refNo || `EXP-${Date.now().toString().slice(-6)}`,
      expenseDate: expense.expenseDate || (expense as any).date || new Date().toISOString().slice(0, 10),
      categoryId: (expense as any).categoryId || 'cat-general',
      categoryName: (expense as any).categoryName || (expense as any).category || 'Store Operations',
    };

    setExpenses(prev => [newExp, ...prev]);

    if (newExp.paymentMethod === 'cash') {
      setCashRegister(prev => ({
        ...prev,
        totalExpenses: prev.totalExpenses + newExp.amount,
        cashInDrawer: Math.max(0, prev.cashInDrawer - newExp.amount),
      }));
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const recordInvoicePayment = (transactionId: string, amount: number, method: string) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === transactionId) {
          const newPaid = tx.amountPaid + amount;
          const newStatus = newPaid >= tx.finalTotal ? 'paid' : 'partial';
          return {
            ...tx,
            amountPaid: newPaid,
            paymentStatus: newStatus,
            paymentMethod: method as any,
          };
        }
        return tx;
      })
    );
  };

  const openRegister = (openingCash: number) => {
    setCashRegister({
      id: `reg-${Date.now()}`,
      userId: 'usr-1',
      userName: 'Current Admin',
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      status: 'open',
      openedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      openingCash,
      totalCashSales: 0,
      totalCardSales: 0,
      totalOtherSales: 0,
      totalExpenses: 0,
      cashInDrawer: openingCash,
    });
  };

  const closeRegister = (closingCash: number, note?: string) => {
    setCashRegister(prev => ({
      ...prev,
      status: 'closed',
      closedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      closingCash,
      note,
    }));
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setProducts(initialProducts);
    setCategories(initialCategories);
    setBrands(initialBrands);
    setContacts(initialContacts);
    setTransactions(initialTransactions);
    setExpenses(initialExpenses);
    setCashRegister(initialCashRegister);
    setSettings(initialSettings);
    setRepairJobSheets(initialRepairJobSheets);
    setQuotations(initialQuotations);
    setStockTransfers(initialTransfers);
    setSaleReturns(initialSaleReturns);
    setTechnicians(initialTechnicians);
    setScheduleSlots(initialScheduleSlots);
    setCart([]);
    setHeldOrders([]);
    setSelectedCustomer(initialContacts[0]);
  };

  const clearAllStoreData = () => {
    localStorage.clear();
    setProducts([]);
    setCategories([]);
    setBrands([]);
    setContacts([initialContacts[0]]); // Keep basic walk-in customer
    setTransactions([]);
    setExpenses([]);
    setRepairJobSheets([]);
    setQuotations([]);
    setStockTransfers([]);
    setSaleReturns([]);
    setTechnicians([]);
    setScheduleSlots([]);
    setCart([]);
    setHeldOrders([]);
  };

  return (
    <POSContext.Provider
      value={{
        products,
        categories,
        brands,
        contacts,
        transactions,
        expenses,
        cart,
        selectedCustomer,
        cashRegister,
        settings,
        locations,
        currentLocation,
        activeTab,
        heldOrders,
        cartSubtotal,
        cartTaxAmount,
        cartDiscountAmount,
        cartTotal,
        productRevenue,
        installationRevenue,
        deliveryRevenue,
        serviceRevenue,
        installationCharge,
        setInstallationCharge,
        deliveryCharge,
        setDeliveryCharge,
        technicians,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        scheduleSlots,
        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,
        importUltimatePOSData,
        repairJobSheets,
        addRepairJobSheet,
        updateRepairJobSheet,
        deleteRepairJobSheet,
        updateRepairStatus,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToSale,
        stockTransfers,
        addStockTransfer,
        updateStockTransferStatus,
        saleReturns,
        addSaleReturn,
        setActiveTab,
        addToCart,
        updateCartItemQty,
        updateCartItemPrice,
        updateCartItemDiscount,
        updateCartItemSerial,
        updateCartItemWarranty,
        removeFromCart,
        clearCart,
        setSelectedCustomer,
        holdCurrentOrder,
        resumeHeldOrder,
        deleteHeldOrder,
        processCheckout,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        addBrand,
        addContact,
        updateContact,
        deleteContact,
        addPurchase,
        addPurchaseTransaction: addPurchase,
        addExpense,
        deleteExpense,
        deleteTransaction,
        recordInvoicePayment,
        updateSettings,
        setCurrentLocation,
        openRegister,
        closeRegister,
        resetToDemoData,
        resetToDefaultData: resetToDemoData,
        clearAllStoreData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
