import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { 
    User, Mail, Calendar, LogOut, 
    BrainCircuit, Users, ArrowLeft 
} from "lucide-react";
import toast from "react-hot-toast";
import CortexLogo from "../components/CortexLogo";
import Button from "../components/Button";

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({ dumps: 0, hives: 0 });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", username: "", email: "", password: "" });
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/auth/stats");
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const startEdit = () => {
        setEditData({ name: user.name, username: user.username, email: user.email, password: "" });
        setIsEditing(true);
    };
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await api.put("/auth/profile", editData);
            
            // Success Logic
            toast.success("Profile Updated Successfully!");
            setIsEditing(false);
            setTimeout(() => window.location.reload(), 1000); // Give toast time to show
            
        } catch (err) {
            // Display the specific error message from backend
            const errorMessage = err.response?.data?.msg || "Error updating profile";
            toast.error(errorMessage); 
        } finally {
            setIsSaving(false);
        }
    };
    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FDFCF8]">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm mb-10">
                <div 
                    className="cursor-pointer hover:opacity-80 transition"
                    onClick={() => navigate('/dashboard')}
                >
                    <CortexLogo />
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </nav>

            <div className="w-full max-w-2xl mx-auto px-4 pb-12">
                

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    

                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-stone-100 to-white -z-10"></div>


                    <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>


                    <div className="flex-1 text-center md:text-left mt-2">
                        <h1 className="text-2xl font-bold text-stone-800">{user.name}</h1>
                        <p className="text-stone-500 font-medium">@{user.username}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                <Mail size={14} /> {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                <Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>


                    <button 
                        onClick={handleLogout}
                        className="absolute top-6 right-6 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>


                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Thoughts</p>
                            <h2 className="text-3xl font-bold text-stone-800">{loading ? "-" : stats.dumps}</h2>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                            <BrainCircuit size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Active Hives</p>
                            <h2 className="text-3xl font-bold text-stone-800">{loading ? "-" : stats.hives}</h2>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50">
                        <h3 className="font-bold text-stone-700">Account Settings</h3>
                    </div>
                    
                    {!isEditing ? (<button 
                        onClick={startEdit}
                        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <User size={18} className="text-stone-400" />
                            <span className="text-stone-600">Edit Profile & Security</span>
                        </div>
                        <span className="text-blue-600 font-bold text-sm">Edit</span>
                    </button>) : (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-stone-400">Name</label>
                            <input 
                                value={editData.name}
                                onChange={e => setEditData({...editData, name: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                maxLength={50}
                                minLength={1}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-400">Username</label>
                            <input 
                                value={editData.username}
                                onChange={e => setEditData({...editData, username: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                maxLength={30}
                                minLength={3}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-400">New Password (Optional)</label>
                            <input 
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={editData.password}
                                onChange={e => setEditData({...editData, password: e.target.value})}
                                className="w-full border p-2 rounded-lg"
                                minLength={6}
                                maxLength={30}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button 
                                onClick={handleSave} 
                                className="flex-1"
                                isLoading={isSaving}
                                loadingText="Saving..."
                            >
                                Save Changes
                            </Button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                        </div>
                    </div>)}
                </div>

            </div>
        </div>
    );
};

export default Profile;