export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  modelNumber?: string;
  specs?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  alertQuantity: number;
  image?: string;
  taxRate: number;
  description?: string;
  warrantyMonths?: number;
  warrantyType?: string;
  serialNumbers?: string[];
  imeiTracking?: boolean;
}

export interface Category {
  id: string;
  name: string;
  shortCode: string;
  description?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
}

export interface Contact {
  id: string;
  type: 'customer' | 'supplier' | 'both';
  name: string;
  businessName?: string;
  email?: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxNumber?: string;
  creditLimit?: number;
  totalSaleDue?: number;
  totalPurchaseDue?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  selectedSerial?: string;
  warrantyMonths?: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  selectedSerial?: string;
  warrantyInfo?: string;
}

export interface RevenueBreakdown {
  productRevenue: number;
  installationRevenue: number;
  deliveryRevenue: number;
  serviceRevenue: number;
}

export interface InstallationCharge {
  enabled: boolean;
  serviceType: string;
  standardPrice: number;
  overridePrice?: number;
  overrideReason?: string;
  assignedTeam?: string;
  scheduledDate?: string;
  siteAddress?: string;
  notes?: string;
}

export interface DeliveryCharge {
  enabled: boolean;
  provider: string;
  method: string;
  standardPrice: number;
  overridePrice?: number;
  overrideReason?: string;
  deliveryAddress?: string;
  expectedDate?: string;
  trackingCode?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  originalValue: any;
  newValue: any;
  reason: string;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  refNo?: string;
  type: 'sell' | 'purchase' | 'expense' | 'sell_return' | 'stock_adjustment' | 'sale';
  contactId: string;
  contactName: string;
  contactMobile?: string;
  locationId: string;
  locationName: string;
  status: 'final' | 'draft' | 'ordered' | 'received' | 'pending';
  paymentStatus: 'paid' | 'due' | 'partial';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';
  transactionDate: string;
  totalBeforeTax: number;
  taxAmount: number;
  discountAmount: number;
  finalTotal: number;
  amountPaid: number;
  changeReturn?: number;
  items: TransactionItem[];
  revenueBreakdown?: RevenueBreakdown;
  installation?: InstallationCharge;
  delivery?: DeliveryCharge;
  auditLogs?: AuditLog[];
  notes?: string;
  staffName: string;
}

export interface Expense {
  id: string;
  refNo: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  amount: number;
  date?: string;
  expenseDate?: string;
  paymentMethod: string;
  note?: string;
  locationId?: string;
}

export interface CashRegister {
  id: string;
  userId: string;
  userName: string;
  locationId: string;
  locationName: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  totalCashSales: number;
  totalCardSales: number;
  totalOtherSales: number;
  totalExpenses: number;
  cashInDrawer: number;
  closingCash?: number;
  note?: string;
}

export interface RepairJobSheet {
  id: string;
  jobSheetNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  deviceBrand: string; // Customer Asset Brand / Manufacturer
  deviceModel: string; // Customer Asset Model / Equipment Name
  serialNumberOrIMEI: string; // Serial / Asset ID / IMEI / Tag #
  securityPasswordOrPattern?: string; // Access Key / Pin / Unlock code
  accessoriesHandedOver: string[]; // e.g. ["Power Supply", "Manual", "Mounting Bracket"]
  defectsDescription: string; // Issue / Symptoms / Scope of work
  physicalCondition: string; // Asset intake condition / pre-inspection
  technicianAssigned: string; // Assigned Service Resource
  assignedResourceRole?: string;
  serviceType?: string; // e.g. 'HVAC Maintenance', 'Electrical Diagnostic', 'Industrial Machinery', 'IT Infrastructure'
  assetCategory?: string; // e.g. 'HVAC', 'Electronics', 'Facility Equipment', 'Vehicle Fleet'
  estimatedCost: number;
  partsCost: number;
  laborCost: number;
  finalTotal: number;
  amountPaid: number;
  status: 'pending' | 'diagnosing' | 'awaiting_parts' | 'repaired' | 'delivered' | 'cancelled';
  stageId?: 'new_requests' | 'assessment' | 'quotation' | 'assigned' | 'in_progress' | 'waiting' | 'quality_review' | 'completed' | 'invoiced' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  estimatedDeliveryDate: string; // Due date
  completedAt?: string;
  warrantyTerms?: string;
  technicianNotes?: string;
  locationId: string;
  locationName: string;
  companyId?: string;
  branchId?: string;
  slaDueDate?: string;
  slaBreached?: boolean;
}

