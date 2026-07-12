import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Button, Input, PasswordInput } from "../components/ui";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    // If user is already signed in, send them where they were going (or /dashboard)
    if (isAuthenticated) {
        const dest = location.state?.from?.pathname || "/dashboard";
        navigate(dest, { replace: true });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: null }));
        if (serverError) setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setServerError("");

        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}! 👋`);
            const dest = location.state?.from?.pathname || "/dashboard";
            navigate(dest, { replace: true });
        } catch (err) {
            if (err.fieldErrors) {
                
                
                setErrors(err.fieldErrors);
            } else {
                setServerError(err.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 mb-4 shadow-lg shadow-violet-900/50">
                        <span className="text-2xl font-bold">JT</span>
                    </div>
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="text-zinc-400 mt-2">
                        Sign in to track your job applications
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {serverError && (
                        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            error={errors.email?.[0]}
                            autoComplete="email"
                            required
                        />
                        <PasswordInput
                            label="Password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password?.[0]}
                            required
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-violet-600 focus:ring-violet-500"
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                className="text-violet-400 hover:text-violet-300"
                                onClick={() =>
                                    toast("Password reset is coming soon.", {
                                        icon: "ℹ️",
                                    })
                                }
                            >
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <p className="text-center text-zinc-400 mt-6 text-sm">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </div>

                <p className="text-center text-zinc-600 text-xs mt-6">
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

export default Login;
