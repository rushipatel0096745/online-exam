import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null)

export const AuthProvider = function({children}) {

    const [user, setUser] = useState({email: '', full_name: '', role: ''})


    return (
        <AuthContext.Provider value={}>
            {children}
        </AuthContext.Provider>
    )

}

