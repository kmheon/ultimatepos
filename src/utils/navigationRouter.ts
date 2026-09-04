// Universal Deep Linking and ERP Module Router

export interface ParsedRoute {
  module: string;
  subTab?: string;
}

const MODULE_ALIASES: Record<string, string> = {
  service: 'services',
  services: 'services',
  repairs: 'services',
  sale: 'sales',
  sales: 'sales',
  purchase: 'purchases',
  purchases: 'purchases',
  procurement: 'purchases',
  inventory: 'inventory',
  products: 'inventory',
  crm: 'crm',
  contacts: 'crm',
  customers: 'crm',
  finance: 'finance',
  accounts: 'finance',
  expenses: 'finance',
  hrm: 'hrm',
  hr: 'hrm',
  users: 'users',
  user_management: 'users',
  report: 'reports',
  reports: 'reports',
  setting: 'settings',
  settings: 'settings',
  system: 'system_admin',
  'system-admin': 'system_admin',
  system_admin: 'system_admin',
  admin: 'system_admin',
  marketplace: 'marketplace',
  modules: 'marketplace',
  integrations: 'integrations',
  woocommerce: 'integrations',
  pos: 'pos',
  dashboard: 'dashboard',
};

export const parseCurrentURL = (): ParsedRoute => {
  if (typeof window === 'undefined') {
    return { module: 'dashboard' };
  }

  // Check pathname first, fallback to hash
  let path = window.location.pathname;
  if (!path || path === '/' || path === '') {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      path = hash.substring(1);
    }
  }

  // Remove leading and trailing slashes
  const segments = path.replace(/^\/+|\/+$/g, '').split('/');
  if (segments.length === 0 || !segments[0]) {
    return { module: 'dashboard' };
  }

  const rawModule = segments[0].toLowerCase();
  const rawSubTab = segments[1]?.toLowerCase();

  const mappedModule = MODULE_ALIASES[rawModule] || rawModule;

  return {
    module: mappedModule,
    subTab: rawSubTab,
  };
};

export const updateBrowserURL = (module: string, subTab?: string) => {
  if (typeof window === 'undefined') return;

  const normalizedModule = (module === 'services' || module === 'service' || module === 'repairs') ? 'service' : module;
  const cleanModule = normalizedModule.replace(/_/g, '-');
  const cleanSubTab = subTab ? `/${subTab.replace(/_/g, '-')}` : '';
  const newPath = `/${cleanModule}${cleanSubTab}`;

  try {
    if (window.location.pathname !== newPath && window.location.hash !== `#${newPath}`) {
      window.history.pushState({ module, subTab }, '', newPath);
      window.dispatchEvent(new Event('popstate'));
    }
  } catch {
    // In restricted iframe environments, pushState on cross-origin path may fail, fallback to hash
    try {
      window.location.hash = `#${newPath}`;
    } catch {
      // noop
    }
  }
};
