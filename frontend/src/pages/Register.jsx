import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Button, Input, PasswordInput } from "../components/ui";

/**
 * Compute a simple 0..4 strength score based on length and character classes.
 * Used only for UI feedback — the real validation happens on the server.
 */
function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    // Cap at 4 for display
    const display = Math.min(score, 4);
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
    return { score: display, label: labels[display], color: colors[display] };
}

function Register() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

    if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
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
            const user = await register(form);
            toast.success(`Welcome, ${user.name}! Your account is ready 🎉`);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
            } else {
                setServerError(err.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 mb-4 shadow-lg shadow-violet-900/50">
                        <span className="text-2xl font-bold">JT</span>
                    </div>
                    <h1 className="text-3xl font-bold">Create your account</h1>
                    <p className="text-zinc-400 mt-2">Start tracking your job search today</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {serverError && (
                        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <Input
                            label="Full name"
                            name="name"
                            type="text"
                            placeholder="Jane Doe"
                            value={form.name}
                            onChange={handleChange}
                            error={errors.name?.[0]}
                            autoComplete="name"
                            required
                        />
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

                        <div>
                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="At least 8 characters"
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password?.[0]}
                                autoComplete="new-password"
                                required
                            />
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${
                                                    i <= strength.score
                                                        ? strength.color
                                                        : "bg-zinc-800"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Strength:{" "}
                                        <span className="text-zinc-300">
                                            {strength.label}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <PasswordInput
                            label="Confirm password"
                            name="password_confirmation"
                            placeholder="Re-enter your password"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            error={errors.password_confirmation?.[0]}
                            autoComplete="new-password"
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

                    <p className="text-center text-zinc-400 mt-6 text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
