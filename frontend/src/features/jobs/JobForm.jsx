import { useState } from "react";
import { useJobsMeta } from "./hooks";
import { Input, Select, Textarea } from "../../components/ui";

const empty = {
    company: "",
    role: "",
    status: "Applied",
    notes: "",
    salary_min: "",
    salary_max: "",
    location: "",
    source_url: "",
    contact_name: "",
    contact_email: "",
    applied_at: "",
    interview_at: "",
};

function initialForm(job) {
    if (!job) return { ...empty };

    return {
        ...empty,
        ...Object.fromEntries(Object.entries(job).map(([key, value]) => [key, value ?? ""])),
        salary_min: job.salary_min ?? "",
        salary_max: job.salary_max ?? "",
        applied_at: job.applied_at ?? "",
        interview_at: job.interview_at ? job.interview_at.slice(0, 16) : "",
    };
}

/**
 * JobForm — used for both create and edit. Controlled form, validation
 * mirrors the backend's StoreJobRequest / UpdateJobRequest.
 */
export default function JobForm({ initial = null, onSubmit, submitting, onCancel }) {
    const statuses = useJobsMeta();
    const [form, setForm] = useState(() => initialForm(initial));
    const [errors, setErrors] = useState({});

    const set = (key) => (e) => {
        const val = e?.target ? e.target.value : e;
        setForm((f) => ({ ...f, [key]: val }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
    };

    const submit = async (e) => {
        e.preventDefault();
        // Strip empties so PATCH semantics work.
        const payload = Object.fromEntries(
            Object.entries(form).filter(([, value]) => value !== "" && value !== null)
        );
        if (payload.salary_min) payload.salary_min = Number(payload.salary_min);
        if (payload.salary_max) payload.salary_max = Number(payload.salary_max);
        try {
            await onSubmit(payload);
        } catch (err) {
            if (err.fieldErrors) setErrors(err.fieldErrors);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="grid md:grid-cols-2 gap-5">
                <Input
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={set("company")}
                    error={errors.company?.[0]}
                    required
                    placeholder="Acme Corp"
                />
                <Input
                    label="Role"
                    name="role"
                    value={form.role}
                    onChange={set("role")}
                    error={errors.role?.[0]}
                    required
                    placeholder="Senior Laravel Developer"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <Select
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={set("status")}
                    error={errors.status?.[0]}
                    options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                />
                <Input
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={set("location")}
                    error={errors.location?.[0]}
                    placeholder="Remote / Bangalore / NYC"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <Input
                    type="number"
                    label="Salary min"
                    name="salary_min"
                    value={form.salary_min}
                    onChange={set("salary_min")}
                    error={errors.salary_min?.[0]}
                    placeholder="80000"
                />
                <Input
                    type="number"
                    label="Salary max"
                    name="salary_max"
                    value={form.salary_max}
                    onChange={set("salary_max")}
                    error={errors.salary_max?.[0]}
                    placeholder="120000"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <Input
                    label="Source URL"
                    name="source_url"
                    type="url"
                    value={form.source_url}
                    onChange={set("source_url")}
                    error={errors.source_url?.[0]}
                    placeholder="https://..."
                />
                <Input
                    type="date"
                    label="Applied on"
                    name="applied_at"
                    value={form.applied_at}
                    onChange={set("applied_at")}
                    error={errors.applied_at?.[0]}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <Input
                    label="Contact name"
                    name="contact_name"
                    value={form.contact_name}
                    onChange={set("contact_name")}
                    error={errors.contact_name?.[0]}
                />
                <Input
                    label="Contact email"
                    name="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={set("contact_email")}
                    error={errors.contact_email?.[0]}
                />
            </div>

            <Input
                type="datetime-local"
                label="Interview at"
                name="interview_at"
                value={form.interview_at}
                onChange={set("interview_at")}
                error={errors.interview_at?.[0]}
            />

            <Textarea
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={set("notes")}
                error={errors.notes?.[0]}
                rows={4}
                placeholder="Anything worth remembering about this application..."
            />

            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50 font-semibold"
                >
                    {submitting ? "Saving..." : initial ? "Save changes" : "Add job"}
                </button>
            </div>
        </form>
    );
}
