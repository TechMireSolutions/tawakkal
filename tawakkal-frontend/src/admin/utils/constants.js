import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineWrenchScrewdriver,
  HiOutlineUserCircle,
  HiOutlineBell,
} from 'react-icons/hi2';

export const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/1b3622/ffffff?text=No+Image";

/**
 * Sidebar navigation configuration with role-based access control.
 * The `permission` field determines which roles can see each item.
 */
export const SIDEBAR_NAVIGATION = [
  {
    group: 'Main',
    items: [
      {
        label: 'Dashboard',
        path: '/admin',
        icon: HiOutlineSquares2X2,
        permission: 'dashboard',
      },
    ],
  },
  {
    group: 'Catalog',
    items: [
      {
        label: 'Products',
        path: '/admin/products',
        icon: HiOutlineShoppingBag,
        permission: 'products',
      },
      {
        label: 'Categories',
        path: '/admin/categories',
        icon: HiOutlineTag,
        permission: 'categories',
      },
    ],
  },
  {
    group: 'Sales',
    items: [
      {
        label: 'Orders',
        path: '/admin/orders',
        icon: HiOutlineClipboardDocumentList,
        permission: 'orders',
      },
      {
        label: 'Customers',
        path: '/admin/customers',
        icon: HiOutlineUsers,
        permission: 'customers',
      },
    ],
  },
  {
    group: 'Content',
    items: [
      {
        label: 'CMS',
        path: '/admin/cms',
        icon: HiOutlineDocumentText,
        permission: 'cms',
        children: [
          { label: 'Pages', path: '/admin/cms/pages', permission: 'cms' },
          { label: 'Blogs', path: '/admin/cms/blogs', permission: 'cms' },
          { label: 'Blog Categories', path: '/admin/cms/blog-categories', permission: 'cms' },
          { label: 'Authors', path: '/admin/cms/authors', permission: 'cms' },
          { label: 'FAQs', path: '/admin/cms/faqs', permission: 'cms' },
        ],
      },
    ],
  },
  {
    group: 'Engagement',
    items: [
      {
        label: 'Store Locations',
        path: '/admin/stores',
        icon: HiOutlineMapPin,
        permission: 'stores',
      },
      {
        label: 'Inquiries',
        path: '/admin/inquiries',
        icon: HiOutlineEnvelope,
        permission: 'inquiries',
        badge: true,
      },
      {
        label: 'Surveys',
        path: '/admin/surveys',
        icon: HiOutlineChatBubbleLeftRight,
        permission: 'surveys',
      },
    ],
  },
  {
    group: 'Insights',
    items: [
      {
        label: 'Analytics',
        path: '/admin/analytics',
        icon: HiOutlineChartBar,
        permission: 'analytics',
      },
      {
        label: 'Notifications',
        path: '/admin/notifications',
        icon: HiOutlineBell,
        permission: 'notifications',
      },
    ],
  },
  {
    group: 'System',
    items: [
      {
        label: 'Settings',
        path: '/admin/settings',
        icon: HiOutlineCog6Tooth,
        permission: 'settings',
      },
      {
        label: 'System Config',
        path: '/admin/system-config',
        icon: HiOutlineWrenchScrewdriver,
        permission: 'settings',
      },
      {
        label: 'Profile',
        path: '/admin/profile',
        icon: HiOutlineUserCircle,
        permission: 'dashboard',
      },
    ],
  },
];

/**
 * Order status configuration
 */
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  processing: { label: 'Processing', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  refunded: { label: 'Refunded', color: 'neutral' },
};

/**
 * Payment status configuration
 */
export const PAYMENT_STATUSES = {
  paid: { label: 'Paid', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'danger' },
  refunded: { label: 'Refunded', color: 'neutral' },
};

/**
 * Product status configuration
 */
export const PRODUCT_STATUSES = {
  active: { label: 'Active', color: 'success' },
  draft: { label: 'Draft', color: 'neutral' },
  archived: { label: 'Archived', color: 'warning' },
  out_of_stock: { label: 'Out of Stock', color: 'danger' },
};

/**
 * Date range presets for analytics
 */
export const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

/**
 * Badge variant styles mapping
 */
export const BADGE_VARIANTS = {
  success: {
    bg: 'var(--admin-success-light)',
    color: 'var(--admin-success)',
    border: 'var(--admin-success-border)',
  },
  warning: {
    bg: 'var(--admin-warning-light)',
    color: 'var(--admin-warning)',
    border: 'var(--admin-warning-border)',
  },
  danger: {
    bg: 'var(--admin-danger-light)',
    color: 'var(--admin-danger)',
    border: 'var(--admin-danger-border)',
  },
  info: {
    bg: 'var(--admin-info-light)',
    color: 'var(--admin-info)',
    border: 'var(--admin-info-border)',
  },
  neutral: {
    bg: 'var(--admin-surface-secondary)',
    color: 'var(--admin-text-secondary)',
    border: 'var(--admin-border)',
  },
  accent: {
    bg: 'var(--admin-accent-light)',
    color: 'var(--admin-accent-700)',
    border: 'var(--admin-accent-200)',
  },
};
