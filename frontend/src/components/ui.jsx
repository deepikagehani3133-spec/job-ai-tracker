/**
 * Reusable UI primitives for Job AI Tracker.
 * Centralized so every page looks consistent and so we can re-theme in one place.
 */
import { useId, useState } from "react";
import { FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// --- Card ---
export function Card({ children, className = "" }) {
    return (
        <div
            className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${className}`}
        >
            {children}
        </div>
    );
}

// --- Button (3 variants) ---
export function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    ...rest
}) {
    const base =
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed";
    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-3",
        lg: "px-6 py-3.5 text-lg",
    };
    const variants = {
        primary:
            "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30",
        secondary:
            "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
        danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400",
        ghost: "text-zinc-400 hover:text-white",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            {...rest}
        >
            {loading && (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}

// --- Input (label + input + error) ---
export function Input({
    label,
    error,
    hint,
    className = "",
    id,
    rightIcon,
    type = "text",
    ...rest
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-zinc-300 mb-2"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type={type}
                    className={`w-full bg-zinc-950 border ${
                        error ? "border-red-500" : "border-zinc-800"
                    } rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition ${
                        rightIcon ? "pr-12" : ""
                    } ${className}`}
                    {...rest}
                />
                {rightIcon && (
                    <button
                        type="button"
                        onClick={rightIcon.onClick}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 hover:text-white"
                    >
                        {rightIcon.icon}
                    </button>
                )}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            {hint && !error && (
                <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
            )}
        </div>
    );
}

// --- PasswordInput (toggles visibility) ---
export function PasswordInput({ label, error, hint, ...rest }) {
    const [show, setShow] = useState(false);
    return (
        <Input
            label={label}
            type={show ? "text" : "password"}
            error={error}
            hint={hint}
            autoComplete="current-password"
            rightIcon={{
                icon: show ? <FaEyeSlash /> : <FaEye />,
                onClick: () => setShow((s) => !s),
            }}
            {...rest}
        />
    );
}

// --- Select (label + select + error) ---
export function Select({
    label,
    error,
    hint,
    options = [],
    className = "",
    id,
    ...rest
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-zinc-300 mb-2"
                >
                    {label}
                </label>
            )}
            <select
                id={inputId}
                className={`w-full bg-zinc-950 border ${
                    error ? "border-red-500" : "border-zinc-800"
                } rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition ${className}`}
                {...rest}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            {hint && !error && (
                <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
            )}
        </div>
    );
}

// --- Textarea ---
export function Textarea({
    label,
    error,
    hint,
    className = "",
    id,
    ...rest
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-zinc-300 mb-2"
                >
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                className={`w-full bg-zinc-950 border ${
                    error ? "border-red-500" : "border-zinc-800"
                } rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition resize-none ${className}`}
                {...rest}
            />
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            {hint && !error && (
                <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
            )}
        </div>
    );
}

// --- Spinner ---
export function Spinner({ size = "md" }) {
    const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
    return (
        <div
            className={`${sizes[size]} border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin`}
        />
    );
}

// --- FullPageLoader ---
export function FullPageLoader({ message = "Loading..." }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
            <Spinner size="lg" />
            <p className="text-zinc-400">{message}</p>
        </div>
    );
}

// --- Avatar (uses initials if no avatar URL) ---
export function Avatar({ name, size = "md", className = "", src }) {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-24 h-24 text-3xl",
    };
    const initials = (name || "U")
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size]} ${className} rounded-full object-cover border-2 border-violet-500/30`}
            />
        );
    }
    return (
        <div
            className={`${sizes[size]} ${className} rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold border-2 border-violet-500/30`}
        >
            {initials}
        </div>
    );
}

// --- Modal (headless, no portal dependency) ---
export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
                className={`bg-zinc-900 border border-zinc-800 rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-2xl leading-none"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// --- ConfirmDialog ---
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    confirmVariant = "danger",
    loading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <p className="text-zinc-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} loading={loading} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}

// --- Badge ---
export function Badge({ children, className = "" }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
        >
            {children}
        </span>
    );
}

// --- EmptyState ---
export function EmptyState({ title = "Nothing here yet", description, icon, action }) {
    return (
        <div className="text-center py-12 px-6">
            {icon && <div className="text-4xl text-zinc-600 mb-3">{icon}</div>}
            <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
            {description && (
                <p className="text-zinc-500 mt-2 max-w-md mx-auto">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

// --- Pagination ---
export function Pagination({ currentPage, lastPage, onChange, total }) {
    if (!lastPage || lastPage <= 1) return null;
    const prev = () => onChange(Math.max(1, currentPage - 1));
    const next = () => onChange(Math.min(lastPage, currentPage + 1));
    return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
            <span className="text-sm text-zinc-500">
                {total !== undefined && `Total: ${total}`}
            </span>
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={prev} disabled={currentPage <= 1}>
                    <FaChevronLeft /> Prev
                </Button>
                <span className="text-sm text-zinc-400 px-2">
                    Page {currentPage} of {lastPage}
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={next}
                    disabled={currentPage >= lastPage}
                >
                    Next <FaChevronRight />
                </Button>
            </div>
        </div>
    );
}
