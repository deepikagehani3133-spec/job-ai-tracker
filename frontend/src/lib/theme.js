/**
 * Tailwind utility maps for the JobStatus enum — kept in one place
 * so every surface (tables, cards, badges) renders consistently.
 */
export const STATUS_BADGES = {
    Applied: "bg-blue-500/20 text-blue-400",
    Interview: "bg-yellow-500/20 text-yellow-400",
    Offer: "bg-emerald-500/20 text-emerald-400",
    Rejected: "bg-red-500/20 text-red-400",
    Withdrawn: "bg-zinc-500/20 text-zinc-400",
};

export const STATUS_LABELS = {
    Applied: "Applied",
    Interview: "Interview",
    Offer: "Offer",
    Rejected: "Rejected",
    Withdrawn: "Withdrawn",
};

export const CHART_PALETTE = [
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#a78bfa", // purple
    "#22d3ee", // sky
];

export const DATE_FORMAT = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
};

export const DATETIME_FORMAT = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
};

export const SALARY_FORMAT = (min, max, currency = "$") => {
    if (!min && !max) return "—";
    if (min && max) return `${currency}${min.toLocaleString()}–${currency}${max.toLocaleString()}`;
    return `${currency}${(min || max).toLocaleString()}`;
};
