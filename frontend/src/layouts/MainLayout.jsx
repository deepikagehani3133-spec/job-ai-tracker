import { FaBriefcase, FaUserTie, FaChartBar } from "react-icons/fa";

function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 p-5 border-r border-zinc-800">
        <h1 className="text-2xl font-bold mb-10 text-violet-400">
          Job AI Tracker
        </h1>

        <ul className="space-y-6">
          <li className="flex items-center gap-3 hover:text-violet-400 cursor-pointer transition">
            <FaChartBar />
            Dashboard
          </li>

          <li className="flex items-center gap-3 hover:text-violet-400 cursor-pointer transition">
            <FaBriefcase />
            Jobs
          </li>

          <li className="flex items-center gap-3 hover:text-violet-400 cursor-pointer transition">
            <FaUserTie />
            Interview Prep
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}

export default MainLayout;