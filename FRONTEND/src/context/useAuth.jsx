import { createContext, useContext, useEffect, useState } from "react";
import { set } from "react-hook-form";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);  
    const [role, setRole] = useState(null);
    const [error, setError] = useState(null);
     const [loading, setLoading] = useState(true);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setRole(parsedUser.role);
        }
        setLoading(false);
    }, []);

    async function login(email, password) {
        setError(null);

        try {
            const res = await fetch("http://localhost:5000/api/student/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();
            console.log(result)

            if (!res.ok) {
                throw new Error(result.message || "Login failed");
            }

            const userData = result.data;

            setUser(userData);
            setRole(userData.role);

            localStorage.setItem("user", JSON.stringify(userData));

            return true;
        } catch (err) {
            setError(err.message);
            setUser(null);
            setRole(null);
            return false;
        }
    }

    function logout() {
        setUser(null);
        setRole(null);
        localStorage.removeItem("user");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                error,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};