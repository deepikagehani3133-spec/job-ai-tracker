import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import {
    Avatar,
    Button,
    Card,
    Input,
    PasswordInput,
    Modal,
} from "../components/ui";
import {
    FaUser,
    FaLock,
    FaCalendar,
    FaTrash,
} from "react-icons/fa";

function Profile() {
    const { user, updateProfile, changePassword, deleteAccount, logoutAll } =
        useAuth();

    // --- Profile edit state ---
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [profileLoading, setProfileLoading] = useState(false);

    // --- Stats from the API ---
    const [stats, setStats] = useState({ totalJobs: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    // --- Password change modal ---
    const [pwOpen, setPwOpen] = useState(false);
    const [pwForm, setPwForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [pwErrors, setPwErrors] = useState({});
    const [pwLoading, setPwLoading] = useState(false);

    // --- Delete account modal ---
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { data } = await api.get("/jobs");
                setStats({ totalJobs: data.meta?.total ?? 0 });
            } catch {
                // Non-critical — keep zero
            } finally {
                setStatsLoading(false);
            }
        };
        loadStats();
    }, []);

    // --- Handlers ---

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((p) => ({ ...p, [name]: value }));
        if (profileErrors[name]) setProfileErrors((er) => ({ ...er, [name]: null }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileErrors({});
        try {
            await updateProfile(profile);
            toast.success("Profile updated! ✨");
        } catch (err) {
            if (err.fieldErrors) {
                setProfileErrors(err.fieldErrors);
            } else {
                toast.error(err.message || "Could not update profile.");
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPwForm((f) => ({ ...f, [name]: value }));
        if (pwErrors[name]) setPwErrors((er) => ({ ...er, [name]: null }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwLoading(true);
        setPwErrors({});
        try {
            await changePassword(pwForm);
            toast.success("Password changed successfully 🔐");
            setPwForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            setPwOpen(false);
        } catch (err) {
            if (err.fieldErrors) {
                setPwErrors(err.fieldErrors);
            } else {
                toast.error(err.message || "Could not change password.");
            }
        } finally {
            setPwLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setDeleteLoading(true);
        setDeleteError("");
        try {
            await deleteAccount(deletePassword);
            toast.success("Account deleted. We're sorry to see you go.");
        } catch (err) {
            if (err.fieldErrors?.password?.[0]) {
                setDeleteError(err.fieldErrors.password[0]);
            } else {
                setDeleteError(err.message || "Could not delete account.");
            }
            setDeleteLoading(false);
        }
    };

    if (!user) return null;

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Unknown";

    return (
        <MainLayout>
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-zinc-400 mb-8">Manage your account information and security.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Profile card with avatar + stats */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar name={user.name} size="xl" />
                        </div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-zinc-400 text-sm mt-1">{user.email}</p>

                        {user.bio ? (
                            <p className="text-zinc-300 text-sm mt-4 italic">"{user.bio}"</p>
                        ) : (
                            <p className="text-zinc-500 text-sm mt-4 italic">
                                No bio yet — add one in the form to tell us about yourself.
                            </p>
                        )}

                        <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-left text-sm">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <FaCalendar className="text-violet-400" />
                                <span>Joined {memberSince}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <FaUser className="text-violet-400" />
                                <span className="capitalize">
                                    {user.role?.name || "Member"}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Quick stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl">
                                <span className="text-zinc-400 text-sm">Tracked jobs</span>
                                <span className="text-2xl font-bold text-violet-400">
                                    {statsLoading ? "…" : stats.totalJobs}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT: Edit forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal info */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <FaUser className="text-violet-400" />
                            <h2 className="text-xl font-semibold">Personal information</h2>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
                            <Input
                                label="Full name"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                error={profileErrors.name?.[0]}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                error={profileErrors.email?.[0]}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleProfileChange}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Tell us a little about yourself..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition resize-none"
                                />
                                <div className="flex justify-between mt-1.5 text-xs">
                                    <span className="text-red-400">
                                        {profileErrors.bio?.[0]}
                                    </span>
                                    <span className="text-zinc-500">
                                        {profile.bio.length} / 500
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" loading={profileLoading}>
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Security */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <FaLock className="text-violet-400" />
                            <h2 className="text-xl font-semibold">Security</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl">
                                <div>
                                    <p className="font-medium">Password</p>
                                    <p className="text-sm text-zinc-400">
                                        Last changed:{" "}
                                        {user.updated_at
                                            ? new Date(user.updated_at).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => setPwOpen(true)}
                                >
                                    Change password
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl">
                                <div>
                                    <p className="font-medium">Active sessions</p>
                                    <p className="text-sm text-zinc-400">
                                        Sign out from all other devices
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        const ok = window.confirm(
                                            "Sign out from every device? You will need to log in again here."
                                        );
                                        if (!ok) return;
                                        await logoutAll();
                                        toast.success(
                                            "Signed out from all devices."
                                        );
                                    }}
                                >
                                    Sign out everywhere
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Danger zone */}
                    <Card className="border-red-500/30">
                        <h2 className="text-xl font-semibold text-red-400 mb-2">
                            Danger zone
                        </h2>
                        <p className="text-zinc-400 text-sm mb-6">
                            Once you delete your account, there is no going back. Please be
                            certain.
                        </p>
                        <Button
                            variant="danger"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <FaTrash />
                            Delete my account
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Change password modal */}
            <Modal
                isOpen={pwOpen}
                onClose={() => setPwOpen(false)}
                title="Change password"
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
                    <PasswordInput
                        label="Current password"
                        name="current_password"
                        value={pwForm.current_password}
                        onChange={handlePasswordChange}
                        error={pwErrors.current_password?.[0]}
                        autoComplete="current-password"
                        required
                    />
                    <PasswordInput
                        label="New password"
                        name="password"
                        value={pwForm.password}
                        onChange={handlePasswordChange}
                        error={pwErrors.password?.[0]}
                        autoComplete="new-password"
                        hint="At least 8 characters, different from current"
                        required
                    />
                    <PasswordInput
                        label="Confirm new password"
                        name="password_confirmation"
                        value={pwForm.password_confirmation}
                        onChange={handlePasswordChange}
                        error={pwErrors.password_confirmation?.[0]}
                        autoComplete="new-password"
                        required
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setPwOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={pwLoading}>
                            Update password
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete account modal */}
            <Modal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete account"
            >
                <p className="text-zinc-300 mb-2">
                    This action is permanent. All your data, including tracked jobs, will be
                    removed.
                </p>
                <p className="text-zinc-400 text-sm mb-6">
                    Enter your password to confirm.
                </p>
                <form onSubmit={handleDelete} className="space-y-5" noValidate>
                    <PasswordInput
                        name="password"
                        placeholder="Your password"
                        value={deletePassword}
                        onChange={(e) => {
                            setDeletePassword(e.target.value);
                            if (deleteError) setDeleteError("");
                        }}
                        error={deleteError}
                        autoComplete="current-password"
                        required
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            loading={deleteLoading}
                        >
                            Yes, delete my account
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}

export default Profile;
