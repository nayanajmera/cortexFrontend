import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import CortexLogo from "../components/CortexLogo";
import Button from "../components/Button";

export default function Register(){
    const { register, token, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (token && !loading) {
            navigate("/dashboard");
        }
    }, [token, loading, navigate]);

    const { name, username, email, password, confirmPassword } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const result = await register(name, username, email, password);
            if (result.success) {
                navigate("/dashboard", {replace: true});
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-stone-50 py-12 px-4 sm:px-6lg:px-8">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-stone-200">
                <div className="flex flex-col items-center justify-center text-center">
                    <CortexLogo size="large" />
                    <p className="text-stone-500 mt-4">Start building your second brain</p>
                </div>
                
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg text-center">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-stone-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 mt-1 border border-stone-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="John Doe"
                            maxLength={50}
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-stone-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 mt-1 border border-stone-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="johndoe123"
                            maxLength={30}
                            minLength={3}
                        />
                    </div>


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
                            maxLength={100}
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
                            minLength={6}
                            maxLength={30}
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-stone-700">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 mt-1 border border-stone-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="••••••••"
                            minLength={6}
                            maxLength={30}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        isLoading={isLoading}
                        loadingText="Signing up..."
                    >
                        Create Account
                    </Button>
                </form>

                <p className="text-sm text-center text-stone-600">
                    Already have an account? <Link to="/login" className="font-medium text-black underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};