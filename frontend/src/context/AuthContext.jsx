import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

/**
 * AuthContext — single source of truth for the current user and token.
 *
 * Exposes:
 *  - user: the current user object, or null if signed out
 *  - token: the active Sanctum token
 *  - loading: true until we've attempted to hydrate from localStorage / /me
 *  - login(email, password): POST /login, persist token, fetch /me
 *  - register(payload): POST /register, persist token, fetch /me
 *  - logout(): POST /logout, clear local state
 *  - logoutAll(): POST /logout-all, clear local state
 *  - updateProfile(payload): PUT /profile
 *  - changePassword(payload): PUT /change-password
 *  - deleteAccount(password): DELETE /account
 *  - refreshUser(): re-fetch the user from the API
 */

const AuthContext = createContext(null);

function readStoredUser() {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

    // Persist a small, non-sensitive user blob to localStorage for fast UI hydration.
    // The truth still comes from the server — see refreshUser() below.
    const persistUser = useCallback((u) => {
        if (u) {
            localStorage.setItem("user", JSON.stringify(u));
        } else {
            localStorage.removeItem("user");
        }
    }, []);

    const persistToken = useCallback((t) => {
        if (t) {
            localStorage.setItem("token", t);
        } else {
            localStorage.removeItem("token");
        }
    }, []);

    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        persistUser(null);
        persistToken(null);
    }, [persistToken, persistUser]);

    // Hydrate from localStorage immediately, then verify with the server.
    useEffect(() => {
        const verify = async () => {
            if (!token) {
                return;
            }
            try {
                const { data } = await api.get("/me");
                setUser(data.user);
                persistUser(data.user);
            } catch {
                // /me failed (interceptor already cleared token on 401)
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Auth actions ---

    const login = useCallback(
        async (email, password) => {
            const { data } = await api.post("/login", { email, password });
            persistToken(data.token);
            persistUser(data.user);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        },
        [persistToken, persistUser]
    );

    const register = useCallback(
        async (payload) => {
            const { data } = await api.post("/register", payload);
            persistToken(data.token);
            persistUser(data.user);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        },
        [persistToken, persistUser]
    );

    const logout = useCallback(async () => {
        try {
            await api.post("/logout");
        } catch {
            // Even if the server call fails, clear local state
        } finally {
            clearAuth();
        }
    }, [clearAuth]);

    const logoutAll = useCallback(async () => {
        try {
            await api.post("/logout-all");
        } catch {
            // ignore
        } finally {
            clearAuth();
        }
    }, [clearAuth]);

    const updateProfile = useCallback(
        async (payload) => {
            const { data } = await api.put("/profile", payload);
            setUser(data.user);
            persistUser(data.user);
            return data.user;
        },
        [persistUser]
    );

    const changePassword = useCallback(
        async (payload) => {
            await api.put("/change-password", payload);
        },
        []
    );

    const deleteAccount = useCallback(
        async (password) => {
            await api.delete("/account", { data: { password } });
            clearAuth();
        },
        [clearAuth]
    );

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get("/me");
            setUser(data.user);
            persistUser(data.user);
        } catch {
            // handled by interceptor
        }
    }, [persistUser]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        deleteAccount,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an <AuthProvider>.");
    }
    return ctx;
}
