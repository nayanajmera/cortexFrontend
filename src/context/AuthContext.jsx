import { createContext, useState, useEffect } from "react";
import api from "../utils/api"; 
import setAuthToken from "../utils/setAuthToken"; 
import {redirect} from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);


    const loadUser = async () => {
        try {
            const res = await api.get("/auth");
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };


    const login = async (email, password) => {
        const body = JSON.stringify({ email, password });

        try {
            const res = await api.post("/auth/login", body);
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
            loadUser();
            return { success: true };
        } catch (err) {
            console.error(err.response?.data?.errors);
            return { success: false, error: err.response?.data?.msg || "Login failed" };
        }
    };


    const register = async (name, username, email, password) => {
         const body = JSON.stringify({ name, username, email, password });

         try {
             const res = await api.post("/auth/register", body);
             localStorage.setItem("token", res.data.token);
             setToken(res.data.token);
             loadUser();
             return { success: true };
         } catch (err) {
             return { success: false, error: err.response?.data?.msg || "Registration failed" };
         }
    };


    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            setAuthToken(localStorage.token); 
            loadUser();
        } else {
            setLoading(false); 
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};