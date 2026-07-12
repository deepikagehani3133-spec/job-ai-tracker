import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FaBriefcase,
    FaUserTie,
    FaChartBar,
    FaBars,
    FaUser,
    FaSignOutAlt,
    FaTimes,
    FaUserShield,
    FaFileAlt,
    FaClipboardList,
    FaUsers,
    FaUserCog,
    FaBell,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Avatar, Modal, Button } from "../components/ui";

function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const isAdmin = user?.role?.slug === "admin";

    // Fetch unread notification count
    const fetchNotificationCount = async () => {
        if (!user) return;
        try {
            const response = await fetch("/api/notifications", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                // Count unread notifications from the data array
                const unreadCount = data.data?.filter(
                    (notification) => !notification.read_at
                ).length || 0;
                setNotificationCount(unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notification count:", error);
        }
    };

    // Fetch notification count on mount and periodically
    useEffect(() => {
        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 60000); // Every minute
        return () => clearInterval(interval);
    }, [user]);

    const baseNavItems = [
        { to: "/dashboard", label: "Dashboard", icon: <FaChartBar /> },
        { to: "/jobs", label: "Jobs", icon: <FaBriefcase /> },
        { to: "/interview-prep", label: "Interview Prep", icon: <FaUserTie /> },
        { to: "/resume-analyzer", label: "Resume Analyzer", icon: <FaFileAlt /> },
        { to: "/answer-evaluator", label: "Answer Evaluator", icon: <FaClipboardList /> },
        { to: "/mock-interview", label: "Mock Interview", icon: <FaUserShield /> },
        ...(isAdmin
            ? [
                {
                    to: "/role",
                    label: "Role Management",
                    icon: <FaUserCog />,
                },
                {
                    to: "/admin",
                    label: "Admin Dashboard",
                    icon: <FaChartBar />,
                },
                {
                    to: "/admin/users",
                    label: "User Management",
                    icon: <FaUsers />,
                },
                {
                    to: "/admin/permissions",
                    label: "Permission Management",
                    icon: <FaUserShield />,
                },
            ]
            : []),
    ];

    const navItems = [
        ...baseNavItems,
        {
            to: "/notifications",
            label: "Notifications",
            icon: <FaBell />,
            badge: notificationCount > 0 ? notificationCount : null,
        },
    ];

    const isActive = (path) => location.pathname === path ||
        (path.startsWith('/admin') && location.pathname.startsWith('/admin'));

    const confirmLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            toast.success("Logged out successfully 👋");
            navigate("/login", { replace: true });
        } catch {
            toast.error("Logout failed. Please try again.");
        } finally {
            setLoggingOut(false);
            setLogoutOpen(false);
        }
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden fixed top-5 left-5 z-50 bg-violet-600 hover:bg-violet-700 p-3 rounded-xl shadow-lg transition"
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div
                className={`
                    fixed md:static top-0 left-0 h-full w-64 bg-zinc-900 p-5 border-r border-zinc-800
                    transform transition-transform duration-300 z-40 flex flex-col
                    ${isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }
                `}
            >
                {/* Brand */}
                <Link
                    to="/dashboard"
                    className="block mb-8"
                    onClick={closeSidebar}
                >
                    <h1 className="text-2xl font-bold text-violet-400">
                        Job AI Tracker
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">
                        Track smarter. Apply better.
                    </p>
                </Link>

                {/* Nav */}
                <ul className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive(item.to)
                                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                                    }`}
                            >
                                <span
                                    className={
                                        isActive(item.to)
                                            ? "text-violet-400"
                                            : "text-zinc-400"
                                    }
                                >
                                    {item.icon}
                                    {item.badge && (
                                        <span className="ml-2 h-5 w-5 flex items-center justify-center bg-red-500 text-xs rounded-full text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* User card + Logout */}
                {user && (
                    <div className="border-t border-zinc-800 pt-4 mt-4 space-y-3">
                        <div className="flex items-center justify-between pb-3">
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/profile"
                                    onClick={closeSidebar}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition group"
                                >
                                    <Avatar name={user.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-white truncate group-hover:text-violet-300">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <FaUser className="text-zinc-500 group-hover:text-violet-400" />
                                </Link>

                                {/* Notifications */}
                                <Link
                                    to="/notifications"
                                    onClick={closeSidebar}
                                    className="relative group"
                                >
                                    <FaBell className="text-zinc-500 group-hover:text-violet-400" />
                                    {/* Notification badge */}
                                    <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ${notificationCount === 0 ? 'hidden' : 'block'}`}>
                                        {notificationCount}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <button
                            onClick={() => setLogoutOpen(true)}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl transition font-medium"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Backdrop on mobile */}
            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}

            {/* Main content */}
            <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
                {children}
            </div>

            {/* Logout confirmation */}
            <Modal
                isOpen={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                title="Log out?"
                maxWidth="max-w-md"
            >
                <p className="text-zinc-300 mb-6">
                    Are you sure you want to end your session? You'll need to sign in
                    again to access your tracked jobs.
                </p>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setLogoutOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        loading={loggingOut}
                        onClick={confirmLogout}
                    >
                        <FaSignOutAlt />
                        Yes, log out
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default MainLayout;