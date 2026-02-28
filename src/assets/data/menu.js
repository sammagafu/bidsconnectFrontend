import { useAuthStore } from '@/stores/auth';

// Admin menu items
const ADMIN_MENU_ITEMS = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'solar:home-2-broken',
    label: 'Dashboard',
    badge: { text: '9+', variant: 'success' },
    route: { name: 'dashboards.index' },
  },
  {
    key: 'users',
    label: 'User Management',
    isTitle: true,
  },
  {
    key: 'admin-users',
    icon: 'solar:user-broken',
    label: 'User Management',
    route: { name: 'admin.users' },
  },
  {
    key: 'companies',
    label: 'Companies Management',
    isTitle: true,
  },
  {
    key: 'companies-management',
    icon: 'solar:buildings-bold-duotone',
    label: 'Companies Management',
    route: { name: 'admin.companies-management' },
  },
  {
    key: 'Manage Tenders',
    label: 'Tenders',
    isTitle: true,
  },
  {
    key: 'tender-categories',
    label: 'Manage Categories',
    icon: 'solar:checklist-outline',
    route: { name: 'admin.categories-management' },
  },
  {
    key: 'apps-tender-procurement',
    label: 'Procurement Process',
    icon: 'solar:document-add-bold',
    route: { name: 'admin.procurement-process-management' },
  },
  {
    key: 'tenders',
    icon: 'solar:document-add-bold',
    label: 'Manage Tender',
    route: { name: 'admin.tenders-management' },
  },
  {
    key: 'apps-todo',
    icon: 'solar:list-heart-minimalistic-broken',
    label: 'Todo',
    route: { name: 'apps.todo' },
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    isTitle: true,
  },
  {
    key: 'apps-invoices',
    icon: 'solar:bill-list-broken',
    label: 'Price Lists',
    children: [
      {
        key: 'invoices',
        label: 'Invoices',
        route: { name: 'apps.invoice.list' },
        parentKey: 'apps-invoices',
      },
      {
        key: 'invoices-details',
        label: 'Invoices Details',
        route: { name: 'apps.invoice.details', params: { id: 'RB6985' } },
        parentKey: 'apps-invoices',
      },
    ],
  },
  {
    key: 'marketplace',
    label: 'Marketplaces',
    icon: 'solar:folder-with-files-broken',
    children: [
      {
        key: 'marketplace-categories',
        label: 'Manage Categories',
        route: { name: 'admin.marketplace.categories-management' },
        parentKey: 'marketplace',
      },
      {
        key: 'marketplace-products',
        label: 'Manage Products',
        route: { name: 'admin.marketplace.products-management' },
        parentKey: 'marketplace',
      },
    ],
  },
  {
    key: 'widgets',
    icon: 'solar:gift-broken',
    label: 'Widgets',
    badge: { text: 'Hot', variant: 'danger' },
    route: { name: 'widgets' },
  },
  {
    key: 'components',
    label: 'COMPONENTS',
    isTitle: true,
  },
  // ... (keep all base UI, advanced UI, charts, forms, tables, icons, maps sections unchanged)
];

// Staff menu items
const STAFF_MENU_ITEMS = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'solar:home-2-broken',
    label: 'Dashboard',
    badge: { text: '9+', variant: 'success' },
    route: { name: 'dashboards.index' },
  },
  {
    key: 'staff',
    label: 'STAFF',
    isTitle: true,
  },
  {
    key: 'staff-tasks',
    icon: 'solar:checklist-broken',
    label: 'Tasks',
    route: { name: 'staff.tasks' },
  },
  {
    key: 'apps',
    label: 'APPS',
    isTitle: true,
  },
  {
    key: 'apps-chat',
    icon: 'solar:chat-round-call-broken',
    label: 'Chat',
    route: { name: 'apps.chat' },
  },
  {
    key: 'apps-email',
    icon: 'solar:letter-broken',
    label: 'Email',
    route: { name: 'apps.email' },
  },
  {
    key: 'apps-todo',
    icon: 'solar:list-heart-minimalistic-broken',
    label: 'Todo',
    route: { name: 'apps.todo' },
  },
];

