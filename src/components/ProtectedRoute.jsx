import React from 'react'
import { Navigate } from "react-router-dom"; // Assuming Navigate is imported from react-router-dom
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({children}) => {
    const { token } = useAuth(); // Destructuring the token from the authentication context

    if(!token){
        // If no token exists, redirect the user to the login page.
        return <Navigate to="/login" replace />;
    }
    
    // If a token exists, render the child components (the protected content).
    return children;
}

export default ProtectedRoute;