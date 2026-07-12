import {
    FaUserPlus,
    FaBriefcase,
    FaRobot,
    FaCheckCircle,
} from "react-icons/fa";

const steps = [
    {
        icon: <FaUserPlus />,
        title: "Create Account",
        desc: "Register and securely login."
    },
    {
        icon: <FaBriefcase />,
        title: "Track Jobs",
        desc: "Add and manage job applications."
    },
    {
        icon: <FaRobot />,
        title: "AI Interview Prep",
        desc: "Generate interview questions instantly."
    },
    {
        icon: <FaCheckCircle />,
        title: "Get Hired",
        desc: "Crack interviews with confidence."
    },
];

function HowItWorks() {
    return (
        <section id="how-it-works" className="py-28 bg-zinc-900">

            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-5xl font-bold text-center mb-16">
                    How It Works
                </h2>

                <div className="grid md:grid-cols-4 gap-8">

                    {steps.map((step, index) => (

                        <div
                            key={index}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center hover:border-violet-500 transition"
                        >

                            <div className="text-5xl text-violet-400 mb-6 flex justify-center">
                                {step.icon}
                            </div>

                            <h3 className="text-2xl font-semibold mb-4">
                                {index + 1}. {step.title}
                            </h3>

                            <p className="text-zinc-400">
                                {step.desc}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default HowItWorks;