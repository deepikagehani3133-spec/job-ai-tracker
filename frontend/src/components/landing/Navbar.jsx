import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar, Button } from "../ui";
import { FaSignOutAlt } from "react-icons/fa";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-violet-400">
                    Job AI Tracker
                </Link>

                <div className="hidden md:flex items-center gap-10 text-zinc-300">
                    <a href="#features" className="hover:text-violet-400 transition">
                        Features
                    </a>
                    <a href="#how-it-works" className="hover:text-violet-400 transition">
                        How It Works
                    </a>
                    <a href="#contact" className="hover:text-violet-400 transition">
                        Contact
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-xl border border-zinc-700 hover:border-violet-500 transition text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 hover:opacity-80 transition"
                            >
                                <Avatar name={user?.name} size="sm" />
                            </Link>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-xl border border-zinc-700 hover:border-violet-500 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 transition font-medium"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