export interface ServiceWorkflowStage {
  id: string;
  key: string;
  title: string;
  description: string;
  order: number;
  color: string;
  textColor: string;
  dotColor: string;
}

export interface ServiceActivityItem {
  id: string;
  type: 'work_order_assigned' | 'job_started' | 'job_completed' | 'quote_approved' | 'invoice_generated' | 'payment_received' | 'asset_checked_in' | 'customer_comment';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  workOrderNumber?: string;
  customerName?: string;
  amount?: number;
}

export interface ServiceAlertItem {
  id: string;
  type: 'overdue' | 'sla_breach' | 'contract_expiring' | 'waiting_approval' | 'low_stock';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  actionLabel?: string;
  filterKey?: string;
}

export interface ServiceTypeDefinition {
  id: string;
  name: string;
  industry: string;
  standardDurationHours: number;
  baseLaborRate: number;
}

export interface ServiceResource {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'on_leave' | 'dispatched';
  currentJob?: string;
  workloadPercent: number;
  availability: string;
  certifications: string[];
  avatar: string;
  email: string;
  phone: string;
  benchNumber?: string;
  activeJobsCount: number;
  completedJobsCount: number;
  rating: number;
}

export interface QuotationItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  quoteNo: string;
  customerId: string;
  customerName: string;
  customerMobile?: string;
  date: string;
  validUntil: string;
  locationId: string;
  locationName: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  finalTotal: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
  notes?: string;
  termsAndConditions?: string;
}

export interface StockTransferItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface StockTransfer {
  id: string;
  refNo: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  date: string;
  items: StockTransferItem[];
  shippingCharges: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  totalValue: number;
}

export interface SaleReturnItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  reason: string;
  restockStock: boolean;
}

export interface SaleReturn {
  id: string;
  returnNo: string;
  invoiceNo: string;
  transactionId?: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SaleReturnItem[];
  totalRefund: number;
  refundMethod: 'cash' | 'card' | 'store_credit';
  notes?: string;
  locationId: string;
  locationName: string;
}

export interface BusinessLocation {
  id: string;
  name: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  mobile: string;
  email: string;
}

export interface BusinessSettings {
  businessName: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number;
  taxName: string;
  address: string;
  phone: string;
  email: string;
  receiptHeader: string;
  receiptFooter: string;
  invoicePrefix: string;
  storeType?: 'electronics' | 'general' | 'apparel';
  enableSerialTracking?: boolean;
  enableWarrantyPrinting?: boolean;
}

export type SystemSettings = BusinessSettings;

export type TechnicianStatus = 'available' | 'busy' | 'on_site' | 'travelling' | 'on_leave' | 'offline';

