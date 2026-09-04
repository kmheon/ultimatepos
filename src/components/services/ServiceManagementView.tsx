import React, { useState } from 'react';
import { 
  Wrench, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Calendar, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Printer, 
  UserCheck, 
  Cpu, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  DollarSign, 
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  X,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Building2,
  HardHat,
  Boxes,
  Truck,
  MapPin,
  Shield,
  Radio,
  Tag,
  CheckSquare,
  MessageSquare,
  Smartphone,
  Bell,
  Info,
  FileText
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { RepairJobSheet, ServiceTechnician, ServiceScheduleSlot } from '../../types';
import { ServiceOperationsDashboard } from './dashboard/ServiceOperationsDashboard';
import { ServiceOperationsAnalyticsView } from './analytics/ServiceOperationsAnalyticsView';
import { EnterpriseWorkforceView } from './workforce/EnterpriseWorkforceView';
import { EnterpriseDispatchView } from './dispatch/EnterpriseDispatchView';
import { 
  mapStageToJobStatus, 
  getChecklistForCategory, 
  calculateSLAForPriority, 
  ServiceChecklistItem,
  ENTERPRISE_DISPATCH_TYPES,
  ENTERPRISE_VEHICLES,
  ENTERPRISE_DURATIONS,
  STANDARD_FIELD_TOOLS,
  getDispatchChecklistForCategory,
  calculateEndTimeFromDuration,
  detectTechnicianConflicts,
  getTechnicianWorkload,
  findNearbyOrCombiningVisits,
  autoPopulateDispatchFromWorkOrder,
  recommendTechnicianForWorkOrder,
  recommendVehicleForCategory,
  calculateSLACountdown,
  getDefaultReservedPartsForCategory
} from '../../services/serviceOperations.service';

import { updateBrowserURL } from '../../utils/navigationRouter';

export type ServiceSubTab = 'dashboard' | 'requests' | 'work_orders' | 'technicians' | 'schedule' | 'reports';

interface ServiceManagementViewProps {
  initialSubTab?: string;
}

export const ServiceManagementView: React.FC<ServiceManagementViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const { 
    repairJobSheets, 
    addRepairJobSheet, 
    updateRepairJobSheet, 
    deleteRepairJobSheet,
    updateRepairStatus,
    technicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    scheduleSlots,
    addScheduleSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
    contacts,
    settings,
    products,
    setActiveTab
  } = usePOS();

  const normalizedSubTab = React.useMemo<ServiceSubTab>(() => {
    if (!initialSubTab) return 'dashboard';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['work-orders', 'work_orders', 'orders', 'jobs'].includes(clean)) return 'work_orders';
    if (['requests', 'tickets'].includes(clean)) return 'requests';
    if (['technicians', 'techs', 'team'].includes(clean)) return 'technicians';
    if (['schedule', 'calendar', 'dispatch'].includes(clean)) return 'schedule';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'dashboard';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<ServiceSubTab>(normalizedSubTab);

  React.useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  // Modal States
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<RepairJobSheet | null>(null);
  const [selectedJobForPrint, setSelectedJobForPrint] = useState<RepairJobSheet | null>(null);

  // New Service Request / Work Order Form State (CamneX Bangladesh Enterprise Specification)
  const [newRequestForm, setNewRequestForm] = useState({
    customerId: contacts[0]?.id || 'con-1',
    customerName: contacts[0]?.name || 'CamneX Enterprise Client',
    contactPerson: 'Engr. Rakibul Hasan',
    customerMobile: contacts[0]?.mobile || '+880 1712-345678',
    customerEmail: contacts[0]?.email || 'client@camnex.com.bd',
    customerType: 'Business' as 'Individual' | 'Business' | 'Government' | 'NGO' | 'Corporate',
    branchOrSite: 'Headquarters - Gulshan 2, Dhaka',
    contractType: 'AMC Customer' as 'AMC Customer' | 'Warranty' | 'Chargeable' | 'New Customer',

    serviceType: 'Preventive Maintenance' as 'Installation' | 'Preventive Maintenance' | 'Corrective Maintenance' | 'Emergency Breakdown' | 'Site Survey' | 'Inspection' | 'Warranty Service' | 'System Upgrade' | 'Relocation' | 'Training' | 'Consultation',
    priority: 'normal' as RepairJobSheet['priority'],
    serviceCategory: 'CCTV' as 'CCTV' | 'Networking' | 'Server' | 'WiFi' | 'Access Control' | 'Time Attendance' | 'PABX' | 'Fire Alarm' | 'UPS' | 'Solar' | 'Structured Cabling' | 'IT Infrastructure' | 'General Technical Service',

    siteName: 'CamneX Data Center Site A',
    siteAddress: 'House 45, Road 11, Banani, Dhaka-1213',
    building: 'Tower B',
    floor: '4th Floor',
    roomOrArea: 'Server & Control Room',
    gpsLocation: '23.7937° N, 90.4066° E',

    assetMode: 'existing' as 'existing' | 'new',
    equipmentType: 'IP Camera / Dome',
    deviceBrand: 'Hikvision',
    deviceModel: 'DS-2CD2143G2-I',
    serialNumberOrIMEI: 'CAM-948201948',
    assetTag: 'CNX-AST-8821',
    assetInstallDate: '2025-01-15',
    assetWarrantyStatus: 'Active' as 'Active' | 'Expired' | 'None',
    assetSystemLocation: 'Main Entrance Perimeters',

    problemSummary: 'Intermittent signal drop and night vision blur during rain storm.',
    defectsDescription: 'Dome casing shows moisture condensation; RJ45 coupler needs weatherproof sealing.',
    customerImpact: 'Partial Downtime' as 'No Impact' | 'Minor' | 'Partial Downtime' | 'Complete System Failure',

    technicianAssigned: technicians[0]?.name || 'Tanvir Ahmed',
    assignedTeam: 'Field Service Squad Alpha (Dhaka North)',
    estimatedVisitDate: new Date().toISOString().slice(0, 10),
    estimatedCompletionDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    estimatedDuration: '2.5 Hours',
    technicianNotes: 'Bring spare weatherproof RJ45 junction boxes and desiccant sachets.',

    warrantyStatusDropdown: 'Active Warranty (1 Year)',
    amcCoverageDropdown: 'Full Comprehensive AMC Coverage',
    chargeType: 'AMC' as 'Free' | 'Warranty' | 'AMC' | 'Chargeable',
    laborCost: 1500,
    partsCost: 3500,
    amountPaid: 0,
    quotationRequired: false,
    invoiceRequired: true,

    securityPasswordOrPattern: '',
    accessoriesHandedOver: 'Access key & schematic manual',
    physicalCondition: 'Standard operational wear on housing, seals verified.',
    estimatedCost: 5000,
    finalTotal: 5000,
    status: 'pending' as RepairJobSheet['status'],
    estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    warrantyTerms: '180-Day Guarantee on replaced OEM parts & certified labor.',
  });

  const [requestChecklist, setRequestChecklist] = useState<ServiceChecklistItem[]>(
    getChecklistForCategory('CCTV')
  );

  // New Service Resource (Technician) Form State
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: 'Enterprise Security',
    designation: 'CCTV & Surveillance Engineer',
    specialization: 'Enterprise CCTV, NVR Systems & Perimeter AI Security',
    primarySkills: 'Enterprise CCTV, IP Cameras, NVR RAID, PTZ Optics, Structured Cabling',
    benchNumber: 'Dept: Enterprise Security',
    currentBranch: 'Dhaka Central Hub',
    vehicleAssigned: 'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)',
    employmentType: 'Full-Time Permanent',
    yearsOfExperience: 5,
    status: 'available' as ServiceTechnician['status'],
    activeJobsCount: 0,
    completedJobsCount: 0,
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  // =========================================================================
  // ENTERPRISE FIELD SERVICE DISPATCH STATE (SERV-002 - CAMNEX BANGLADESH)
  // =========================================================================
  const defaultJob = repairJobSheets[0];
  const defaultPopulated = defaultJob ? autoPopulateDispatchFromWorkOrder(defaultJob, contacts) : null;

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>(defaultJob?.id || '');
  const [dispatchType, setDispatchType] = useState<string>(defaultPopulated?.dispatchType || 'Preventive Maintenance');
  const [jobPriority, setJobPriority] = useState<'Low' | 'Normal' | 'High' | 'Critical'>(defaultPopulated?.priority || 'Normal');

  const [customerInfo, setCustomerInfo] = useState({
    customerName: defaultPopulated?.customerName || 'Grameen CyberNet Ltd.',
    siteName: defaultPopulated?.siteName || 'CamneX Data Center Site A',
    siteAddress: defaultPopulated?.siteAddress || 'Gulshan 2, Plot 14, Road 45, Dhaka-1212',
    contactPerson: defaultPopulated?.contactPerson || 'Engr. Tariqul Islam',
    contactNumber: defaultPopulated?.contactNumber || '+880 1711-294821',
    hasAmc: defaultPopulated?.hasAmc ?? true,
    underWarranty: defaultPopulated?.underWarranty ?? true,
  });

  const [assetInfo, setAssetInfo] = useState({
    serviceCategory: defaultPopulated?.serviceCategory || 'CCTV',
    installedAsset: defaultPopulated?.installedAsset || 'Hikvision DS-2CD2143G2-I (Dome Cam)',
    manufacturer: defaultPopulated?.manufacturer || 'Hikvision',
    model: defaultPopulated?.model || 'DS-2CD2143G2-I',
    serialNumber: defaultPopulated?.serialNumber || 'CAM-948201948',
    assetTag: defaultPopulated?.assetTag || 'CNX-AST-8821',
  });

  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('10:00');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('2 Hours');
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>('12:00');
  const [slaDeadline, setSlaDeadline] = useState<string>(defaultPopulated?.slaDeadline || '24 Business Hours Response');

  // Resource Assignment (Recommended Technician, Secondary Technician, Team, Vehicle)
  const initialRecommended = recommendTechnicianForWorkOrder(
    defaultPopulated?.serviceCategory || 'CCTV',
    technicians,
    scheduleSlots,
    visitDate,
    startTime,
    '12:00'
  );

  const [assignedTechnician, setAssignedTechnician] = useState<string>(
    initialRecommended.recommendedTech?.name || technicians[0]?.name || 'Alex Rivera'
  );
  const [secondaryTechnician, setSecondaryTechnician] = useState<string>('');
  const [assignedTechniciansList, setAssignedTechniciansList] = useState<string[]>([
    initialRecommended.recommendedTech?.name || technicians[0]?.name || 'Alex Rivera'
  ]);
  const [assignedTeam, setAssignedTeam] = useState<string>('Enterprise CCTV & Security Squad');
  const [vehicle, setVehicle] = useState<string>(defaultPopulated?.recommendedVehicle || 'Service Van');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [partsReserved, setPartsReserved] = useState<string[]>(defaultPopulated?.reservedParts || []);
  const [isReservingParts, setIsReservingParts] = useState(false);
  const [partsSearch, setPartsSearch] = useState<string>('');
  const [dispatchStatus, setDispatchStatus] = useState<'Pending Dispatch' | 'Dispatched' | 'Confirmed'>('Pending Dispatch');

  const [siteNotes, setSiteNotes] = useState({
    accessInstructions: 'Security gate badge pass required. Report to Reception desk Level 1 with NID card.',
    parkingInfo: 'Basement level B2 loading bay (Slot 12). Service van pass approved.',
    safetyRequirements: 'High-visibility safety vest, steel-toe boots, hard hat required in server room.',
    customerInstructions: defaultPopulated?.requestedService || 'Escort required at customer premises.',
    internalNotes: defaultPopulated?.existingNotes || 'Check firmware & hardware logs on arrival.',
  });

  const [dispatchChecklist, setDispatchChecklist] = useState<ServiceChecklistItem[]>(() =>
    getDispatchChecklistForCategory(defaultPopulated?.serviceCategory || 'CCTV')
  );

  const [automations, setAutomations] = useState({
    notifyCustomerSMS: true,
    notifyCustomerEmail: true,
    notifyTechnician: true,
    generateCalendarEvent: true,
    reserveInventory: true,
    createTimesheet: true,
    enableGpsTracking: true,
  });

  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);

  const handleWorkOrderSelect = (woId: string) => {
    setSelectedWorkOrderId(woId);
    const job = repairJobSheets.find(j => j.id === woId);
    if (job) {
      const autoData = autoPopulateDispatchFromWorkOrder(job, contacts);
      setDispatchType(autoData.dispatchType);
      setJobPriority(autoData.priority);
      setSlaDeadline(autoData.slaDeadline);
      setCustomerInfo({
        customerName: autoData.customerName,
        siteName: autoData.siteName,
        siteAddress: autoData.siteAddress,
        contactPerson: autoData.contactPerson,
        contactNumber: autoData.contactNumber,
        hasAmc: autoData.hasAmc,
        underWarranty: autoData.underWarranty,
      });
      setAssetInfo({
        serviceCategory: autoData.serviceCategory,
        installedAsset: autoData.installedAsset,
        manufacturer: autoData.manufacturer,
        model: autoData.model,
        serialNumber: autoData.serialNumber,
        assetTag: autoData.assetTag,
      });

      // Auto-load reserved inventory from category/work order
      if (autoData.reservedParts && autoData.reservedParts.length > 0) {
        setPartsReserved(autoData.reservedParts);
      }

      // Auto-recommend vehicle
      if (autoData.recommendedVehicle) {
        setVehicle(autoData.recommendedVehicle);
      }

      // Auto-recommend technician
      const rec = recommendTechnicianForWorkOrder(
        autoData.serviceCategory,
        technicians,
        scheduleSlots,
        visitDate,
        startTime,
        calculateEndTimeFromDuration(startTime, estimatedDuration)
      );
      if (rec.recommendedTech) {
        setAssignedTechnician(rec.recommendedTech.name);
        setAssignedTechniciansList([rec.recommendedTech.name]);
      } else if (autoData.technicianAssigned) {
        const matched = technicians.find(t => 
          t.name.toLowerCase().includes(autoData.technicianAssigned.toLowerCase()) || 
          autoData.technicianAssigned.toLowerCase().includes(t.name.toLowerCase())
        );
        if (matched) {
          setAssignedTechnician(matched.name);
          setAssignedTechniciansList([matched.name]);
        }
      }

      // Auto-populate customer & internal notes from work order
      setSiteNotes(prev => ({
        ...prev,
        customerInstructions: autoData.requestedService || prev.customerInstructions,
        internalNotes: autoData.existingNotes || prev.internalNotes,
      }));
    }
  };

  const handleDurationChange = (dur: string) => {
    setEstimatedDuration(dur);
    setEstimatedEndTime(calculateEndTimeFromDuration(startTime, dur));
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEstimatedEndTime(calculateEndTimeFromDuration(newStart, estimatedDuration));
  };

  const handlePriorityChange = (newPri: 'Low' | 'Normal' | 'High' | 'Critical') => {
    setJobPriority(newPri);
    setSlaDeadline(calculateSLAForPriority(newPri));
  };

  const handleToggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleTogglePart = (partName: string) => {
    setPartsReserved(prev =>
      prev.includes(partName) ? prev.filter(p => p !== partName) : [...prev, partName]
    );
  };

  const handleSaveDispatch = (
    action: 'save_draft' | 'schedule_visit' | 'dispatch_technician' | 'schedule_and_notify'
  ) => {
    const selectedJob = repairJobSheets.find(j => j.id === selectedWorkOrderId) || repairJobSheets[0];
    const techObj = technicians.find(t => t.name === assignedTechnician) || technicians[0];

    let finalDispatchStatus: 'Pending Dispatch' | 'Dispatched' | 'Confirmed' = 'Pending Dispatch';
    let slotStatus: ServiceScheduleSlot['status'] = 'scheduled';

    if (action === 'save_draft') {
      finalDispatchStatus = 'Pending Dispatch';
      slotStatus = 'scheduled';
    } else if (action === 'schedule_visit') {
      finalDispatchStatus = 'Pending Dispatch';
      slotStatus = 'scheduled';
    } else if (action === 'dispatch_technician') {
      finalDispatchStatus = 'Dispatched';
      slotStatus = 'in_progress';
      if (selectedJob) {
        updateRepairStatus(selectedJob.id, 'diagnosing');
      }
    } else if (action === 'schedule_and_notify') {
      finalDispatchStatus = 'Confirmed';
      slotStatus = 'scheduled';
    }

    const allAssignedTechs = secondaryTechnician 
      ? [assignedTechnician, secondaryTechnician] 
      : [assignedTechnician];

    addScheduleSlot({
      title: `${dispatchType} - ${assetInfo.serviceCategory}: ${assetInfo.installedAsset}`,
      serviceRequestId: selectedWorkOrderId || 'wo-001',
      workOrderNumber: selectedJob?.jobSheetNumber || 'WO-1001',
      customerName: customerInfo.customerName,
      deviceInfo: `${assetInfo.manufacturer} ${assetInfo.model} (${assetInfo.serialNumber})`,
      technicianId: techObj?.id || 'tech-1',
      technicianName: assignedTechnician,
      date: visitDate,
      startTime: startTime,
      endTime: estimatedEndTime,
      type: 'on_site_visit',
      status: slotStatus,
      notes: siteNotes.internalNotes,
      dispatchType,
      priority: jobPriority,
      siteName: customerInfo.siteName,
      siteAddress: customerInfo.siteAddress,
      contactPerson: customerInfo.contactPerson,
      contactNumber: customerInfo.contactNumber,
      hasAmc: customerInfo.hasAmc,
      underWarranty: customerInfo.underWarranty,
      serviceCategory: assetInfo.serviceCategory,
      installedAsset: assetInfo.installedAsset,
      manufacturer: assetInfo.manufacturer,
      model: assetInfo.model,
      serialNumber: assetInfo.serialNumber,
      assetTag: assetInfo.assetTag,
      duration: estimatedDuration,
      slaDeadline,
      assignedTechnicians: allAssignedTechs,
      assignedTeam,
      vehicle,
      toolsRequired: selectedTools,
      partsReserved,
      dispatchStatus: finalDispatchStatus,
      accessInstructions: siteNotes.accessInstructions,
      parkingInfo: siteNotes.parkingInfo,
      safetyRequirements: siteNotes.safetyRequirements,
      customerInstructions: siteNotes.customerInstructions,
      technicianNotes: siteNotes.internalNotes,
      checklist: dispatchChecklist,
      automations,
    });

    let msg = `Service visit scheduled successfully for ${customerInfo.customerName} on ${visitDate}.`;
    if (action === 'dispatch_technician') {
      msg = `Technician ${assignedTechnician}${secondaryTechnician ? ` & ${secondaryTechnician}` : ''} dispatched via ${vehicle}. GPS Tracking initialized.`;
    } else if (action === 'schedule_and_notify') {
      msg = `Visit confirmed! Customer notified via SMS & Email. Calendar sync & inventory reserved.`;
    }

    setDispatchFeedback(msg);
    setTimeout(() => setDispatchFeedback(null), 5000);
    setIsAddScheduleOpen(false);
  };

  // KPI Quick Counters
  const pendingJobs = repairJobSheets.filter(j => j.status === 'pending').length;

  // Filtered Requests (Inbound Intake / Service Requests)
  const filteredRequests = repairJobSheets.filter(job => {
    const matchesSearch = 
      job.jobSheetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serialNumberOrIMEI.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.defectsDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesTechnician = technicianFilter === 'all' || job.technicianAssigned === technicianFilter;

    // For requests tab, default to pending/inbound intake requests unless status filter is changed
    const isPendingOrIntake = statusFilter !== 'all' ? matchesStatus : (job.status === 'pending' || searchQuery !== '');
    return matchesSearch && isPendingOrIntake && matchesPriority && matchesTechnician;
  });

  // Filtered Work Orders (Active Repair Execution & Job Sheets)
  const filteredWorkOrders = repairJobSheets.filter(job => {
    const matchesSearch = 
      job.jobSheetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serialNumberOrIMEI.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.defectsDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesTechnician = technicianFilter === 'all' || job.technicianAssigned === technicianFilter;

    // For work orders tab, show active execution jobs (diagnosing, awaiting_parts, repaired, delivered)
    const isActiveExecution = statusFilter !== 'all' ? matchesStatus : (job.status !== 'pending' || searchQuery !== '');
    return matchesSearch && isActiveExecution && matchesPriority && matchesTechnician;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTotal = Number(newRequestForm.partsCost) + Number(newRequestForm.laborCost);
    
    addRepairJobSheet({
      customerId: newRequestForm.customerId,
      customerName: newRequestForm.customerName,
      customerMobile: newRequestForm.customerMobile,
      deviceBrand: newRequestForm.deviceBrand,
      deviceModel: newRequestForm.deviceModel,
      serialNumberOrIMEI: newRequestForm.serialNumberOrIMEI || `ASSET-${Date.now().toString().slice(-6)}`,
      securityPasswordOrPattern: newRequestForm.securityPasswordOrPattern,
      accessoriesHandedOver: [newRequestForm.accessoriesHandedOver],
      defectsDescription: newRequestForm.defectsDescription,
      physicalCondition: newRequestForm.physicalCondition,
      technicianAssigned: newRequestForm.technicianAssigned,
      serviceType: newRequestForm.serviceType,
      estimatedCost: finalTotal,
      partsCost: Number(newRequestForm.partsCost),
      laborCost: Number(newRequestForm.laborCost),
      finalTotal,
      amountPaid: Number(newRequestForm.amountPaid),
      status: newRequestForm.status,
      priority: newRequestForm.priority,
      estimatedDeliveryDate: newRequestForm.estimatedDeliveryDate,
      technicianNotes: newRequestForm.technicianNotes,
      warrantyTerms: newRequestForm.warrantyTerms,
      locationId: 'loc-1',
      locationName: 'Primary Operations Hub & Service Depot',
    });

    setIsAddRequestOpen(false);
  };

  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name.trim()) return;

    const nextIdNum = technicians.length + 101;
    const employeeId = newTechForm.employeeId.trim() || `CNX-FE-${String(nextIdNum).padStart(4, '0')}`;
    const skillsArray = newTechForm.primarySkills
      ? newTechForm.primarySkills.split(',').map(s => s.trim()).filter(Boolean)
      : ['CCTV & Perimeter Surveillance', 'Field Deployment', 'Structured Cabling'];

    addTechnician({
      name: newTechForm.name,
      employeeId,
      email: newTechForm.email || `${newTechForm.name.toLowerCase().replace(/\s+/g, '.')}@camnex.com.bd`,
      phone: newTechForm.phone || '+880 1711-000000',
      mobileNumber: newTechForm.phone || '+880 1711-000000',
      specialization: newTechForm.specialization,
      department: newTechForm.department,
      designation: newTechForm.designation,
      role: newTechForm.designation,
      primarySkills: skillsArray,
      currentBranch: newTechForm.currentBranch,
      vehicleAssigned: newTechForm.vehicleAssigned,
      employmentType: newTechForm.employmentType,
      yearsOfExperience: Number(newTechForm.yearsOfExperience) || 5,
      benchNumber: `Dept: ${newTechForm.department}`,
      status: newTechForm.status,
      activeJobsCount: 0,
      completedJobsCount: 0,
      todaysJobsCount: 0,
      weeklyJobsCount: 0,
      openWorkOrdersCount: 0,
      slaSuccessRate: 98.5,
      firstTimeFixRate: 94.0,
      rating: 5.0,
      workloadPercent: 40,
      avatar: newTechForm.avatar,
      currentAssignment: {
        workOrderNumber: 'STANDBY',
        clientName: 'Standby / Fleet Pool',
        siteLocation: newTechForm.currentBranch,
        taskSummary: 'Awaiting dispatch assignment',
      },
      currentGpsStatus: {
        status: 'online',
        lastLocationName: newTechForm.currentBranch,
        lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      amcContractsAssigned: 0,
      projectsAssigned: 0,
      certificationList: ['CamneX Certified Field Specialist', 'Enterprise Health & Safety Level 2'],
      assignedAssets: [
        {
          id: `ast-${Date.now()}-1`,
          assetName: 'Enterprise Field Tool Kit & Digital Multimeter',
          assetType: 'Tool Kit',
          serialNumber: `TL-CNX-${nextIdNum}`,
          issuedDate: new Date().toISOString().split('T')[0],
          condition: 'Excellent',
        }
      ],
      personalInfo: {
        dateOfBirth: '1995-01-01',
        bloodGroup: 'B+',
        nidNumber: `19952692019${nextIdNum}`,
        emergencyContact: {
          name: 'Family Contact',
          relation: 'Emergency Contact',
          phone: '+880 1811-000000',
        },
        presentAddress: `${newTechForm.currentBranch} Area, Bangladesh`,
        permanentAddress: 'Bangladesh',
      },
      employmentInfo: {
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: newTechForm.employmentType,
        payrollGrade: 'Grade E-3 (Field Engineer)',
        reportingManager: 'Engr. Muniruzzaman (Head of Operations)',
        shiftTiming: '08:30 AM – 05:30 PM',
        workStation: newTechForm.currentBranch,
      },
      performanceKpis: {
        totalTicketsCompleted: 0,
        totalTicketsResolved: 0,
        avgResolutionTimeHours: 2.5,
        slaMetPercent: 98.5,
        firstTimeFixPercent: 94.0,
        customerSatisfactionScore: 5.0,
        customerSatisfactionRating: 5.0,
        safetyComplianceScore: 100,
        monthlyRevenueContribution: 0,
        monthlyRevenueContributionBDT: 0,
      },
      attendance: {
        daysPresentMonth: 20,
        daysLateMonth: 0,
        leaveBalanceDays: 14,
        lastCheckIn: '08:30 AM',
        checkInLocation: newTechForm.currentBranch,
      },
    });

    setIsAddTechOpen(false);
    setNewTechForm({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      department: 'Enterprise Security',
      designation: 'CCTV & Surveillance Engineer',
      specialization: 'Enterprise CCTV, NVR Systems & Perimeter AI Security',
      primarySkills: 'Enterprise CCTV, IP Cameras, NVR RAID, PTZ Optics, Structured Cabling',
      benchNumber: 'Dept: Enterprise Security',
      currentBranch: 'Dhaka Central Hub',
      vehicleAssigned: 'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)',
      employmentType: 'Full-Time Permanent',
      yearsOfExperience: 5,
      status: 'available',
      activeJobsCount: 0,
      completedJobsCount: 0,
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveDispatch('schedule_visit');
  };

  const handleAdvanceJobStage = (jobId: string, nextStageKey: string) => {
    const nextStatus = mapStageToJobStatus(nextStageKey);
    updateRepairStatus(jobId, nextStatus);
    const existingJob = repairJobSheets.find(j => j.id === jobId);
    if (existingJob) {
      updateRepairJobSheet(jobId, {
        ...existingJob,
        status: nextStatus,
        stageId: nextStageKey as any,
      });
    }
  };

  const handleApplyFilter = (filterKey?: string) => {
    if (!filterKey) return;
    setActiveSubTab('requests');
    if (filterKey === 'urgent') {
      setPriorityFilter('urgent');
      setStatusFilter('all');
    } else if (filterKey === 'overdue') {
      setStatusFilter('all');
      setPriorityFilter('all');
    } else if (filterKey === 'awaiting_parts') {
      setStatusFilter('awaiting_parts');
    } else if (filterKey === 'waiting_approval') {
      setStatusFilter('pending');
    }
  };

  const getPriorityBadge = (priority: RepairJobSheet['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Normal</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-500">Low</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: RepairJobSheet['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3 h-3" /> New Request</span>;
      case 'diagnosing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Cpu className="w-3 h-3" /> Assessment / In Progress</span>;
      case 'awaiting_parts':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><AlertTriangle className="w-3 h-3" /> Waiting on Parts</span>;
      case 'repaired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Quality Review</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"><Check className="w-3 h-3" /> Closed / Handed Over</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><X className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-sm shadow-blue-200">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Service Operations Management</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Enterprise Operations
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Universal work orders, asset lifecycle tracking, resource dispatch, SLA monitoring & BI telemetry
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddRequestOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            New Service Request
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all"
          >
            Open POS
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* TAB 1: ENTERPRISE SERVICE OPERATIONS DASHBOARD                             */}
        {/* ========================================================================= */}
        {activeSubTab === 'dashboard' && (
          <ServiceOperationsDashboard 
            jobs={repairJobSheets}
            technicians={technicians}
            scheduleSlots={scheduleSlots}
            currencySymbol={settings.currencySymbol}
            onJobClick={(job) => setSelectedJobForDetails(job)}
            onNewServiceRequest={() => setIsAddRequestOpen(true)}
            onNewWorkOrder={() => setIsAddRequestOpen(true)}
            onScheduleVisit={() => setIsAddScheduleOpen(true)}
            onRegisterAsset={() => setIsAddRequestOpen(true)}
            onCreateQuote={() => setActiveTab('quotations')}
            onGenerateInvoice={() => setActiveTab('sales')}
            onViewAllRequests={() => setActiveSubTab('requests')}
            onManageResources={() => setActiveSubTab('technicians')}
            onAdvanceJobStage={handleAdvanceJobStage}
            onApplyFilter={handleApplyFilter}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INBOUND SERVICE REQUESTS & INTAKE QUEUE                            */}
        {/* ========================================================================= */}
        {activeSubTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Inbound Service Requests & Intake Triage</h2>
                <p className="text-xs text-slate-500">Manage incoming customer service inquiries, device drop-off intake, initial triage, and quotation approvals.</p>
              </div>
              <button
                onClick={() => setIsAddRequestOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Service Request
              </button>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests by #, Customer, Device, or Issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Request Statuses</option>
                  <option value="pending">New Pending Requests</option>
                  <option value="diagnosing">Under Assessment</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Request #</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Equipment / Asset</th>
                      <th className="py-3.5 px-4">Reported Issue / Scope</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Intake Status</th>
                      <th className="py-3.5 px-4 text-right">Est. Quote</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No inbound service requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-blue-600">
                            {job.jobSheetNumber}
                            <div className="text-[10px] text-slate-400 font-normal">{job.createdAt}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{job.customerName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {job.customerMobile}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">{job.deviceBrand} {job.deviceModel}</div>
                            <div className="text-[11px] text-slate-500">Serial: {job.serialNumberOrIMEI || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 truncate" title={job.defectsDescription}>
                              {job.defectsDescription}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">{getPriorityBadge(job.priority)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
                              job.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {job.status === 'pending' ? 'New Inquiry' : job.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-slate-900">{settings.currencySymbol}{job.finalTotal.toFixed(2)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedJobForDetails(job)}
                                title="View Details"
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  updateRepairStatus(job.id, 'diagnosing');
                                  setActiveSubTab('work_orders');
                                }}
                                title="Convert to Active Work Order"
                                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700"
                              >
                                Convert to WO
                              </button>
                              <button
                                onClick={() => deleteRepairJobSheet(job.id)}
                                title="Delete"
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2B: ACTIVE WORK ORDERS & REPAIR EXECUTION                             */}
        {/* ========================================================================= */}
        {activeSubTab === 'work_orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Work Orders & Repair Execution</h2>
                <p className="text-xs text-slate-500">Track field service execution, technician dispatch, parts consumption, diagnostics, and quality review checklists.</p>
              </div>
              <button
                onClick={() => setIsAddRequestOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Work Order
              </button>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search work orders by #, Customer, Asset, or Tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Active Work Orders</option>
                  <option value="diagnosing">Assessment / In Progress</option>
                  <option value="awaiting_parts">Waiting on Parts</option>
                  <option value="repaired">Quality Review</option>
                  <option value="delivered">Closed / Handed Over</option>
                </select>

                <select
                  value={technicianFilter}
                  onChange={(e) => setTechnicianFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Assigned Engineers</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Work Order #</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Equipment / Asset</th>
                      <th className="py-3.5 px-4">Assigned Engineer</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Execution Status</th>
                      <th className="py-3.5 px-4 text-right">Total / Paid</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No active work orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredWorkOrders.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-blue-600">
                            {job.jobSheetNumber}
                            <div className="text-[10px] text-slate-400 font-normal">Due: {job.estimatedDeliveryDate}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{job.customerName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {job.customerMobile}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">{job.deviceBrand} {job.deviceModel}</div>
                            <div className="text-[11px] text-slate-500">Asset: {job.serialNumberOrIMEI || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">{job.technicianAssigned.split(',')[0]}</div>
                            <div className="text-[10px] text-slate-400">Field Squad Assigned</div>
                          </td>
                          <td className="py-3.5 px-4">{getPriorityBadge(job.priority)}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={job.status}
                              onChange={(e) => updateRepairStatus(job.id, e.target.value as RepairJobSheet['status'])}
                              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-medium focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="diagnosing">Assessment / In Progress</option>
                              <option value="awaiting_parts">Waiting on Parts</option>
                              <option value="repaired">Quality Review</option>
                              <option value="delivered">Closed / Handed Over</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-slate-900">{settings.currencySymbol}{job.finalTotal.toFixed(2)}</div>
                            <div className="text-[10px] text-emerald-600 font-medium">Paid: {settings.currencySymbol}{job.amountPaid}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedJobForDetails(job)}
                                title="View Details"
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedJobForPrint(job)}
                                title="Print Work Order / Job Sheet"
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteRepairJobSheet(job.id)}
                                title="Delete"
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ENTERPRISE WORKFORCE & FIELD RESOURCE MANAGEMENT (SERV-002)         */}
        {/* ========================================================================= */}
        {activeSubTab === 'technicians' && (
          <EnterpriseWorkforceView
            technicians={technicians}
            onUpdateTechnician={(id, updates) => updateTechnician(id, updates)}
            onDeleteTechnician={(id) => deleteTechnician(id)}
            onAddTechnician={() => setIsAddTechOpen(true)}
            onAssignWorkOrder={(tech) => {
              setAssignedTechnician(tech.name);
              setIsAddScheduleOpen(true);
            }}
            onScheduleVisit={(tech) => {
              setAssignedTechnician(tech.name);
              setIsAddScheduleOpen(true);
            }}
            onViewCalendar={(tech) => {
              setActiveSubTab('schedule');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SCHEDULE & FIELD DISPATCH                                          */}
        {/* ========================================================================= */}
        {activeSubTab === 'schedule' && (
          <div className="space-y-6">
            {dispatchFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{dispatchFeedback}</span>
                </div>
                <button onClick={() => setDispatchFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <EnterpriseDispatchView
              scheduleSlots={scheduleSlots}
              technicians={technicians}
              onAddSchedule={() => setIsAddScheduleOpen(true)}
              onUpdateSlot={updateScheduleSlot}
              onDeleteSlot={deleteScheduleSlot}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SERVICE OPERATIONS ANALYTICS (SERV-005)                           */}
        {/* ========================================================================= */}
        {activeSubTab === 'reports' && (
          <ServiceOperationsAnalyticsView />
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: NEW SERVICE REQUEST / WORK ORDER INTAKE                             */}
      {/* ========================================================================= */}
      {isAddRequestOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  CamneX Bangladesh — Enterprise Service Work Order & Intake Form
                </h3>
                <p className="text-xs text-slate-500">Security, Networking, IT Infrastructure & Field Service Management (SERV-001)</p>
              </div>
              <button onClick={() => setIsAddRequestOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-6 text-xs">
              
              {/* SECTION 1: CUSTOMER INFORMATION */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-blue-600" /> Section 1: Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer / Organization *</label>
                    <input
                      type="text"
                      required
                      value={newRequestForm.customerName}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, customerName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      placeholder="Search or enter client organization"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={newRequestForm.contactPerson}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, contactPerson: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={newRequestForm.customerMobile}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, customerMobile: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={newRequestForm.customerEmail}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, customerEmail: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer Type</label>
                    <select
                      value={newRequestForm.customerType}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, customerType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                      <option value="Government">Government</option>
                      <option value="NGO">NGO</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Branch / Site</label>
                    <input
                      type="text"
                      value={newRequestForm.branchOrSite}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, branchOrSite: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Contract Status</label>
                    <select
                      value={newRequestForm.contractType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNewRequestForm({
                          ...newRequestForm,
                          contractType: val,
                          chargeType: val === 'AMC Customer' ? 'AMC' : val === 'Warranty' ? 'Warranty' : 'Chargeable'
                        });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="AMC Customer">AMC Customer (Auto-mapped to AMC)</option>
                      <option value="Warranty">Warranty (Auto-mapped to Warranty)</option>
                      <option value="Chargeable">Chargeable</option>
                      <option value="New Customer">New Customer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SERVICE INFORMATION */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" /> Section 2: Service Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Service Type *</label>
                    <select
                      value={newRequestForm.serviceType}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, serviceType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Installation">Installation</option>
                      <option value="Preventive Maintenance">Preventive Maintenance</option>
                      <option value="Corrective Maintenance">Corrective Maintenance</option>
                      <option value="Emergency Breakdown">Emergency Breakdown</option>
                      <option value="Site Survey">Site Survey</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Warranty Service">Warranty Service</option>
                      <option value="System Upgrade">System Upgrade</option>
                      <option value="Relocation">Relocation</option>
                      <option value="Training">Training</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Service Category *</label>
                    <select
                      value={newRequestForm.serviceCategory}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        setNewRequestForm({ ...newRequestForm, serviceCategory: cat });
                        setRequestChecklist(getChecklistForCategory(cat));
                      }}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="CCTV">CCTV</option>
                      <option value="Networking">Networking</option>
                      <option value="Server">Server</option>
                      <option value="WiFi">WiFi</option>
                      <option value="Access Control">Access Control</option>
                      <option value="Time Attendance">Time Attendance</option>
                      <option value="PABX">PABX</option>
                      <option value="Fire Alarm">Fire Alarm</option>
                      <option value="UPS">UPS</option>
                      <option value="Solar">Solar</option>
                      <option value="Structured Cabling">Structured Cabling</option>
                      <option value="IT Infrastructure">IT Infrastructure</option>
                      <option value="General Technical Service">General Technical Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Priority *</label>
                    <select
                      value={newRequestForm.priority}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SLA (Auto-Calculated)</label>
                    <input
                      type="text"
                      readOnly
                      value={calculateSLAForPriority(newRequestForm.priority)}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SITE INFORMATION */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-blue-600" /> Section 3: Site Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Site Name</label>
                    <input
                      type="text"
                      value={newRequestForm.siteName}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, siteName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Site Address *</label>
                    <input
                      type="text"
                      required
                      value={newRequestForm.siteAddress}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, siteAddress: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Building</label>
                    <input
                      type="text"
                      value={newRequestForm.building}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, building: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Floor</label>
                    <input
                      type="text"
                      value={newRequestForm.floor}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, floor: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Room / Area</label>
                    <input
                      type="text"
                      value={newRequestForm.roomOrArea}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, roomOrArea: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-slate-700 font-semibold mb-1">GPS Location (optional)</label>
                    <input
                      type="text"
                      value={newRequestForm.gpsLocation}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, gpsLocation: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      placeholder="e.g. 23.7937° N, 90.4066° E"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CUSTOMER ASSET */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Cpu className="w-4 h-4 text-blue-600" /> Section 4: Customer Asset
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Equipment Type</label>
                    <input
                      type="text"
                      value={newRequestForm.equipmentType}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, equipmentType: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={newRequestForm.deviceBrand}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, deviceBrand: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Model</label>
                    <input
                      type="text"
                      value={newRequestForm.deviceModel}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, deviceModel: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={newRequestForm.serialNumberOrIMEI}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, serialNumberOrIMEI: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Asset Tag</label>
                    <input
                      type="text"
                      value={newRequestForm.assetTag}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, assetTag: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Installation Date</label>
                    <input
                      type="date"
                      value={newRequestForm.assetInstallDate}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, assetInstallDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Warranty Status</label>
                    <select
                      value={newRequestForm.assetWarrantyStatus}
                      onChange={(e) => {
                        const wStat = e.target.value as any;
                        setNewRequestForm({
                          ...newRequestForm,
                          assetWarrantyStatus: wStat,
                          chargeType: wStat === 'Active' ? 'Warranty' : newRequestForm.chargeType
                        });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Active">Active (Auto-mapped to Warranty)</option>
                      <option value="Expired">Expired</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">System Location</label>
                    <input
                      type="text"
                      value={newRequestForm.assetSystemLocation}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, assetSystemLocation: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: SERVICE REQUEST */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Section 5: Service Request
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Problem Summary *</label>
                    <input
                      type="text"
                      required
                      value={newRequestForm.problemSummary}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, problemSummary: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Detailed Description</label>
                    <textarea
                      rows={3}
                      value={newRequestForm.defectsDescription}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, defectsDescription: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Customer Impact</label>
                      <select
                        value={newRequestForm.customerImpact}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, customerImpact: e.target.value as any })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="No Impact">No Impact</option>
                        <option value="Minor">Minor</option>
                        <option value="Partial Downtime">Partial Downtime</option>
                        <option value="Complete System Failure">Complete System Failure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Attachments</label>
                      <input type="file" className="w-full p-1.5 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Site Photos</label>
                      <input type="file" multiple className="w-full p-1.5 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: WORK ASSIGNMENT */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Section 6: Work Assignment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assign Technician</label>
                    <select
                      value={newRequestForm.technicianAssigned}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, technicianAssigned: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      {technicians.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.benchNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assign Team</label>
                    <input
                      type="text"
                      value={newRequestForm.assignedTeam}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, assignedTeam: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      value={newRequestForm.estimatedDuration}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, estimatedDuration: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Estimated Visit Date</label>
                    <input
                      type="date"
                      value={newRequestForm.estimatedVisitDate}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, estimatedVisitDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Estimated Completion</label>
                    <input
                      type="date"
                      value={newRequestForm.estimatedCompletionDate}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, estimatedCompletionDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-slate-700 font-semibold mb-1">Internal Notes</label>
                    <input
                      type="text"
                      value={newRequestForm.technicianNotes}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, technicianNotes: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: FINANCIAL */}
              <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-blue-200 pb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" /> Section 7: Financial
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Warranty Status</label>
                    <input
                      type="text"
                      value={newRequestForm.warrantyStatusDropdown}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, warrantyStatusDropdown: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">AMC Coverage</label>
                    <input
                      type="text"
                      value={newRequestForm.amcCoverageDropdown}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, amcCoverageDropdown: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Charge Type</label>
                    <select
                      value={newRequestForm.chargeType}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, chargeType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Free">Free</option>
                      <option value="Warranty">Warranty</option>
                      <option value="AMC">AMC</option>
                      <option value="Chargeable">Chargeable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Estimated Labor ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={newRequestForm.laborCost}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, laborCost: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Estimated Parts ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={newRequestForm.partsCost}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, partsCost: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Advance Received ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={newRequestForm.amountPaid}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, amountPaid: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-6 pt-2 md:col-span-3">
                    <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRequestForm.quotationRequired}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, quotationRequired: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      Quotation Required (Enable Workflow)
                    </label>
                    <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRequestForm.invoiceRequired}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, invoiceRequired: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      Invoice Required (Prepare for invoicing)
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 8: CHECKLIST (DYNAMIC BASED ON SERVICE CATEGORY) */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Section 8: Pre-Service & QC Checklist ({newRequestForm.serviceCategory})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {requestChecklist.map((item, idx) => (
                    <label key={item.id} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          const updated = [...requestChecklist];
                          updated[idx].completed = e.target.checked;
                          setRequestChecklist(updated);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{item.task}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 9: FINAL ACTIONS */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddRequestOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => setNewRequestForm({ ...newRequestForm, status: 'pending' })}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  onClick={() => setNewRequestForm({ ...newRequestForm, status: 'pending' })}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                >
                  Create Service Request
                </button>
                <button
                  type="submit"
                  onClick={() => setNewRequestForm({ ...newRequestForm, status: 'diagnosing' })}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-200"
                >
                  Create Work Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRequestOpen(false);
                    setIsAddScheduleOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Save & Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ENTERPRISE SERVICE RESOURCE (CAMNEX BANGLADESH)                */}
      {/* ========================================================================= */}
      {isAddTechOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add Enterprise Field Engineer</h3>
                  <p className="text-xs text-slate-500">CamneX Bangladesh Workforce Directory & Resource Registry</p>
                </div>
              </div>
              <button onClick={() => setIsAddTechOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Engineer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.name}
                    onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                    placeholder="e.g. Engr. Asaduzzaman"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={newTechForm.employeeId}
                    onChange={(e) => setNewTechForm({ ...newTechForm, employeeId: e.target.value })}
                    placeholder={`e.g. CNX-FE-${String(technicians.length + 101).padStart(4, '0')}`}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                  <select
                    value={newTechForm.department}
                    onChange={(e) => setNewTechForm({ ...newTechForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="Enterprise Security">Enterprise Security</option>
                    <option value="Networking">Networking & Structured Cabling</option>
                    <option value="Fire Safety">Fire Detection & Safety</option>
                    <option value="Access Control">Biometrics & Access Control</option>
                    <option value="Infrastructure">IT Infrastructure & Datacenter</option>
                    <option value="Technical Support">Technical Support & Field Ops</option>
                    <option value="Projects">Turnkey Projects & ELV</option>
                    <option value="AMC Services">AMC Services & SLA Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Enterprise Designation *</label>
                  <select
                    value={newTechForm.designation}
                    onChange={(e) => setNewTechForm({ ...newTechForm, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="CCTV & Surveillance Engineer">CCTV & Surveillance Engineer</option>
                    <option value="Network Infrastructure Engineer">Network Infrastructure Engineer</option>
                    <option value="Fiber Optic Technician">Fiber Optic Technician</option>
                    <option value="Access Control Engineer">Access Control Engineer</option>
                    <option value="Fire Detection Engineer">Fire Detection Engineer</option>
                    <option value="PA & Intercom Specialist">PA & Intercom Specialist</option>
                    <option value="Electrical & Power Engineer">Electrical & Power Engineer</option>
                    <option value="ELV Systems Engineer">ELV Systems Engineer</option>
                    <option value="Security Systems Engineer">Security Systems Engineer</option>
                    <option value="Field Service Engineer">Field Service Engineer</option>
                    <option value="Senior Installation Engineer">Senior Installation Engineer</option>
                    <option value="Project Supervisor">Project Supervisor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Skills & Competencies (comma-separated)</label>
                <input
                  type="text"
                  value={newTechForm.primarySkills}
                  onChange={(e) => setNewTechForm({ ...newTechForm, primarySkills: e.target.value })}
                  placeholder="e.g. Hikvision VMS, PTZ Optics, Splicing, Access Control, Milestone"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Branch</label>
                  <select
                    value={newTechForm.currentBranch}
                    onChange={(e) => setNewTechForm({ ...newTechForm, currentBranch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Dhaka Central Hub">Dhaka Central Hub</option>
                    <option value="Chittagong Port City Hub">Chittagong Port City Hub</option>
                    <option value="Sylhet Regional Service Point">Sylhet Regional Service Point</option>
                    <option value="Khulna Tech Zone">Khulna Tech Zone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employment Type</label>
                  <select
                    value={newTechForm.employmentType}
                    onChange={(e) => setNewTechForm({ ...newTechForm, employmentType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Full-Time Permanent">Full-Time Permanent</option>
                    <option value="Contractual Project Engineer">Contractual Project Engineer</option>
                    <option value="On-Call Enterprise Specialist">On-Call Enterprise Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Availability Status</label>
                  <select
                    value={newTechForm.status}
                    onChange={(e) => setNewTechForm({ ...newTechForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  >
                    <option value="available">Available / Standby</option>
                    <option value="busy">Busy / Working</option>
                    <option value="on_site">On Site / Active</option>
                    <option value="travelling">Travelling / En Route</option>
                    <option value="on_leave">On Approved Leave</option>
                    <option value="offline">Offline / Off-Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vehicle Assigned</label>
                  <input
                    type="text"
                    value={newTechForm.vehicleAssigned}
                    onChange={(e) => setNewTechForm({ ...newTechForm, vehicleAssigned: e.target.value })}
                    placeholder="e.g. Toyota HiAce Service Van"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={newTechForm.yearsOfExperience}
                    onChange={(e) => setNewTechForm({ ...newTechForm, yearsOfExperience: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Contact *</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.phone}
                    onChange={(e) => setNewTechForm({ ...newTechForm, phone: e.target.value })}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newTechForm.email}
                    onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}
                    placeholder="firstname.lastname@camnex.com.bd"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTechOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Save Enterprise Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ENTERPRISE FIELD SERVICE DISPATCH (SERV-002 REVISION - CAMNEX)     */}
      {/* ========================================================================= */}
      {isAddScheduleOpen && (() => {
        const selectedJob = repairJobSheets.find(j => j.id === selectedWorkOrderId) || repairJobSheets[0];
        const autoData = selectedJob ? autoPopulateDispatchFromWorkOrder(selectedJob, contacts) : null;
        const conflict = detectTechnicianConflicts(assignedTechnician, visitDate, startTime, estimatedEndTime, scheduleSlots);
        const workload = getTechnicianWorkload(assignedTechnician, technicians, scheduleSlots, visitDate);
        const nearbyVisits = findNearbyOrCombiningVisits(customerInfo.customerName, visitDate, scheduleSlots);
        const recommendation = recommendTechnicianForWorkOrder(
          assetInfo.serviceCategory,
          technicians,
          scheduleSlots,
          visitDate,
          startTime,
          estimatedEndTime
        );
        const slaCountdown = calculateSLACountdown(jobPriority);

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Schedule Service Visit / Dispatch
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enterprise Field Service Dispatch & Resource Allocation • CamneX Bangladesh</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ===================================================================== */}
              {/* SECTION 1: SELECT WORK ORDER (AUTO-POPULATES ALL EXISTING INFORMATION) */}
              {/* ===================================================================== */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    Section 1: Select Work Order
                  </h4>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" /> Auto-Populated from ERP
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">Work Order *</label>
                  <select
                    value={selectedWorkOrderId}
                    onChange={(e) => handleWorkOrderSelect(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {repairJobSheets.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.jobSheetNumber} - {job.customerName} ({job.deviceBrand} {job.deviceModel} • {job.serviceType || 'Field Service'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Selecting a work order auto-loads customer, site, asset, SLA, and contract terms below as read-only.</p>
                </div>

                {/* READ-ONLY AUTO-LOADED WORK ORDER TELEMETRY */}
                {autoData && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
                    {/* Status Badges Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{autoData.customerName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          autoData.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          autoData.priority === 'High' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {autoData.priority} Priority
                        </span>
                        {autoData.hasAmc && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> AMC Active
                          </span>
                        )}
                        {autoData.underWarranty && (
                          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <Shield className="w-3 h-3 text-indigo-600" /> Warranty Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        SLA Target: {autoData.slaDeadline}
                      </span>
                    </div>

                    {/* Proximity / Combining Visits Alert if applicable */}
                    {nearbyVisits.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Proximity Optimization:</span>
                          <span className="text-[11px] text-amber-800 ml-1">
                            Same client has another visit on {nearbyVisits[0].date} ({nearbyVisits[0].title}). Trips can be combined for field efficiency.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Read-Only 3-Column Telemetry Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer & Contact</span>
                        <p className="font-bold text-slate-900 mt-0.5">{autoData.customerName}</p>
                        <p className="text-slate-600 text-[11px]">{autoData.contactPerson} ({autoData.contactNumber})</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Site & Address</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{autoData.siteName}</p>
                        <p className="text-slate-500 text-[11px] truncate">{autoData.siteAddress}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Installed Asset</span>
                        <p className="font-bold text-slate-900 mt-0.5">{autoData.installedAsset}</p>
                        <p className="text-slate-500 text-[11px] font-mono">S/N: {autoData.serialNumber} • {autoData.assetTag}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Type & Category</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{autoData.serviceType} ({autoData.dispatchType})</p>
                        <p className="text-slate-500 text-[11px] font-medium">{autoData.serviceCategory}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contract & SLA Terms</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{autoData.contract}</p>
                        <p className="text-slate-500 text-[11px]">{autoData.warranty}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Project</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{autoData.assignedProject}</p>
                        <p className="text-slate-500 text-[11px]">Required Skills: {autoData.requiredSkills.slice(0, 2).join(', ')}</p>
                      </div>

                      <div className="md:col-span-3 pt-2 border-t border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Requested Service / Scope & Historical Notes</span>
                        <p className="text-slate-800 font-medium italic">&ldquo;{autoData.requestedService}&rdquo;</p>
                        {autoData.existingNotes && (
                          <p className="text-slate-500 text-[11px]">Historical Notes: {autoData.existingNotes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===================================================================== */}
              {/* SECTION 2: SCHEDULE                                                   */}
              {/* ===================================================================== */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Section 2: Schedule
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Visit Date *</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Estimated Duration *</label>
                    <select
                      value={estimatedDuration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {ENTERPRISE_DURATIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 text-xs">Estimated End Time (Auto)</label>
                    <input
                      type="time"
                      readOnly
                      value={estimatedEndTime}
                      className="w-full p-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* SLA Countdown Display Only */}
                  <div className="col-span-2 md:col-span-4 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>SLA Window: {slaCountdown.targetHours}h Commitment</span>
                      <span className="text-blue-300">•</span>
                      <span className="text-blue-700">{slaCountdown.remainingText}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${slaCountdown.badgeClass}`}>
                      {slaCountdown.statusBadge}
                    </span>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* SECTION 3: ASSIGN RESOURCES                                           */}
              {/* ===================================================================== */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Section 3: Assign Resources
                  </h4>
                  {/* Technician Workload Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Workload:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      workload.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                      workload.status === 'moderate' ? 'bg-blue-100 text-blue-800' :
                      workload.status === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {workload.status.toUpperCase()} ({workload.workloadPercent}%) • {workload.scheduledSlotsToday} visits today
                    </span>
                  </div>
                </div>

                {/* System Recommendation Banner */}
                {recommendation.recommendedTech && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900">
                        ✨ System Recommended: {recommendation.recommendedTech.name} ({recommendation.recommendedTech.specialization})
                      </span>
                      <p className="text-[11px] text-blue-700 mt-0.5">{recommendation.matchReason}</p>
                    </div>
                  </div>
                )}

                {/* Conflict Alert Banner if collision detected */}
                {conflict.hasConflict && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">⚠️ Scheduling Conflict Detected:</span>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        {assignedTechnician} is already booked for &quot;{conflict.conflictingSlot?.title}&quot; from {conflict.conflictingSlot?.startTime} to {conflict.conflictingSlot?.endTime} on {visitDate}.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Primary Technician *</label>
                    <select
                      value={assignedTechnician}
                      onChange={(e) => {
                        setAssignedTechnician(e.target.value);
                        setAssignedTechniciansList([e.target.value]);
                      }}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {technicians.map(t => {
                        const tWorkload = getTechnicianWorkload(t.name, technicians, scheduleSlots, visitDate);
                        return (
                          <option key={t.id} value={t.name}>
                            {t.name} ({t.specialization} • {tWorkload.status.toUpperCase()})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Secondary Technician (Optional)</label>
                    <select
                      value={secondaryTechnician}
                      onChange={(e) => setSecondaryTechnician(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="">None (Solo Dispatch)</option>
                      {technicians
                        .filter(t => t.name !== assignedTechnician)
                        .map(t => (
                          <option key={t.id} value={t.name}>
                            {t.name} ({t.specialization})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Team (Optional)</label>
                    <select
                      value={assignedTeam}
                      onChange={(e) => setAssignedTeam(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Enterprise CCTV & Security Squad">Enterprise CCTV & Security Squad</option>
                      <option value="Enterprise IT Infrastructure & Fiber Squad">Enterprise IT Infrastructure & Fiber Squad</option>
                      <option value="Commercial Access Control & Fire Safety Team">Commercial Access Control & Fire Safety Team</option>
                      <option value="Power Backup, UPS & Solar Unit">Power Backup, UPS & Solar Unit</option>
                      <option value="Rapid Response Emergency Breakdown Crew">Rapid Response Emergency Breakdown Crew</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Vehicle (Optional)</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {ENTERPRISE_VEHICLES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* SECTION 4: MATERIALS (RESERVED PARTS & OPTIONAL INVENTORY RESERVATION)  */}
              {/* ===================================================================== */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    Section 4: Materials
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsReservingParts(!isReservingParts)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Reserve Inventory
                  </button>
                </div>

                {/* Display Already Reserved Inventory */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1.5 text-xs">
                    Reserved Parts ({partsReserved.length} items)
                  </label>
                  {partsReserved.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-xs text-slate-500 font-medium">No additional inventory parts reserved for this service visit.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Reserve Inventory&quot; only if replacement components or materials are required.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                      {partsReserved.map(part => (
                        <span
                          key={part}
                          className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                        >
                          <Boxes className="w-3.5 h-3.5 text-blue-600" />
                          {part}
                          <button
                            type="button"
                            onClick={() => handleTogglePart(part)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                            title="Remove part"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Search & Reserve Inventory Popover */}
                {isReservingParts && (
                  <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-blue-600" />
                        Search & Reserve Warehouse Inventory
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsReservingParts(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                      >
                        Done
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type part name, model, or SKU to reserve..."
                        value={partsSearch}
                        onChange={(e) => setPartsSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pt-1">
                      {products
                        .filter(p => !partsSearch || p.name.toLowerCase().includes(partsSearch.toLowerCase()))
                        .slice(0, 8)
                        .map(p => {
                          const isAlreadyReserved = partsReserved.includes(p.name);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleTogglePart(p.name)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center justify-between border transition-colors ${
                                isAlreadyReserved
                                  ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="truncate pr-2 font-medium">{p.name}</span>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                Stock: {p.currentStock} {isAlreadyReserved ? '✓' : '+'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* ===================================================================== */}
              {/* SECTION 5: NOTES                                                      */}
              {/* ===================================================================== */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Section 5: Notes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Customer Instructions</label>
                    <textarea
                      rows={3}
                      value={siteNotes.customerInstructions}
                      onChange={(e) => setSiteNotes({ ...siteNotes, customerInstructions: e.target.value })}
                      placeholder="Special instructions or access requirements communicated by the customer..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Internal Dispatcher Notes</label>
                    <textarea
                      rows={3}
                      value={siteNotes.internalNotes}
                      onChange={(e) => setSiteNotes({ ...siteNotes, internalNotes: e.target.value })}
                      placeholder="Internal technical instructions, staging notes, firmware versions, or switch IPs for the field engineer..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* FOOTER: CANCEL, SAVE DRAFT, DISPATCH, DISPATCH & NOTIFY CUSTOMER      */}
              {/* ===================================================================== */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveDispatch('save_draft')}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDispatch('dispatch_technician')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDispatch('schedule_and_notify')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Dispatch & Notify Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: PRINT SERVICE JOB SHEET / CARD                                      */}
      {/* ========================================================================= */}
      {selectedJobForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <span className="font-bold text-sm text-slate-900">ENTERPRISE SERVICE JOB SHEET</span>
              <button onClick={() => setSelectedJobForPrint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-bold text-sm text-slate-900">{settings.businessName}</div>
                <div className="text-[10px] text-slate-500">Service Operations Hub • {settings.phone}</div>
                <div className="text-xs font-bold mt-1 text-blue-600">WORK ORDER #{selectedJobForPrint.jobSheetNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Customer:</span>
                  <span className="font-bold">{selectedJobForPrint.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact:</span>
                  <span className="font-bold">{selectedJobForPrint.customerMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer Asset:</span>
                  <span className="font-bold">{selectedJobForPrint.deviceBrand} {selectedJobForPrint.deviceModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Asset Tag/Serial:</span>
                  <span className="font-bold">{selectedJobForPrint.serialNumberOrIMEI || 'N/A'}</span>
                </div>
              </div>

              <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Reported Issue / Scope:</span>
                <span className="text-slate-800">{selectedJobForPrint.defectsDescription}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
                <span>Estimated Total:</span>
                <span>{settings.currencySymbol}{selectedJobForPrint.finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Deposit Received:</span>
                <span>{settings.currencySymbol}{selectedJobForPrint.amountPaid.toFixed(2)}</span>
              </div>

              <div className="text-[9px] text-slate-400 text-center pt-2">
                Enterprise service agreement. Certified warranty applies to replacement components and labor.
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedJobForPrint(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Work Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DETAILS                                                       */}
      {/* ========================================================================= */}
      {selectedJobForDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Work Order #{selectedJobForDetails.jobSheetNumber}
                </h3>
                <span className="text-xs text-slate-500">Created on {selectedJobForDetails.createdAt}</span>
              </div>
              <button onClick={() => setSelectedJobForDetails(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-900">{selectedJobForDetails.customerName}</span>
                  <span className="text-slate-500 block">{selectedJobForDetails.customerMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Asset</span>
                  <span className="font-bold text-slate-900">{selectedJobForDetails.deviceBrand} {selectedJobForDetails.deviceModel}</span>
                  <span className="text-slate-500 block">Asset ID: {selectedJobForDetails.serialNumberOrIMEI}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Issue / Scope Description</span>
                <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">{selectedJobForDetails.defectsDescription}</p>
              </div>

              {selectedJobForDetails.technicianNotes && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Technical Assessment & Diagnostic Notes</span>
                  <p className="text-slate-800 bg-blue-50/50 p-3 rounded-xl border border-blue-100">{selectedJobForDetails.technicianNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Parts & Materials</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{selectedJobForDetails.partsCost}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Certified Labor</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{selectedJobForDetails.laborCost}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Total Value</span>
                  <span className="font-bold text-blue-600 text-sm">{settings.currencySymbol}{selectedJobForDetails.finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setSelectedJobForPrint(selectedJobForDetails);
                  setSelectedJobForDetails(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Work Order
              </button>
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
