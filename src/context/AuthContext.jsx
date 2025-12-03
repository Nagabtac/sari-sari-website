import { createContext, useState, useContext } from 'react';

// Create a Context for authentication
// This allows us to share login state across all components
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize token state from localStorage, if available
    const [token, setToken] = useState(localStorage.getItem("token"));

    // Function to handle login
    function login(newToken) {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    }

    // Function to handle logout
    function logout() {
        setToken(null);
        localStorage.removeItem("token");
    }

    // Data provided to consumer components
    const authData = { token, login, logout };

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to consume the AuthContext easily
export function useAuth() {
    return useContext(AuthContext);
}