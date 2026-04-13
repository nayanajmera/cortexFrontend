import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import CortexLogo from "../components/CortexLogo";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const { login, token, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (result.success) {
            navigate("/dashboard", { replace: true });
        } else {
            setError(result.error);
        }
    };
    useEffect(() => {
        if (token && !loading) {
            navigate("/dashboard");
        }
    }, [token, loading, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-stone-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-stone-200">
                <div className="flex justify-center mb-8">
                    <CortexLogo size="large" />
                </div>
                <p className="text-center text-stone-500">Access your second brain</p>
                
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 mt-1 border border-stone-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 mt-1 border border-stone-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-bold text-white bg-black rounded-lg hover:bg-stone-800 transition duration-200"
                        disabled={isLoading}
                    >
                        {isLoading?"Logging in ...":"Login"}
                    </button>
                </form>
                <p className="text-sm text-center text-stone-600">
                    Don't have an account? <Link to="/register" className="font-medium text-black underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;