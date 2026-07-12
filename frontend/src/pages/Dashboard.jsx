import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";
import MainLayout from "../layouts/MainLayout";
import {
  FiTrendingUp,
  FiPieChart,
  FiClock,
  FiUsers,
  FiMail,
  FiCheckCircle,
  FiX,
  FiAlertTriangle,
  FiRefreshCcw,
} from "react-icons/fi";
import { HiOutlineChartBar } from "react-icons/hi";
// import { CiAnalytics } from "react-icons/ci";

const STATUS_COLORS = {
  Applied: { bg: "bg-blue-500/20 text-blue-400", text: "text-blue-400" },
  Interview: { bg: "bg-yellow-500/20 text-yellow-400", text: "text-yellow-400" },
  Offer: { bg: "bg-emerald-500/20 text-emerald-400", text: "text-emerald-400" },
  Rejected: { bg: "bg-red-500/20 text-red-400", text: "text-red-400" },
  Withdrawn: { bg: "bg-gray-500/20 text-gray-400", text: "text-gray-400" },
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-zinc-400">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {/* <CiAnalytics /> Dashboard */}
            </h1>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiAlertTriangle className="text-red-400 mt-1 flex-shrink- flex-shrink-0 h-5 w-5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Dashboard Error</h3>
                <p className="text-zinc-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-zinc-500">No data available</p>
        </div>
      </MainLayout>
    );
  }

  const {
    summary,
    rates,
    trends,
    distribution,
    recent_activity,
  } = data;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {/* <CiAnalytics /> */}
            Dashboard
          </h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-900/20 rounded-full text-blue-400">
                  <FiTrendingUp />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Total Applications</h2>
                <p className="text-zinc-400 text-sm">All time</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-blue-400">
              {summary.total_jobs}
            </div>
          </div>

          {/* Interviews */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center bg-yellow-900/20 rounded-full text-yellow-400">
                  <FiUsers />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Interviews</h2>
                <p className="text-zinc-400 text-sm">Screenings completed</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-yellow-400">
              {summary.interview_jobs}
            </div>
          </div>

          {/* Offers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-900/20 rounded-full text-emerald-400">
                  <FiCheckCircle />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Job Offers</h2>
                <p className="text-zinc-400 text-sm">Offers received</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-emerald-400">
              {summary.offer_jobs}
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center bg-green-900/20 rounded-full text-green-400">
                  <FiCheckCircle />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Success Rate</h2>
                <p className="text-zinc-400 text-sm">Application to Offer</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-green-400">
              {rates.application_to_offer}%
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Trend (Line Chart) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                <FiTrendingUp /> Application Trend (30 Days)
              </h2>
              <span className="text-sm text-zinc-400">
                Daily applications submitted
              </span>
            </div>
            {trends.daily_applications && Object.keys(trends.daily_applications).length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Object.entries(trends.daily_applications).map(([date, count]) => ({
                    name: date,
                    uv: count,
                  }))}>
                    <XAxis dataKey="name" tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    } />
                    <YAxis
                      domain={[0, 'auto']}
                      tickCount={5}
                    />
                    <Tooltip
                      formatter={(value) => `${value} applications`}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      point={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-zinc-500 py-8">No application data for the last 30 days</p>
            )}
          </div>

          {/* Status Distribution (Pie Chart) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                <FiPieChart /> Application Status Distribution
              </h2>
              <span className="text-sm text-zinc-400">
                Breakdown by status
              </span>
            </div>
            {distribution.status && Object.keys(distribution.status).length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(distribution.status).map(([status, count]) => ({
                        name: status,
                        value: count,
                      }))}
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
                      {Object.entries(distribution.status).map(([status, index]) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[status] ? STATUS_COLORS[status].bg.replace('/20', '') : '#8b5cf6'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-zinc-500 py-8">No status data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            <FiChartBar /> Conversion Funnel
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Applications</span>
              <span className="font-medium text-white">{summary.applied_jobs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Interviews</span>
              <span className="font-medium text-white">{summary.interview_jobs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Offers</span>
              <span className="font-medium text-white">{summary.offer_jobs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Application → Interview</span>
              <span className="font-medium text-white">{rates.application_to_interview}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Interview → Offer</span>
              <span className="font-medium text-white">{rates.interview_to_offer}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Application → Offer</span>
              <span className="font-medium text-white">{rates.application_to_offer}%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              <FiClock /> Recent Activity
            </h2>
            <span className="text-sm text-zinc-400">
              Last 10 applications
            </span>
          </div>
          {recent_activity && recent_activity.length > 0 ? (
            <div className="space-y-3">
              {recent_activity.map((activity, index) => (
                <div key={index} className="bg-zinc-800/50 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{activity.company}</h3>
                      <p className="text-zinc-300 text-sm">{activity.role}</p>
                    </div>
                    <div className="text-right text-xs">
                      <span
                        className={`${STATUS_COLORS[activity.status]?.text || 'text-zinc-400'} text-xs px-2 py-0.5 rounded`}
                      >
                        {activity.status}
                      </span>
                      <span className="ml-2 text-zinc-500 text-xs">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            <HiOutlineChartBar /> Monthly Application Volume
          </h2>
          <span className="text-sm text-zinc-400">
            Last 6 months
          </span>
        </div>
        {trends.monthly_volume && Object.keys(trends.monthly_volume).length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(trends.monthly_volume).map(([month, count]) => ({
                  name: month,
                  applications: count,
                }))}
              >
                <XAxis dataKey="name" tickFormatter={(month) => {
                  const date = new Date(`${month}-01`);
                  return date.toLocaleString('en-US', { month: 'short' });
                }} />
                <YAxis
                  domain={[0, 'auto']}
                  tickCount={4}
                />
                <Tooltip
                  formatter={(value) => `${value} applications`}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar
                  dataKey="applications"
                  radius={[4, 4, 0, 0]}
                  fill="url(#grad1)"
                />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-8">No monthly data available</p>
        )}
      </div>

    </MainLayout >
    // </div >
  );
}

export default Dashboard;