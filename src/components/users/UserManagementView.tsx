import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Percent, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Key,
  X
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Manager' | 'Technician';
  username: string;
  status: 'active' | 'inactive';
  assignedLocation: string;
  phone: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface CommissionAgent {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  commissionPercentage: number;
  totalSales: number;
  totalCommissionPaid: number;
}

export const UserManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles' | 'agents'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Users state
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Super Admin', email: 'admin@ultimatepos.io', username: 'admin', role: 'Admin', status: 'active', assignedLocation: 'All Locations', phone: '+1 (555) 019-2834' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@ultimatepos.io', username: 'sarah_pos', role: 'Cashier', status: 'active', assignedLocation: 'Downtown Flagship', phone: '+1 (555) 019-5821' },
    { id: '3', name: 'Alex Rivera', email: 'alex.r@ultimatepos.io', username: 'alex_tech', role: 'Technician', status: 'active', assignedLocation: 'Westside Service Hub', phone: '+1 (555) 019-8923' },
    { id: '4', name: 'Marcus Vance', email: 'marcus.v@ultimatepos.io', username: 'marcus_mgr', role: 'Manager', status: 'active', assignedLocation: 'Uptown Express Mall', phone: '+1 (555) 019-3312' },
  ]);

  // Roles state
  const [roles] = useState<Role[]>([
    { id: '1', name: 'Admin', description: 'Unrestricted master access across all locations, financial ledgers, and configurations', permissions: ['All Permissions', 'Manage Users', 'View Profit & Loss', 'Stock Adjustments', 'System Settings'] },
    { id: '2', name: 'Manager', description: 'Can oversee store sales, approve discounts, manage stock transfers, and view shift registers', permissions: ['POS Terminal', 'View Sales', 'Approve Discounts', 'Manage Stock', 'View Reports'] },
    { id: '3', name: 'Cashier', description: 'Front-desk point of sale checkout, register balance, order parking, and customer lookup', permissions: ['POS Terminal', 'Add Sale', 'View Products', 'Open/Close Cash Drawer'] },
    { id: '4', name: 'Technician', description: 'Device repair bench, diagnostic checklists, job sheets update, parts assignment', permissions: ['Repair Job Sheets', 'Update Repair Status', 'View Spare Parts'] },
  ]);

  // Commission Agents state
  const [agents, setAgents] = useState<CommissionAgent[]>([
    { id: '1', name: 'David Miller', email: 'david.m@partners.com', contactNumber: '+1 555-8821', address: 'Suite 400, Commercial Ave', commissionPercentage: 3.5, totalSales: 45200, totalCommissionPaid: 1582 },
    { id: '2', name: 'Elena Rostova', email: 'elena.r@agency.com', contactNumber: '+1 555-9932', address: 'Floor 2, Tech Plaza', commissionPercentage: 5.0, totalSales: 89400, totalCommissionPaid: 4470 },
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Cashier' | 'Manager' | 'Technician'>('Cashier');
  const [newUserLocation, setNewUserLocation] = useState('Downtown Flagship');
  const [newUserPhone, setNewUserPhone] = useState('');

  // New Agent form
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentRate, setNewAgentRate] = useState('5.0');
  const [newAgentAddress, setNewAgentAddress] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const userObj: User = {
      id: Date.now().toString(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      username: newUserUsername.trim() || newUserName.toLowerCase().replace(/\s+/g, '_'),
      role: newUserRole,
      status: 'active',
      assignedLocation: newUserLocation,
      phone: newUserPhone.trim() || '+1 (555) 000-0000',
    };
    setUsers([...users, userObj]);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserUsername('');
    setNewUserPhone('');
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    const agentObj: CommissionAgent = {
      id: Date.now().toString(),
      name: newAgentName.trim(),
      email: newAgentEmail.trim(),
      contactNumber: newAgentPhone.trim(),
      address: newAgentAddress.trim(),
      commissionPercentage: parseFloat(newAgentRate) || 0,
      totalSales: 0,
      totalCommissionPaid: 0,
    };
    setAgents([...agents, agentObj]);
    setIsAddAgentOpen(false);
    setNewAgentName('');
    setNewAgentEmail('');
    setNewAgentPhone('');
    setNewAgentAddress('');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control employee logins, role permission matrices, and sales commission agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'users' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
          {activeSubTab === 'agents' && (
            <button
              onClick={() => setIsAddAgentOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commission Agent</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'roles'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Roles & Permissions ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('agents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'agents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Sales Commission Agents ({agents.length})</span>
        </button>
      </div>

      {/* Tab Content: Users */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, username or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Assigned Location</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">@{user.username}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'Manager'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'Technician'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{user.assignedLocation}</td>
                      <td className="px-4 py-3.5 text-slate-600">{user.phone}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setUsers(users.filter(u => u.id !== user.id))}
                          disabled={user.role === 'Admin'}
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                            user.role === 'Admin' ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Roles */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{role.name}</h3>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Granted Permissions</div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm, pIdx) => (
                    <span key={pIdx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Commission Agents */}
      {activeSubTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Agent Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Commission Rate</th>
                  <th className="px-4 py-3">Total Attributed Sales</th>
                  <th className="px-4 py-3">Earned Commission</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {agents.map(agent => (
                  <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{agent.name}</div>
                      <div className="text-[11px] text-slate-500">{agent.address}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>{agent.email}</div>
                      <div className="text-[11px] text-slate-500">{agent.contactNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                        {agent.commissionPercentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold">${agent.totalSales.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">${agent.totalCommissionPaid.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setAgents(agents.filter(a => a.id !== agent.id))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New POS User / Staff</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="john@store.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={e => setNewUserUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Technician">Technician</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch / Location</label>
                  <select
                    value={newUserLocation}
                    onChange={e => setNewUserLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Downtown Flagship">Downtown Flagship</option>
                    <option value="Westside Service Hub">Westside Service Hub</option>
                    <option value="Uptown Express Mall">Uptown Express Mall</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {isAddAgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add Commission Agent</h3>
              <button onClick={() => setIsAddAgentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  placeholder="e.g. Robert Fox"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAgentEmail}
                    onChange={e => setNewAgentEmail(e.target.value)}
                    placeholder="robert@sales.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newAgentRate}
                    onChange={e => setNewAgentRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp</label>
                <input
                  type="tel"
                  value={newAgentPhone}
                  onChange={e => setNewAgentPhone(e.target.value)}
                  placeholder="+1 555-0192"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newAgentAddress}
                  onChange={e => setNewAgentAddress(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAgentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
