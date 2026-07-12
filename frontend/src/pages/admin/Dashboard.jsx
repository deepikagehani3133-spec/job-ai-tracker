import { useEffect, useState } from "react";
import {
  BarChart,
  // FaBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  // FaClipboardList,
} from "recharts";
import api from "../../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../../layouts/MainLayout";
import {
  FaUsers,
  FaChartLine,
  FaBriefcase,
  FaCalendarAlt,
  FaUserTie,
} from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsByStatus, setJobsByStatus] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);

      // Extract data for charts
      if (response.data.jobs_by_status) {
        const jobsByStatusData = Object.entries(response.data.jobs_by_status).map(
          ([status, count]) => ({
            name: status.replace("_", " ").toUpperCase(),
            value: count,
          })
        );
        setJobsByStatus(jobsByStatusData);
      }

      if (response.data.role_distribution) {
        const roleDistData = response.data.role_distribution.map((role) => ({
          name: role.role,
          value: role.count,
        }));
        setRoleDistribution(roleDistData);
      }

      if (response.data.recent_jobs) {
        setRecentJobs(response.data.recent_jobs);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
      toast.error("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            <p className="mt-2 text-zinc-400">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-zinc-950 text-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              <FaChartLine /> Admin Dashboard
            </h1>
            <button
              onClick={() => fetchStats()}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Error Loading Dashboard</h3>
                <p className="text-zinc-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <FaChartLine />
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-2">
              System-wide statistics and analytics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-900/20 rounded-full text-blue-400">
                    <FaUsers />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Total Users</h2>
                  <p className="text-zinc-400 text-sm">
                    Registered accounts
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-blue-400">
                {stats?.kpi?.total_users ?? 0}
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-900/20 rounded-full text-green-400">
                    <FaUserTie />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Active Users (7d)</h2>
                  <p className="text-zinc-400 text-sm">
                    Logged in last week
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-green-400">
                {stats?.kpi?.active_users_7d ?? 0}
              </div>
            </div>

            {/* Jobs Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-900/20 rounded-full text-purple-400">
                    <FaBriefcase />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Total Jobs</h2>
                  <p className="text-zinc-400 text-sm">
                    Tracked applications
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-purple-400">
                {stats?.kpi?.total_jobs ?? 0}
              </div>
            </div>

            {/* Interview Rate Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-orange-900/20 rounded-full text-orange-400">
                    <FaCalendarAlt />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Interview Rate</h2>
                  <p className="text-zinc-400 text-sm">
                    Percentage of applications leading to interviews
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-orange-400">
                {stats?.kpi?.interview_rate ?? 0}%
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Jobs by Status Bar Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                {/* <FaBarChart /> Jobs by Status */}
              </h2>
              {jobsByStatus.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobsByStatus}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        fill="url(#gradientBar)"
                      />
                      <defs>
                        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">No job data available</p>
              )}
            </div>

            {/* Role Distribution Pie Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                <FaUsers /> Role Distribution
              </h2>
              {roleDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${Math.round(percent)}%)`
                        }
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`color-${(index % 9) + 1}`} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">No role data available</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              {/* <FaClipboardList /> Recent Activity */}
            </h2>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {job.company}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          {job.role} • {job.status?.toUpperCase() || "UNKNOWN"}
                        </p>
                      </div>
                      <div className="text-right text-zinc-400 text-sm">
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-zinc-300">
                      Applied on {new Date(job.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-500 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;