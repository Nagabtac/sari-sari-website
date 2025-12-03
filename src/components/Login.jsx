import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/constant";

export default function Login() {
    // useState: Managing form inputs and error state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault(); // Prevents the default form submission reload
        setError("");       // Clear previous errors
        setLoading(true);   // Set loading state

        try {
            // API call to the authentication endpoint
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            // Check if the response was successful
            if (!res.ok) {
                // If not successful (e.g., 401 Unauthorized), throw an error
                throw new Error("Invalid credentials");
            }

            // Parse the JSON response
            const data = await res.json();
            
            // Call the login function from AuthContext to store the token
            login(data.token);
            
            // Navigate the user to the home page
            navigate("/");

        } catch (err) {
            // Catch any network or response errors and display them
            setError(err.message);
        } finally {
            // Always set loading to false, regardless of success or failure
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                
                {/* Login Card */}
                <div className="bg-white p-8 rounded-lg shadow-2xl">
                    
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-auto">
                            {/* SVG for Logo Icon (Incomplete in fragments, using a placeholder) */}
                            <svg className="w-8 h-8 text-white fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11l7 7-7 7-7-7-7-7"/> 
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mt-4">Welcome Back</h2>
                        <p className="text-gray-600 mt-2">Sign in to your account</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v-1a2 2 0 00-2-2h-4a2 2 0 00-2 2v1m4 4v2m0 0v2m0 0a4 4 0 004-4v-2a4 4 0 00-4-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-md shadow-sm text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        {/* Spinning SVG Loading Indicator */}
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        {/* Sign In Icon (Log In) */}
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4h5a2 2 0 002-2v-5a2 2 0 00-2-2h-5" />
                                        </svg>
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Sign-In Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Google Sign-In Button */}
                        <button className="flex items-center justify-center w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.15 30.5 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.44 13.75 17.61 9.5 24 9.5z"/>
                                <path fill="#34A853" d="M46.7 24.5s0-1.87-.16-2.92h-2.11v-1.78h-3.95v1.78h-2.11v2.92h2.11v1.78h3.95v-1.78h2.11c.07-1.14.16-2.92.16-2.92z"/>
                                <path fill="#FBBC05" d="M5.84 31.9a15.91 15.91 0 00-.77 4.54c0 1.58.42 3.11 1.25 4.54l7.98-6.19C13.2 32.54 13.2 32.54 5.84 31.9z"/>
                                <path fill="#EA4335" d="M24 48c6.48 0 11.96-2.13 15.83-5.78l-7.46-5.78c-2.48 1.93-5.69 3.09-9.37 3.09-6.39 0-11.56-4.25-13.4-9.98l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Google</span>
                        </button>

                        {/* Apple/Other Sign-In Button */}
                        <button className="flex items-center justify-center w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.238 2.635 7.85 6.477 9.477.564.103.771-.245.771-.545 0-.27-.01-1.127-.015-2.075-2.565.558-3.111-1.241-3.111-1.241-.419-1.063-1.022-1.348-1.022-1.348-.836-.57.063-.559.063-.559.924.065 1.411.94 1.411.94.82 1.408 2.152 1.002 2.671.764.083-.594.321-1.002.585-1.233-2.046-.232-4.197-1.023-4.197-4.545 0-1.006.357-1.831.937-2.48-.094-.233-.406-1.173.088-2.443 0 0 .764-.249 2.503.935a8.88 8.88 0 012.33-.312c.813-.005 1.626.104 2.33.312 1.74-1.184 2.503-.935 2.503-.935.494 1.27.182 2.21.088 2.443.58.649.937 1.474.937 2.48 0 3.522-2.154 4.308-4.204 4.538.332.28.63.834.63 1.68 0 1.21-.01 2.182-.015 2.48 0 .297.206.65.775.542C19.36 19.85 22 16.237 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">GitHub/Other</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                            Sign up
                        </a>
                    </p>

                </div> 
                
                {/* Footer */}
                <p className="text-center text-sm text-white mt-10">
                    © 2024 MyApp. All rights reserved.
                </p>

            </div>
        </div>
    );
}