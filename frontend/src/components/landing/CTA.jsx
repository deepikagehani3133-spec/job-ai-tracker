import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function CTA() {
    const { isAuthenticated } = useAuth();
    return (
        <section className="py-28">
            <div className="max-w-5xl mx-auto px-6">
                <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-700 p-16 text-center">
                    <h2 className="text-5xl font-bold mb-6">
                        Ready to Land Your Dream Job?
                    </h2>
                    <p className="text-xl text-zinc-200 mb-10">
                        Join thousands of job seekers preparing smarter with AI.
                    </p>
                    <Link
                        to={isAuthenticated ? "/dashboard" : "/register"}
                        className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition"
                    >
                        {isAuthenticated ? "Open Dashboard" : "Get Started Free"}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default CTA;