export interface TechnicianAssignment {
  workOrderNumber: string;
  clientName: string;
  siteLocation: string;
  taskSummary: string;
  startedAt?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

export interface TechnicianGPS {
  status: 'online' | 'moving' | 'stationary' | 'offline';
  lastLocationName: string;
  lastPingTime: string;
  updatedAt?: string;
  batteryLevel?: number;
  latitude?: number;
  longitude?: number;
}

export interface TechnicianAsset {
  id: string;
  assetName: string;
  assetType: 'Tool' | 'Tool Kit' | 'Tester' | 'Vehicle' | 'PPE' | 'Device' | string;
  serialNumber: string;
  issuedDate: string;
  condition: 'Excellent' | 'Good' | 'Fair';
}

export interface TechnicianTimesheet {
  id: string;
  date: string;
  workOrderNumber: string;
  taskName: string;
  regularHours: number;
  overtimeHours: number;
  status: 'Approved' | 'Pending Review';
}

export interface TechnicianDocument {
  id: string;
  title: string;
  fileType: string;
  fileSize: string;
  uploadedDate: string;
  expiryDate?: string;
  category?: 'Identity' | 'Contract' | 'Certification' | 'Clearance';
}

export interface TechnicianTraining {
  id: string;
  courseName: string;
  institution: string;
  completionDate: string;
  validUntil?: string;
  status: 'Completed' | 'In Progress' | 'Renewal Due';
  credentialId?: string;
}

export interface ServiceTechnician {
  id: string;
  employeeId?: string; // e.g. 'CNX-FE-0101'
  name: string;
  email: string;
  phone: string;
  mobileNumber?: string;
  designation?: string; // Enterprise designation e.g. 'CCTV & Surveillance Engineer'
  specialization: string; // Enterprise service specialization
  primarySkills?: string[];
  department?: string; // Enterprise Department
  role?: string;
  benchNumber?: string; // Resource Station or Legacy Desk
  status: TechnicianStatus;
  currentAssignment?: TechnicianAssignment;
  todayJobs?: number;
  todaysJobsCount?: number;
  weeklyJobs?: number;
  weeklyJobsCount?: number;
  openWorkOrders?: number;
  openWorkOrdersCount?: number;
  slaSuccessRate?: number; // percentage
  firstTimeFixRate?: number; // percentage
  activeJobsCount: number;
  completedJobsCount: number;
  rating: number; // 1-5
  avatar?: string;
  currentBranch?: string;
  vehicleAssigned?: string;
  currentGpsStatus?: TechnicianGPS;
  employmentType?: 'Full-Time Permanent' | 'Contractual Field Specialist' | 'Senior Installation Engineer' | 'Project Supervisor' | string;
  certificationList?: string[];
  yearsOfExperience?: number;
  amcContractsAssigned?: number;
  projectsAssigned?: number;
  workloadPercent?: number;
  isActive?: boolean;

  // Comprehensive Employee Profile Data
  personalInfo?: {
    dateOfBirth?: string;
    bloodGroup?: string;
    nidNumber?: string;
    emergencyContact?: { name: string; relation: string; phone: string };
    presentAddress?: string;
    permanentAddress?: string;
  };
  employmentInfo?: {
    joiningDate?: string;
    reportingManager?: string;
    probationStatus?: string;
    payrollGrade?: string;
    shiftTiming?: string;
    workStation?: string;
    employmentType?: string;
  };
  assignedAssets?: TechnicianAsset[];
  currentJobsList?: Array<{
    id: string;
    jobSheetNumber: string;
    customerName: string;
    siteAddress: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    stage: string;
    serviceType: string;
    slaDeadline: string;
  }>;
  upcomingSchedule?: Array<{
    id: string;
    date: string;
    timeSlot: string;
    clientName: string;
    location: string;
    taskType: string;
    status: 'confirmed' | 'pending' | 'en_route';
  }>;
  performanceKpis?: {
    totalTicketsCompleted: number;
    totalTicketsResolved?: number;
    avgResolutionTimeHours: number;
    slaMetPercent: number;
    firstTimeFixPercent: number;
    customerSatisfactionScore: number;
    customerSatisfactionRating?: number;
    safetyComplianceScore: number;
    monthlyRevenueContribution: number;
    monthlyRevenueContributionBDT?: number;
  };
  attendance?: {
    daysPresentMonth: number;
    daysLateMonth: number;
    leaveBalanceDays: number;
    lastCheckIn: string;
    checkInLocation: string;
  };
  timesheets?: TechnicianTimesheet[];
  documents?: TechnicianDocument[];
  trainingHistory?: TechnicianTraining[];

  // Analytical Metrics
  utilizationPercent?: number;
  travelTimeMinutes?: number;
  jobsPerDay?: number;
  billableHours?: number;
  nonBillableHours?: number;
  revenueGenerated?: number;
}

export type EnterpriseServiceType = 
  | 'Installation'
  | 'Preventive Maintenance'
  | 'AMC Visit'
  | 'Emergency Breakdown'
  | 'Inspection'
  | 'Site Survey'
  | 'Commissioning'
  | 'Network Deployment'
  | 'Customer Training'
  | 'Warranty Visit';

export type DispatchStatusType = 
  | 'Scheduled'
  | 'Confirmed'
  | 'En Route'
  | 'On Site'
  | 'Paused'
  | 'Completed'
  | 'Cancelled'
  | 'Pending Dispatch'
  | 'Dispatched';

export interface ServiceScheduleSlot {
  id: string;
  title: string;
  serviceRequestId: string;
  customerName: string;
  deviceInfo: string;
  technicianId: string;
  technicianName: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: 'in_store_repair' | 'customer_intake' | 'quality_check' | 'on_site_visit' | string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;