// Normal user menu items
const NORMAL_MENU_ITEMS = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'solar:home-2-broken',
    label: 'Dashboard',
    badge: { text: '9+', variant: 'success' },
    route: { name: 'dashboards.index' },
  },
  {
    key: 'company',
    label: 'My Company',
    isTitle: true,
  },
  {
    key: 'apps-chat',
    icon: 'solar:chat-round-call-broken',
    label: 'Chat',
    route: { name: 'apps.chat' },
  },
  {
    key: 'apps-email',
    icon: 'solar:letter-broken',
    label: 'Email',
    route: { name: 'apps.email' },
  },
  {
    key: 'company-management',
    label: 'Company Management',
    isTitle: true,
  },
  {
    key: 'company-management-group',
    label: 'Manage Company',
    icon: 'solar:folder-with-files-broken',
    children: [
      {
        key: 'company-users',
        label: 'Team Management',
        route: { name: 'user.user-management' },
        parentKey: 'company-management-group',
      },
      {
        key: 'company-documents',
        label: 'Company Documents',
        route: { name: 'user.company-management' },
        parentKey: 'company-management-group',
      },
      {
        key: 'company-details',
        label: 'Company Details',
        route: { name: 'user.company' },
        parentKey: 'company-management-group',
      },
    ],
  },
  {
    key: 'tenders',
    label: 'Tenders',
    isTitle: true,
  },
  {
    key: 'user-tenders-group',
    label: 'Tenders',
    icon: 'solar:folder-with-files-broken',
    children: [
      {
        key: 'current-tenders',
        label: 'Current Advertised',
        route: { name: 'company.tenders-list' },
        parentKey: 'user-tenders-group',
      },
      {
        key: 'awarded-tenders',
        label: 'Awarded',
        route: { name: 'company.bids-awarded-list' },
        parentKey: 'user-tenders-group',
      },
      {
        key: 'unsuccessful-tenders',
        label: 'My Unsuccessful',
        route: { name: 'company.bids-unsucessful-list' },
        parentKey: 'user-tenders-group',
      },
      {
        key: 'my-submissions',
        label: 'My Submissions',
        route: { name: 'company.bids-list' },
        parentKey: 'user-tenders-group',
      },
    ],
  },
  {
    key: 'qualifications',
    label: 'Qualifications Information',
    isTitle: true,
  },
  {
    key: 'qualifications-group',
    label: 'Qualification',
    children: [
      { key: 'profile-financial', label: 'Financial Information', route: { name: 'profile.financial' }, parentKey: 'qualifications-group' },
      { key: 'profile-litigation', label: 'Litigation', route: { name: 'profile.litigation' }, parentKey: 'qualifications-group' },
      { key: 'profile-officelocation', label: 'Office Location', route: { name: 'profile.officelocation' }, parentKey: 'qualifications-group' },
      { key: 'profile-personalinformation', label: 'Personal Information', route: { name: 'profile.personalinformation' }, parentKey: 'qualifications-group' },
      { key: 'profile-source-of-funds', label: 'Source of Funds', route: { name: 'profile.source-of-funds' }, parentKey: 'qualifications-group' },
      { key: 'profile-turnover', label: 'Turnover', route: { name: 'profile.turnover' }, parentKey: 'qualifications-group' },
    ],
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    isTitle: true,
  },
  {
    key: 'apps-marketplace',
    icon: 'solar:cart-large-2-bold',
    label: 'Market Place',
    children: [
      { key: 'marketplace-list', label: 'Market Place', route: { name: 'user.marketplace-list' }, parentKey: 'apps-marketplace' },
      { key: 'add-product', label: 'Add Products or Services', route: { name: 'user.marketplace-list.add-product' }, parentKey: 'apps-marketplace' },
      { key: 'my-invoices', label: 'My invoices', route: { name: 'user.marketplace-list' }, parentKey: 'apps-marketplace' },
      { key: 'requested-quotes', label: 'Requested Quotes', route: { name: 'user.quote-request.list' }, parentKey: 'apps-marketplace' },
    ],
  },
  {
    key: 'automation',
    label: 'Automation',
    isTitle: true,
  },
  {
    key: 'automation-items',
    icon: 'solar:robot-broken',
    label: 'Automation',
    children: [
      { key: 'power-of-attorney', label: 'Power Of Attorney', route: { name: 'automation.power-of-attorney' }, parentKey: 'automation-items' },
      { key: 'tender-securing-declaration', label: 'Tender Securing Declaration', route: { name: 'automation.tender-securing-declaration' }, parentKey: 'automation-items' },
      { key: 'litigation-history', label: 'Litigation History', route: { name: 'automation.litigation-history' }, parentKey: 'automation-items' },
      { key: 'cover-letter', label: 'Cover Letter', route: { name: 'automation.cover-letter' }, parentKey: 'automation-items' },
    ],
  },
];

// Unauthenticated menu
const UNAUTHENTICATED_MENU_ITEMS = [
  {
    key: 'page-authentication',
    label: 'Authentication',
    icon: 'solar:lock-password-unlocked-broken',
    children: [
      { key: 'sign-in', label: 'Sign In', route: { name: 'auth.sign-in' }, parentKey: 'page-authentication' },
      { key: 'signup', label: 'Sign Up', route: { name: 'auth.sign-up' }, parentKey: 'page-authentication' },
      { key: 'reset-pass', label: 'Reset Password', route: { name: 'auth.reset-password' }, parentKey: 'page-authentication' },
      { key: 'lock-screen', label: 'Lock Screen', route: { name: 'auth.lock-screen' }, parentKey: 'page-authentication' },
    ],
  },
];

export const MENU_ITEMS = NORMAL_MENU_ITEMS;

export const getMenuItems = () => {
  const authStore = useAuthStore();

  if (authStore.isSuperAdmin) return ADMIN_MENU_ITEMS;
  if (authStore.isStaffUser) return STAFF_MENU_ITEMS;
  if (authStore.isNormalUser || authStore.isCompanyOwner || authStore.isCompanyAdmin || authStore.isCompanyMember) return NORMAL_MENU_ITEMS;
  return UNAUTHENTICATED_MENU_ITEMS;
};

let activeMenuItem = [];

const getMatchingMenuItems = (data, currentRouteName) => {
  const matchingItems = [];
  const traverse = (item) => {
    if (item.children?.some(child => child.route?.name === currentRouteName)) {
      matchingItems.push(item.key);
      if (item.parentKey) matchingItems.push(item.parentKey);
    }
    item.children?.forEach(traverse);
  };
  data.forEach(traverse);
  return matchingItems;
};

export function menuItemActive(key, currentRouteName) {
  const menuItems = getMenuItems();
  activeMenuItem = getMatchingMenuItems(menuItems, currentRouteName);
  return activeMenuItem.includes(key);
}