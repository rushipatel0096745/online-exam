import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = function ({ children }) {
    const [user, setUser] = useState();
    const [role, setRole] = useState(null);
    const [error, setError] = useState(null);

    async function login(email, password) {
        setError(null);

        try {
            const res = await fetch("http://localhost:5000/api/student/login", {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await res.json();
            console.log(result);

            if (!res.ok) {
                throw new Error(result.message);
            }

            const userData = result.data

            setUser(userData);
            setRole(userData.role);
            localStorage.setItem('user', JSON.stringify(result.data))

            return true

        } catch (error) {
            setError(error.message);
            setUser(null);
            console.log("error in logging in", error.message);
            return false;
        }
    }

    return <AuthContext.Provider value={{ user, login, role }}>{children}</AuthContext.Provider>;
};

export const useAuth = function() {
    const context = useContext(AuthContext);
    return context;
}
