// src/components/layout/DashboardLayout.tsx
import { useState, ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useAutoLogout from '../../hooks/useAutoLogout';
import InactivityWarning from '../common/InactivityWarning';
import './layout.css';
import { 
  LayoutDashboard, 
  Box, 
  ClipboardList, 
  ShoppingCart, 
  Shield, 
  Users, 
  User, 
  LogOut,
  Menu,
  ChevronRight,
  Package,
  FileText,
  Clock,
  CheckCircle,
  History,
  FilePlus,
  Scale,
  FileBadge,
  Truck,
  Sliders
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  visible?: (roles: string[]) => boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Products',
    to: '/dashboard/products',
    icon: <Box size={18} />,
  },
  {
    label: 'Requisition Management',
    to: '/dashboard/requisitions',
    visible: (roles) => !roles.some(r => ['Store', 'StoreManager'].includes(r)),
    icon: <ClipboardList size={18} />,
    children: [
      {
        label: 'My Requisitions',
        to: '/dashboard/requisitions',
        icon: <FileText size={16} />,
      },
      {
        label: 'Create Employee Requisition',
        to: '/dashboard/create-employee-requisition',
        visible: (roles) => roles.some(r => ['Admin', 'Employee', 'DepartmentHead', 'Manager'].includes(r)),
        icon: <FilePlus size={16} />,
      },
      {
        label: 'Pending Approvals',
        to: '/dashboard/approvals',
        visible: (roles) => roles.some(r => ['Admin', 'Manager', 'DepartmentHead'].includes(r)),
        icon: <Clock size={16} />,
      },
    ],
  },
  {
    label: 'Store & Inventory',
    to: '/dashboard/store',
    icon: <Package size={18} />,
    visible: (roles) => roles.some(r => ['Admin', 'Store', 'StoreManager'].includes(r)),
    children: [
      {
        label: 'Pending Requisitions',
        to: '/dashboard/store/pending-requisitions',
        icon: <Clock size={16} />,
      },
      {
        label: 'Stock Overview',
        to: '/dashboard/store/stock-overview',
        icon: <Box size={16} />,
      },
      {
        label: 'Create Purchase Requisition',
        to: '/dashboard/create-requisition',
        icon: <FilePlus size={16} />,
      },
      {
        label: 'Issue History',
        to: '/dashboard/store/issues',
        icon: <History size={16} />,
      },
    ],
  },
  {
    label: 'Purchasing Operations',
    to: '/dashboard/purchase',
    icon: <ShoppingCart size={18} />,
    visible: (roles) => roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager'].includes(r)),
    children: [
      {
        label: 'Purchase Requisitions',
        to: '/dashboard/purchase/requisitions',
        icon: <ClipboardList size={16} />,
      },
      {
        label: 'Approved (For RFQ)',
        to: '/dashboard/approved-requisitions',
        visible: (roles) => roles.some(r => ['Admin', 'Manager', 'PurchaseOfficer', 'PurchaseManager'].includes(r)),
        icon: <CheckCircle size={16} />,
      },
    ],
  },
  {
    label: 'Procurement & Sourcing',
    to: '/dashboard/procurement',
    icon: <FileBadge size={18} />,
    visible: (roles) => roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager', 'MD', 'StoreManager', 'WarehouseManager'].includes(r)),
    children: [
      {
        label: 'RFQs',
        to: '/dashboard/rfqs',
        visible: (roles) => roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager', 'MD'].includes(r)),
        icon: <FileText size={16} />,
      },
      {
        label: 'Comparative Statements',
        to: '/dashboard/comparative-statements',
        visible: (roles) => roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager', 'MD'].includes(r)),
        icon: <Scale size={16} />,
      },
      {
        label: 'Purchase Orders',
        to: '/dashboard/purchase-orders',
        visible: (roles) => roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager', 'MD', 'StoreManager', 'WarehouseManager'].includes(r)),
        icon: <ShoppingCart size={16} />,
      },
    ],
  },
  {
    label: 'Goods Receipt (GRN)',
    to: '/dashboard/goods-receipt',
    icon: <Truck size={18} />,
    visible: (roles) => roles.some(r => ['Admin', 'StoreManager', 'WarehouseManager', 'Accounts', 'ProcurementManager'].includes(r)),
  },
  {
    label: 'Warehouse Setup',
    to: '/dashboard/location-setup',
    visible: (roles) => roles.includes('Admin'),
    icon: <Sliders size={18} />,
  },
  {
    label: 'Role Manager',
    to: '/dashboard/role-manager',
    visible: (roles) => roles.some(r => ['Admin', 'Manager'].includes(r)),
    icon: <Shield size={18} />,
  },
  {
    label: 'User Management',
    to: '/dashboard/users',
    visible: (roles) => roles.includes('Admin'),
    icon: <Users size={18} />,
  },
  {
    label: 'Profile',
    to: '/dashboard/profile',
    icon: <User size={18} />,
  },
];

const DashboardLayout = () => {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // 30 minutes inactivity timeout
  useAutoLogout(30);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const renderNavItem = (item: NavItem, isChild: boolean = false) => {
    // Check visibility
    if (item.visible && !item.visible(roles)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenu === item.label;

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors duration-200 border-l-4 ${
              isExpanded 
                ? 'bg-slate-800/80 text-white border-slate-600' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-transparent'
            }`}
            onClick={() => toggleSubmenu(item.label)}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {sidebarOpen && (
              <>
                <span className="flex-1 whitespace-nowrap overflow-hidden text-sm font-medium">{item.label}</span>
                <ChevronRight 
                  size={16} 
                  className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </>
            )}
          </div>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded && sidebarOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="ml-4 pl-2 border-l border-slate-700/50 flex flex-col gap-1 mb-2">
                {item.children && item.children
                  .filter(child => !child.visible || child.visible(roles))
                  .map(child => renderNavItem(child, true))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/dashboard'}
        className={({ isActive }) => 
          `flex items-center gap-3 rounded-md transition-all duration-200 group ${
            isChild ? 'px-3 py-2 text-sm' : 'px-3 py-2.5 text-sm font-medium'
          } border-l-4 ${
            isActive 
              ? 'bg-gradient-to-r from-teal-900/50 to-transparent border-teal-500 text-white' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-transparent'
          }`
        }
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {sidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <div className={`layout-wrapper font-sans ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <InactivityWarning />

      <aside 
        className={`fixed top-0 left-0 h-screen bg-slate-900/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out z-[100] ${
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-[68px] border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex-shrink-0">
              <Box size={20} />
            </div>
            {sidebarOpen && <span className="font-bold text-white tracking-tight whitespace-nowrap">SuperShop ERP</span>}
          </div>
          <button 
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-md transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-1 custom-scrollbar">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        <div className="p-3 border-t border-slate-800/80 flex items-center gap-3 bg-slate-900/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-800 text-teal-400 font-bold text-sm flex-shrink-0 border border-slate-700/50">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user?.email}</span>
              <span className="text-xs text-slate-400 font-mono truncate">{roles[0] ?? 'User'}</span>
            </div>
          )}
          <button 
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors flex-shrink-0"
            onClick={handleLogout} 
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content min-h-screen bg-slate-50 transition-all duration-300 ease-in-out">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;