import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Hash, ArrowRight, ArrowLeft, Hexagon } from "lucide-react"; 
import toast from "react-hot-toast";
import GlobalLoader from "../components/GlobalLoader";
import CortexLogo from "../components/CortexLogo";

import Button from "../components/Button";

const Hives = () => {
    const navigate = useNavigate();
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    

    const [newHiveName, setNewHiveName] = useState("");
    const [joinCode, setJoinCode] = useState("");


    useEffect(() => {
        const fetchHives = async () => {
            try {
                const res = await api.get("/groups");
                setHives(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching hives:", err);
                setLoading(false);
            }
        };
        fetchHives();
    }, []);


    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await api.post("/groups", { name: newHiveName });
            setHives([res.data, ...hives]);
            setNewHiveName("");
            setShowCreate(false);
            toast.success(`Hive Created! Your Join Code is: ${res.data.joinCode}`, { duration: 5000 });
        } catch (err) {
            toast.error(err.response?.data?.msg || "Error creating hive");
        } finally {
            setIsCreating(false);
        }
    };


    const handleJoin = async (e) => {
        e.preventDefault();
        setIsJoining(true);
        try {
            const res = await api.post("/groups/join", { joinCode });
            setHives([res.data, ...hives]);
            setJoinCode("");
            setShowJoin(false);
            toast.success("Joined successfully!");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Invalid Code or Already Joined");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] p-6">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm mb-10">
                <div 
                    className="cursor-pointer hover:opacity-80 transition"
                    onClick={() => navigate('/dashboard')}
                >
                    <CortexLogo />
                </div>
            </nav>

            {/* Header */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 bg-white rounded-full border border-stone-200 hover:bg-stone-50 hidden sm:block shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">My Hives 🐝</h1>
                        <p className="text-stone-500 text-sm">Collaborate with your network</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button 
                        onClick={() => { setShowCreate(true); setShowJoin(false); }}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-black text-white font-bold text-sm rounded-lg hover:bg-stone-800 transition shadow-sm"
                    >
                        <Plus size={16} /> Create
                    </button>
                    <button 
                        onClick={() => { setShowJoin(true); setShowCreate(false); }}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white text-stone-800 font-bold text-sm border border-stone-300 rounded-lg hover:bg-stone-50 transition"
                    >
                        <Hash size={16} /> Join
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto">
                

                {showCreate && (
                    <div className="mb-8 p-6 bg-white border border-stone-200 rounded-xl shadow-lg animate-fade-in-down">
                        <h3 className="font-bold mb-3">Name your new Hive</h3>
                        <form onSubmit={handleCreate} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newHiveName}
                                onChange={(e) => setNewHiveName(e.target.value)}
                                placeholder="e.g. 'Project Alpha'"
                                className="flex-1 p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                            <Button 
                                type="submit" 
                                isLoading={isCreating} 
                                loadingText="Creating..."
                                className="px-6"
                            >
                                Create
                            </Button>
                        </form>
                    </div>
                )}

                {showJoin && (
                    <div className="mb-8 p-6 bg-white border border-stone-200 rounded-xl shadow-lg animate-fade-in-down">
                        <h3 className="font-bold mb-3">Enter Invite Code</h3>
                        <form onSubmit={handleJoin} className="flex gap-2">
                            <input 
                                type="text" 
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="e.g. 'A1B2C3'"
                                className="flex-1 p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-black uppercase tracking-widest font-mono"
                                required
                            />
                            <Button 
                                type="submit" 
                                isLoading={isJoining} 
                                loadingText="Joining..."
                                className="px-6"
                            >
                                Join
                            </Button>
                        </form>
                    </div>
                )}


                {loading ? (
                    <div className="mt-10"><GlobalLoader fullScreen={false} message="Loading Hives..." /></div>
                ) : hives.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                        <Users size={48} className="mx-auto text-stone-300 mb-4" />
                        <h3 className="text-lg font-bold text-stone-600">You haven't joined any Hives yet.</h3>
                        <p className="text-stone-400">Create one or ask a friend for a code!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hives.map(hive => (
                            <div 
                                key={hive._id}
                                onClick={() => navigate(`/hive/${hive._id}`)} // <--- Navigate to Feed
                                className="group p-6 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md hover:border-black cursor-pointer transition-all relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-xl">
                                        {hive.name.charAt(0)}
                                    </div>
                                    <ArrowRight className="text-stone-300 group-hover:text-black transition" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-800">{hive.name}</h3>
                                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                                    <span>Code: <span className="font-mono font-bold select-all">{hive.joinCode}</span></span>
                                    <span>{hive.members.length} Members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Hives;