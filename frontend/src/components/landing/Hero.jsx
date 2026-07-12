import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    FaArrowRight,
    FaBriefcase,
    FaChartLine,
    FaRobot,
} from "react-icons/fa";

function Hero() {
    const { isAuthenticated } = useAuth();
    // Send logged-in users straight to the app, otherwise to sign-up.
    const primaryCta = isAuthenticated ? "/dashboard" : "/register";
    const secondaryCta = isAuthenticated ? "/jobs" : "/login";
    const primaryLabel = isAuthenticated ? "Go to Dashboard" : "Get Started";
    const secondaryLabel = isAuthenticated ? "View My Jobs" : "Login";

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full -top-20 -left-20"></div>
            <div className="absolute w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full bottom-0 right-0"></div>

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left */}
                <div>
                    <span className="bg-violet-600/20 text-violet-400 px-4 py-2 rounded-full text-sm">
                        🚀 AI Powered Career Platform
                    </span>

                    <h1 className="text-6xl font-extrabold leading-tight mt-6">
                        Track Jobs.
                        <br />
                        <span className="text-violet-400">Crack Interviews.</span>
                        <br />
                        Get Hired.
                    </h1>

                    <p className="text-zinc-400 text-lg mt-8 leading-8">
                        Organize job applications, monitor your progress, generate AI
                        interview questions, and prepare for your dream company — all
                        in one place.
                    </p>

                    <div className="flex gap-5 mt-10">
                        <Link
                            to={primaryCta}
                            className="bg-violet-600 hover:bg-violet-700 transition px-8 py-4 rounded-2xl font-semibold flex items-center gap-2"
                        >
                            {primaryLabel}
                            <FaArrowRight />
                        </Link>

                        <Link
                            to={secondaryCta}
                            className="border border-zinc-700 hover:border-violet-500 transition px-8 py-4 rounded-2xl"
                        >
                            {secondaryLabel}
                        </Link>
                    </div>
                </div>

                {/* Right */}
                <div className="relative">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Dashboard Preview</h2>

                        <div className="space-y-5">
                            <div className="bg-zinc-800 rounded-2xl p-5 flex justify-between">
                                <div className="flex gap-3 items-center">
                                    <FaBriefcase className="text-violet-400" />
                                    Applied Jobs
                                </div>
                                <span className="font-bold text-2xl">18</span>
                            </div>
                            <div className="bg-zinc-800 rounded-2xl p-5 flex justify-between">
                                <div className="flex gap-3 items-center">
                                    <FaChartLine className="text-cyan-400" />
                                    Interviews
                                </div>
                                <span className="font-bold text-2xl">7</span>
                            </div>
                            <div className="bg-zinc-800 rounded-2xl p-5 flex justify-between">
                                <div className="flex gap-3 items-center">
                                    <FaRobot className="text-emerald-400" />
                                    AI Questions
                                </div>
                                <span className="font-bold text-2xl">250+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