  // Enterprise Field Service Dispatch Fields (SERV-002 & Enterprise Dispatch Center)
  workOrderNumber?: string;
  dispatchType?: string;
  serviceType?: 'Installation' | 'Preventive Maintenance' | 'AMC Visit' | 'Emergency Breakdown' | 'Inspection' | 'Site Survey' | 'Commissioning' | 'Network Deployment' | 'Customer Training' | 'Warranty Visit' | string;
  priority?: 'Low' | 'Normal' | 'High' | 'Critical';
  siteName?: string;
  siteAddress?: string;
  contactPerson?: string;
  contactNumber?: string;
  hasAmc?: boolean;
  underWarranty?: boolean;
  serviceCategory?: string;
  installedAsset?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetTag?: string;
  duration?: string;
  estimatedDuration?: string;
  estimatedDurationHours?: number;
  slaDeadline?: string;
  assignedTechnicians?: string[];
  assignedTeam?: string;
  vehicle?: string;
  branch?: string;
  department?: string;
  contract?: string;
  contractType?: string;
  contractNumber?: string;
  progress?: number;
  progressPercent?: number;
  jobStatus?: string;
  technicianRole?: string;
  technicianAvatar?: string;
  toolsRequired?: string[];
  partsReserved?: string[];
  dispatchStatus?: 'Scheduled' | 'Confirmed' | 'En Route' | 'On Site' | 'Paused' | 'Completed' | 'Cancelled' | 'Pending Dispatch' | 'Dispatched';
  routeCoordinates?: {
    from: string;
    to: string;
    distanceKm: number;
    etaMinutes: number;
    trafficCondition: 'Clear' | 'Moderate' | 'Heavy';
    driverName?: string;
  };
  serviceReport?: {
    reportId: string;
    signedBy: string;
    signedAt: string;
    completionNotes: string;
    customerFeedback: string;
    partsReplaced?: string[];
    testResultsPassed: boolean;
  };
  accessInstructions?: string;
  parkingInfo?: string;
  safetyRequirements?: string;
  customerInstructions?: string;
  technicianNotes?: string;
  checklist?: { id: string; task: string; completed: boolean }[];
  automations?: {
    notifyCustomerSMS: boolean;
    notifyCustomerEmail: boolean;
    notifyTechnician: boolean;
    generateCalendarEvent: boolean;
    reserveInventory: boolean;
    createTimesheet: boolean;
    enableGpsTracking: boolean;
  };
}

export interface UltimatePOSImportSummary {
  productsCount: number;
  customersCount: number;
  suppliersCount: number;
  salesCount: number;
  serviceRequestsCount: number;
  accountsCount: number;
  expensesCount: number;
  timestamp: string;
  sourceType: 'sql_dump' | 'json_backup' | 'csv_bundle';
  status: 'completed' | 'in_progress' | 'failed';
  errors?: string[];
}

export type ActiveTab = 
  | 'pos'
  | 'dashboard'
  | 'services'
  | 'service'
  | 'users'
  | 'products'
  | 'repairs'
  | 'sales'
  | 'quotations'
  | 'returns'
  | 'purchases'
  | 'transfers'
  | 'adjustments'
  | 'expenses'
  | 'accounts'
  | 'reports'
  | 'labels'
  | 'contacts'
  | 'hrm'
  | 'essentials'
  | 'woocommerce'
  | 'backup'
  | 'modules'
  | 'import'
  | 'settings'
  | 'data_management'
  | 'backup_restore'
  | 'data_migration'
  | 'import_export'
  | 'database_maintenance'
  | 'data_cleanup'
  | 'archive_center'
  | 'audit_recovery'
  | 'system_admin'
  | 'database_utilities'
  | 'system_maintenance'
  | 'sys_audit_logs'
  | 'system_health'
  | 'scheduler_jobs'
  | 'inventory'
  | 'procurement'
  | 'crm'
  | 'finance'
  | 'marketplace'
  | 'integrations';

