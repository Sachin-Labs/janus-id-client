import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const { data } = await api.get("/admin/me");
                    const u = data.user;
                    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
                    const user = { name, email: u.email };
                    localStorage.setItem("user", JSON.stringify(user));
                    setUser(user);
                    return;
                } catch (e) {
                    console.error("Failed to fetch profile", e);
                }
                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                if (storedUser && !storedUser.name && storedUser.email) {
                    storedUser.name = storedUser.email;
                    localStorage.setItem("user", JSON.stringify(storedUser));
                }
                setUser(storedUser || { role: "admin" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post("/auth/admin-login", { email, password });
        localStorage.setItem("accessToken", data.accessToken);
        const name = [data.user?.firstName, data.user?.lastName].filter(Boolean).join(" ").trim();
        const user = { name: name || email, email };
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Logout failed on server", e);
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
