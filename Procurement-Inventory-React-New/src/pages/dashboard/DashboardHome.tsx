// src/pages/dashboard/DashboardHome.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();

  // Primary user role identification (fallback to 'Employee')
  const primaryRole = (roles[0] || 'Employee') as 'Admin' | 'Employee' | 'DeptHead' | 'Purchase' | 'Store';

  // --- SUB-RENDERS FOR ROLES ---

  // 1. Employee Dashboard Content
  const renderEmployeeDashboard = () => {
    const requisitions = [
      { id: 'PR-2026-004', date: 'May 18, 2026', items: 5, value: 1240.00, status: 'Pending Dept Approval', statusColor: 'bg-zinc-100 text-zinc-800' },
      { id: 'PR-2026-003', date: 'May 12, 2026', items: 2, value: 350.00, status: 'Approved by Manager', statusColor: 'bg-zinc-900 text-zinc-100' },
      { id: 'PR-2026-002', date: 'May 05, 2026', items: 12, value: 4800.00, status: 'Order Placed', statusColor: 'bg-zinc-900 text-zinc-100' },
      { id: 'PR-2026-001', date: 'Apr 28, 2026', items: 1, value: 85.00, status: 'Fully Received', statusColor: 'bg-zinc-200 text-zinc-600' },
    ];

    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Requisitions</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">12</h3>
            <p className="text-xs text-zinc-400 mt-1">Submitted in the current period</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Approved Requests</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">8</h3>
            <p className="text-xs text-zinc-400 mt-1">Signed-off and sent to procurement</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Pending Sign-off</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">4</h3>
            <p className="text-xs text-zinc-400 mt-1">Awaiting manager review</p>
          </div>
        </div>

        {/* Action and Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table list: Left side (ColSpan: 2) */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">My Recent Requisitions</h3>
              <button 
                onClick={() => navigate('/dashboard/requisitions')}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                    <th className="pb-3">PR Number</th>
                    <th className="pb-3">Submission Date</th>
                    <th className="pb-3 text-center">Items</th>
                    <th className="pb-3 text-right">Total Value</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {requisitions.map((req) => (
                    <tr key={req.id} className="text-zinc-900 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 font-semibold">{req.id}</td>
                      <td className="py-3.5 text-zinc-500">{req.date}</td>
                      <td className="py-3.5 text-center text-zinc-500">{req.items}</td>
                      <td className="py-3.5 text-right font-semibold">${req.value.toFixed(2)}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.statusColor}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Shortcuts: Right side */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Self Service shortcuts</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/products')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>Browse Product Catalog</span>
                <span className="text-zinc-400">→</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/requisitions')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>Track Order History</span>
                <span className="text-zinc-400">→</span>
              </button>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-150 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700 block mb-1">Procurement Support</span>
                Need quick approval? Requisitions exceeding $5,000 require multi-stage executive approval logs automatically routed.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. DeptHead Dashboard Content
  const renderDeptHeadDashboard = () => {
    const pendingPRs = [
      { id: 'PR-2026-009', employee: 'John Doe', dept: 'IT Systems', date: 'May 17, 2026', amount: 2500.00 },
      { id: 'PR-2026-008', employee: 'Jane Smith', dept: 'HR & Operations', date: 'May 15, 2026', amount: 1200.00 },
      { id: 'PR-2026-007', employee: 'Alex Johnson', dept: 'Global Logistics', date: 'May 14, 2026', amount: 8900.00 },
    ];

    return (
      <div className="space-y-8">
        {/* Department Alerts & Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Banner */}
          <div className="bg-zinc-900 border border-zinc-950 p-6 rounded-xl text-white lg:col-span-2 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white mb-3">
                Action Required
              </span>
              <h3 className="text-2xl font-bold tracking-tight">6 Pending Requisitions Awaiting Sign-off</h3>
              <p className="text-zinc-400 text-sm mt-2 max-w-md">
                Review and approve outstanding requisitions to prevent procurement logjams. Pending budget caps remain active.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/requisitions')}
              className="mt-6 w-fit py-2.5 px-5 bg-white text-zinc-900 font-semibold text-xs rounded-lg hover:bg-zinc-100 transition-all uppercase tracking-wider"
            >
              Go to Approval Center
            </button>
          </div>

          {/* Department Budget Spend Widget */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Dept Monthly Budget</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-2">$180,000</h3>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                <span>Spend to Date</span>
                <span>$142,500 (79%)</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 rounded-full" style={{ width: '79%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Items Grid */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Requisitions Awaiting Manager Signature</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                  <th className="pb-3">Requisition</th>
                  <th className="pb-3">Submitted By</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Submission Date</th>
                  <th className="pb-3 text-right">Value</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {pendingPRs.map((pr) => (
                  <tr key={pr.id} className="text-zinc-900 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 font-bold">{pr.id}</td>
                    <td className="py-3.5 font-medium">{pr.employee}</td>
                    <td className="py-3.5 text-zinc-500">{pr.dept}</td>
                    <td className="py-3.5 text-zinc-500">{pr.date}</td>
                    <td className="py-3.5 text-right font-bold">${pr.amount.toFixed(2)}</td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => navigate('/dashboard/requisitions')}
                          className="px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. Purchase Dashboard Content
  const renderPurchaseDashboard = () => {
    const recentPOs = [
      { id: 'PO-2026-081', supplier: 'Global Logistics Ltd', date: 'May 18, 2026', total: 12400.00, status: 'Draft' },
      { id: 'PO-2026-080', supplier: 'Apex Retail Wholesalers', date: 'May 16, 2026', total: 34500.00, status: 'Sent to Vendor' },
      { id: 'PO-2026-079', supplier: 'Prime Tech Distribution', date: 'May 12, 2026', total: 5600.00, status: 'Partially Received' },
      { id: 'PO-2026-078', supplier: 'Core Office Supplies', date: 'May 09, 2026', total: 1250.00, status: 'Completed' },
    ];

    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Approved PRs (Ready for PO)</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">14</h3>
            <p className="text-xs text-zinc-400 mt-1">Requisitions verified for processing</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Open POs</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">8</h3>
            <p className="text-xs text-zinc-400 mt-1">Pending delivery and verification</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Active Suppliers</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">32</h3>
            <p className="text-xs text-zinc-400 mt-1">Verified partner networks</p>
          </div>
        </div>

        {/* PO List */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900">Recent Purchase Orders</h3>
            <button 
              onClick={() => navigate('/dashboard/purchase-orders')}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
            >
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                  <th className="pb-3">PO Number</th>
                  <th className="pb-3">Supplier Name</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3 text-right">Total Amount</th>
                  <th className="pb-3 text-right">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentPOs.map((po) => (
                  <tr key={po.id} className="text-zinc-900 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 font-bold">{po.id}</td>
                    <td className="py-3.5 font-medium">{po.supplier}</td>
                    <td className="py-3.5 text-zinc-500">{po.date}</td>
                    <td className="py-3.5 text-right font-bold">${po.total.toFixed(2)}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        po.status === 'Completed' ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-900 text-white'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 4. Store Dashboard Content
  const renderStoreDashboard = () => {
    const lowStockItems = [
      { sku: 'SKU-8829', name: 'Organic Whole Milk 1L', stock: 12, reorder: 50, status: 'Critical' },
      { sku: 'SKU-4410', name: 'Premium White Toasting Bread', stock: 8, reorder: 30, status: 'Critical' },
      { sku: 'SKU-1290', name: 'Fresh Gala Apples (1kg bag)', stock: 24, reorder: 40, status: 'Low' },
      { sku: 'SKU-3902', name: 'Whole Grain Cereal Mix', stock: 15, reorder: 25, status: 'Low' },
    ];

    return (
      <div className="space-y-8">
        {/* KPI Alert Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-red-200 p-6 rounded-xl shadow-sm">
            <p className="text-red-600 text-xs font-semibold uppercase tracking-wider">Low Stock Alert</p>
            <h3 className="text-3xl font-bold text-red-700 mt-2">9 Items</h3>
            <p className="text-xs text-red-500 mt-1">Below critical reorder metrics</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total GRNs Issued</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">148</h3>
            <p className="text-xs text-zinc-400 mt-1">Goods Receipt Notes in database</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Pending Gate Entry</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">4</h3>
            <p className="text-xs text-zinc-400 mt-1">Expected shipments logged today</p>
          </div>
        </div>

        {/* Low Stock Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Critical Stock Reorder Monitor</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Item Description</th>
                    <th className="pb-3 text-center">In Stock</th>
                    <th className="pb-3 text-center">Min Threshold</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {lowStockItems.map((item) => (
                    <tr key={item.sku} className="text-zinc-900 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-zinc-500">{item.sku}</td>
                      <td className="py-3.5 font-medium">{item.name}</td>
                      <td className="py-3.5 text-center text-red-600 font-semibold">{item.stock} units</td>
                      <td className="py-3.5 text-center text-zinc-400">{item.reorder} units</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          item.status === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-250'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Store Tasks */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Warehouse Operations</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/issue-product')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>Create Product Issue</span>
                <span className="text-zinc-400">→</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/grn-list')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>Goods Receipt Notes (GRN)</span>
                <span className="text-zinc-400">→</span>
              </button>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-150 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700 block mb-1">Inventory Sync Status</span>
                Last FIFO recalculation sync completed 2 hours ago. Real-time store stock updates enabled.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. Admin Dashboard Content
  const renderAdminDashboard = () => {
    const systemAudits = [
      { event: 'User role updated', details: 'store@supershop.com role set to [Store]', time: '10m ago' },
      { event: 'Database automated archiving', details: 'Cleared 12 finalized PO invoices from view logs', time: '2h ago' },
      { event: 'Supplier verification registered', details: 'Supplier "Global Tech Partner" active in system', time: '4h ago' },
    ];

    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Expenditures YTD</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">$348,250.00</h3>
            <p className="text-xs text-zinc-400 mt-1">Aggregated platform spend accounts</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Catalog Active Products</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">2,840 Items</h3>
            <p className="text-xs text-zinc-400 mt-1">Synced across multiple warehouse bins</p>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Registered Active Users</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-2">48 Users</h3>
            <p className="text-xs text-zinc-400 mt-1">Multi-role permissions active</p>
          </div>
        </div>

        {/* Administration Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System logs */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Platform Audit Logs</h3>
            <div className="space-y-4">
              {systemAudits.map((audit, idx) => (
                <div key={idx} className="flex items-start justify-between p-3.5 rounded-lg bg-zinc-50/50 border border-zinc-100 hover:border-zinc-250 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 uppercase block tracking-wide">{audit.event}</span>
                    <span className="text-sm text-zinc-500 mt-0.5 block">{audit.details}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap">{audit.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Executive Panel</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/users')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>User Management</span>
                <span className="text-zinc-400">→</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/roles')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>Role Permissions Settings</span>
                <span className="text-zinc-400">→</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/products')}
                className="w-full p-3.5 rounded-lg border border-zinc-200 text-zinc-800 font-medium text-sm text-left hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <span>View Products Catalog</span>
                <span className="text-zinc-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dispatcher method rendering the matching role panel
  const renderDashboardContent = () => {
    switch (primaryRole) {
      case 'Admin':
        return renderAdminDashboard();
      case 'DeptHead':
        return renderDeptHeadDashboard();
      case 'Purchase':
        return renderPurchaseDashboard();
      case 'Store':
        return renderStoreDashboard();
      case 'Employee':
      default:
        return renderEmployeeDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 sm:p-8 font-sans antialiased">
      {/* Dynamic Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ERP Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Logged in as <strong className="text-zinc-700 font-semibold">{user?.email}</strong> • Role:{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-white uppercase ml-1">
              {primaryRole}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm focus:outline-none"
          >
            My Profile
          </button>
          {primaryRole === 'Employee' && (
            <button 
              onClick={() => navigate('/dashboard/products')}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm focus:outline-none"
            >
              Create Requisition
            </button>
          )}
        </div>
      </div>

      {/* Render matching workspace based on current active role */}
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardHome;