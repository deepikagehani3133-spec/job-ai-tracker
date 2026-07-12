import {
    FaBriefcase,
    FaRobot,
    FaChartBar,
    FaLock,
    FaFileAlt,
    FaBolt,
} from "react-icons/fa";

const features = [
    {
        icon: <FaBriefcase className="text-4xl text-violet-400" />,
        title: "Job Tracking",
        desc: "Track every job application with company, role, status and notes."
    },
    {
        icon: <FaRobot className="text-4xl text-cyan-400" />,
        title: "AI Interview Prep",
        desc: "Generate role-specific interview questions instantly using AI."
    },
    {
        icon: <FaChartBar className="text-4xl text-emerald-400" />,
        title: "Analytics Dashboard",
        desc: "Monitor applications, interviews and overall progress visually."
    },
    {
        icon: <FaLock className="text-4xl text-red-400" />,
        title: "Secure Login",
        desc: "Protected authentication using Laravel Sanctum."
    },
    {
        icon: <FaFileAlt className="text-4xl text-yellow-400" />,
        title: "Resume Ready",
        desc: "Prepare for interviews based on your target role."
    },
    {
        icon: <FaBolt className="text-4xl text-pink-400" />,
        title: "Fast Performance",
        desc: "Built with React + Laravel for a smooth user experience."
    },
];

function Features() {
    return (
        <section
            id="features"
            className="py-28 bg-zinc-950"
        >
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16">

                    <h2 className="text-5xl font-bold">
                        Powerful Features
                    </h2>

                    <p className="text-zinc-400 mt-5 text-lg">
                        Everything you need to manage your job hunt smarter.
                    </p>

                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {features.map((feature, index) => (

                        <div
                            key={index}
                            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-violet-500 hover:-translate-y-2 transition-all duration-300"
                        >

                            <div className="mb-6">
                                {feature.icon}
                            </div>

                            <h3 className="text-2xl font-semibold mb-4">
                                {feature.title}
                            </h3>

                            <p className="text-zinc-400 leading-7">
                                {feature.desc}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
}

export default Features;