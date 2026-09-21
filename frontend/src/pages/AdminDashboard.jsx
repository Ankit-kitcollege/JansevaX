import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { reportApi } from '../api/reportApi';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Shield, Layers, Users, Building, AlertTriangle, FileText, CheckCircle2, Clock, MapPin, ExternalLink, Search } from 'lucide-react';

const COLORS = ['#0284c7', '#10b981', '#06b6d4', '#eab308', '#a855f7', '#f97316', '#ef4444', '#64748b'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [anRes, repRes, usRes, depRes] = await Promise.all([
          adminApi.getAnalytics(),
          reportApi.getAllReports(),
          adminApi.getUsers(),
          adminApi.getDepartments()
        ]);
        setAnalytics(anRes.data);
        setReports(repRes.data);
        setUsers(usRes.data);
        setDepartments(depRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const categoryChartData = analytics?.reportsByCategory
    ? Object.keys(analytics.reportsByCategory).map(key => ({
        name: key.replace(/_/g, ' '),
        value: analytics.reportsByCategory[key]
      }))
    : [];

  const statusChartData = analytics?.reportsByStatus
    ? Object.keys(analytics.reportsByStatus).map(key => ({
        name: key.replace(/_/g, ' '),
        value: analytics.reportsByStatus[key]
      }))
    : [];

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase()) && !r.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-400" /> Municipal Executive Analytics Console
          </h1>
          <p className="text-xs text-slate-400">High-level GIS problem intelligence, spatial clusters, and department response monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/clusters" className="px-3.5 py-2 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:bg-purple-500/20 transition-colors">
            <Layers className="w-4 h-4" /> Manage Spatial Clusters
          </Link>
          <Link to="/map" className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors">
            <MapPin className="w-4 h-4" /> City GIS Map
          </Link>
        </div>
      </div>

      {/* High-level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Reports</span>
          <span className="text-2xl font-extrabold text-white block font-mono">{analytics?.totalReports || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Active Workload</span>
          <span className="text-2xl font-extrabold text-cyan-300 block font-mono">{analytics?.activeReports || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Critical Priority</span>
          <span className="text-2xl font-extrabold text-rose-400 block font-mono">{analytics?.criticalProblems || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-purple-400 uppercase">Problem Clusters</span>
          <span className="text-2xl font-extrabold text-purple-300 block font-mono">{analytics?.totalClusters || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-orange-400 uppercase">Recurring Hotspots</span>
          <span className="text-2xl font-extrabold text-orange-300 block font-mono">{analytics?.totalRecurringProblems || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Avg Resolution</span>
          <span className="text-2xl font-extrabold text-emerald-300 block font-mono">{analytics?.avgResolutionHours || 18}h</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white font-heading">Reports by Problem Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white font-heading">Workflow Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Reports Table & Filtering */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-base font-bold font-heading text-white">All Municipal Civic Reports</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CITIZEN_VERIFICATION">Awaiting Verification</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Category & Title</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">#{r.id}</td>
                  <td className="py-3 px-4">
                    <span className="block font-bold text-white max-w-xs truncate">{r.title}</span>
                    <span className="text-[10px] text-sky-400">{r.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge score={r.priorityScore} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">{r.departmentName}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/reports/${r.id}`} className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1">
                      Inspect <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
