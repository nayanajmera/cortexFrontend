import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { 
    ArrowLeft, Users, Send, MoreVertical, 
    Trash2, Edit2, Copy, Hash,  Settings, X, UserMinus, LogOut, Loader2
} from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import GlobalLoader from "../components/GlobalLoader";
import { SOCKET_URL } from "../config";

export default function HiveFeed() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [showSettings, setShowSettings] = useState(false);
    const [newName, setNewName] = useState("");
    const bottomRef = useRef(null);

    const [hive, setHive] = useState(null);
    const [dumps, setDumps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: ""
    });

    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    const isCreator = hive && user && hive.creator === user._id;

    const handleRename = async () => {
        setIsRenaming(true);
        try {
            const res = await api.put(`/groups/${hive._id}`, { name: newName });
            setHive({ ...hive, name: res.data.name });
            toast.success("Renamed successfully");
        } catch (err) { toast.error("Error renaming"); }
        finally { setIsRenaming(false); }
    };


    const handleRemoveMember = async (memberId) => {
        setModalConfig({
            isOpen: true,
            title: "Remove Member",
            message: "Are you sure you want to remove this user from the Hive?",
            confirmText: "Remove",
            isDanger: true,
            onConfirm: async () => {
                try {
                    const res = await api.delete(`/groups/${hive._id}/members/${memberId}`);
                    setHive(res.data);
                    toast.success("Member removed");
                } catch (err) { toast.error("Error removing member"); }
                setModalConfig({ isOpen: false });
            }
        });
    };

    const handleDeleteHive = async () => {
        setModalConfig({
            isOpen: true,
            title: "Delete Hive",
            message: "Do you want to KEEP your own notes from this Hive as private dumps after the Hive is destroyed?",
            confirmText: "Keep My Notes",
            cancelText: "Delete EVERYTHING",
            isDanger: true,
            onSecondaryAction: () => triggerFinalDelete(false),
            onConfirm: () => triggerFinalDelete(true)
        });
    };


    const handleLeaveHive = () => {
        setModalConfig({
            isOpen: true,
            title: "Leave Hive",
            message: "Are you sure you want to leave this Hive? The notes you specifically wrote here will be detached and returned to your private Dashboard.",
            confirmText: "Yes, Leave Hive",
            cancelText: "Cancel",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/groups/${hive._id}/leave`);
                    toast.success("Successfully left the Hive. Your notes are now private.");
                    navigate("/hives");
                } catch (err) { 
                    toast.error(err.response?.data?.msg || "Error leaving hive"); 
                }
                setModalConfig({ isOpen: false });
            }
        });
    };

    const triggerFinalDelete = (keepDumps) => {
        setModalConfig({
            isOpen: true,
            title: "Final Confirmation",
            message: "This will permanently destroy the Hive for all members.",
            confirmText: "Destroy Hive",
            requireText: "DELETE",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/groups/${hive._id}?keepDumps=${keepDumps}`);
                    toast.success("Hive destroyed");
                    navigate("/hives");
                } catch (err) { toast.error("Error deleting hive"); }
                setModalConfig({ isOpen: false });
            }
        });
    };


    useEffect(() => {
        const loadData = async () => {
            try {
                const groupsRes = await api.get("/groups");
                const currentHive = groupsRes.data.find(g => g._id === id);
                
                if (!currentHive) {
                    toast.error("Hive not found or access denied.");
                    navigate("/hives");
                    return;
                }
                setHive(currentHive);

                const dumpsRes = await api.get(`/dumps/group/${id}`);
                setDumps(dumpsRes.data.reverse());
                
                setLoading(false);
            } catch (err) {
                console.error("Error loading hive:", err);
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [dumps, loading]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !id || !user) return;

        const socket = io(SOCKET_URL, {
            auth: { token: token },
            transports: ["websocket", "polling"]
        });

        socket.on('connect', () => {
            socket.emit('join_hive', id);
        });

        socket.on('new_dump', (newDump) => {
            setDumps((prevDumps) => {
                // Skip if it came from user (already added via optimistic update)
                const isFromMe = newDump.user._id === user._id;
                if (isFromMe) return prevDumps;
                

                if (prevDumps.some(d => d._id === newDump._id)) return prevDumps;

                return [...prevDumps, newDump];
            });
        });

        socket.on('hive_membership_updated', ({ group }) => {
            if (group && group._id === id) {
                setHive((prevHive) => prevHive ? { ...prevHive, ...group, members: group.members || prevHive.members } : group);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('new_dump');
            socket.off('hive_membership_updated');
            socket.emit('leave_hive', id);
            socket.disconnect();
        };
    }, [id, user]);


    const handlePost = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) return;

        setIsPosting(true);
        try {
            const res = await api.post("/dumps", {
                title: formData.title.trim(),
                content: formData.content,
                group: id   
            });

            const newDump = { 
                ...res.data, 
                user: { _id: user._id, username: user.username, name: user.name } 
            };
            setDumps([...dumps, newDump]);
            setFormData({ title: "", content: "" });

        } catch (err) {
            console.error("Error posting:", err);
            toast.error("Failed to send message");
        } finally {
            setIsPosting(false);
        }
    };


    const handleDelete = async (dumpId) => {
        setModalConfig({
            isOpen: true,
            title: "Delete Message",
            message: "Are you sure you want to delete this message?",
            confirmText: "Delete",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/dumps/${dumpId}`);
                    setDumps(dumps.filter(d => d._id !== dumpId));
                    toast.success("Message deleted");
                } catch (err) {
                    toast.error("Could not delete");
                }
                setModalConfig({ isOpen: false });
            }
        });
    };

    if (loading) return (
        <GlobalLoader fullScreen={false} message="Syncing Hive..." />
    );

    return (
        <div className="flex h-screen bg-[#FDFCF8]">
            
            <div className="flex-1 flex flex-col relative">
                <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/hives")} className="p-2 hover:bg-stone-100 rounded-full transition">
                            <ArrowLeft size={20} className="text-stone-600" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                {hive.name}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <Users size={12} />
                                <span>{hive.members.length} members</span>
                            </div>
                        </div>
                        {isCreator && (
                            <button 
                                onClick={() => { setNewName(hive.name); setShowSettings(true); }}
                                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                            >
                                <Settings size={18} className="text-stone-700" />
                            </button>
                        )}
                        {!isCreator && (
                            <button 
                                onClick={handleLeaveHive}
                                className="p-2 bg-stone-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition text-stone-600"
                                title="Leave Hive"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>

                    <div className="bg-stone-100 px-3 py-1 rounded-lg border border-stone-200 flex items-center gap-2">
                        <Hash size={14} className="text-stone-400" />
                        <span className="font-mono font-bold text-stone-700 tracking-widest">{hive.joinCode}</span>
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#E5E5E5] bg-opacity-30">
                    {dumps.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-sm bg-white inline-block px-4 py-2 rounded-full shadow-sm">
                                No dumps yet. Say hello! 👋
                            </p>
                        </div>
                    ) : (
                        dumps.map((dump) => {
                            const isMe = dump.user._id === user._id;
                            return (
                                <div 
                                    key={dump._id} 
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >

                                    <div className={`max-w-[85%] md:max-w-[70%] min-w-[200px] rounded-xl p-3 shadow-sm relative group transition-all ${
                                        isMe 
                                            ? "bg-black text-white rounded-tr-none" 
                                            : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
                                    }`}>
                                        

                                        {!isMe && (
                                            <p className="text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-wide">
                                                {dump.user.username || "Unknown"}
                                            </p>
                                        )}


                                        {dump.title && dump.title !== "Hive Note" && (
                                            <h4 className={`text-sm font-bold mb-1 ${isMe ? "text-stone-200" : "text-stone-900"}`}>
                                                {dump.title}
                                            </h4>
                                        )}


                                        {isMe && dump.isPrivate && (
                                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full mb-1">
                                                🔒 Only you can see this
                                            </span>
                                        )}


                                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isMe ? "text-stone-100" : "text-stone-700"}`}>
                                            {dump.content}
                                        </p>

                                        <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isMe ? "border-stone-700" : "border-stone-100"}`}>
                                            <span className={`text-[10px] ${isMe ? "text-stone-400" : "text-stone-400"}`}>
                                                {new Date(dump.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {isMe && (
                                                <div className="flex gap-3 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => navigate(`/dump/edit/${dump._id}`)}
                                                        className="text-stone-400 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(dump._id)}
                                                        className="text-stone-400 hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="bg-white border-t border-stone-200 p-4">
                    <form onSubmit={handlePost} className="max-w-4xl mx-auto flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Title (Optional)..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="text-xs font-bold text-stone-600 placeholder-stone-400 outline-none px-2"
                        />
                        
                        <div className="flex gap-2 items-end">
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Type a message..."
                                className="flex-1 bg-stone-100 rounded-xl p-3 outline-none resize-none text-sm text-stone-800 focus:bg-white focus:ring-2 focus:ring-black transition h-12 max-h-32"
                                style={{ minHeight: "48px" }}
                            />
                            <button 
                                type="submit" 
                                disabled={!formData.content.trim() || isPosting}
                                className="p-3 bg-black text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition shadow-md"
                            >
                                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="w-72 bg-white border-l border-stone-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="font-bold text-stone-800">Hive Details</h2>
                    <p className="text-xs text-stone-500">Created {new Date(hive.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                        Members ({hive.members.length})
                    </h3>
                    <div className="space-y-4">
                        {hive.members.map((member, idx) => {

                            const memberName = typeof member === 'object' ? (member.name || member.username) : "User";
                            const memberId = typeof member === 'object' ? member._id : member;

                            return (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        memberId === user._id 
                                            ? "bg-black text-white" 
                                            : "bg-purple-100 text-purple-700"
                                    }`}>
                                        {memberName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-sm ${memberId === user._id ? "font-bold text-black" : "text-stone-600"}`}>
                                        {memberName} {memberId === user._id && "(You)"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-stone-50">
                    <p className="text-xs font-bold text-stone-500 mb-2 uppercase">Invite Code</p>
                    <div 
                        onClick={() => {
                            navigator.clipboard.writeText(hive.joinCode);
                            toast.success("Code copied!");
                        }}
                        className="bg-white border border-stone-200 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-black transition group"
                    >
                        <span className="font-mono font-bold tracking-widest">{hive.joinCode}</span>
                        <Copy size={14} className="text-stone-400 group-hover:text-black" />
                    </div>
                </div>
            </div>

            {showSettings && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Hive Settings</h2>
                        <button onClick={() => setShowSettings(false)}><X /></button>
                    </div>
                    <div className="mb-6">
                        <label className="text-xs font-bold text-stone-400 uppercase">Rename Hive</label>
                        <div className="flex gap-2 mt-2">
                            <input 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 border p-2 rounded-lg"
                            />
                             <button 
                                onClick={handleRename} 
                                disabled={isRenaming}
                                className="bg-black text-white px-4 rounded-lg text-sm disabled:opacity-50 min-w-[60px] flex items-center justify-center"
                            >
                                {isRenaming ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="text-xs font-bold text-stone-400 uppercase">Manage Members</label>
                        <div className="mt-2 max-h-40 overflow-y-auto border border-stone-100 rounded-lg">
                            {hive.members.map(m => (
                                <div key={m._id} className="flex justify-between p-3 border-b border-stone-100 items-center">
                                    <span className="text-sm">{m.username}</span>
                                    {m._id !== user._id && (
                                        <button 
                                            onClick={() => handleRemoveMember(m._id)}
                                            className="text-red-500 text-xs hover:bg-red-50 p-1 rounded"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-6 border-t border-stone-100">
                        <button 
                            onClick={handleDeleteHive}
                            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Delete Hive
                        </button>
                    </div>
                </div>
            </div>
            )}
            <ConfirmModal 
                {...modalConfig} 
                onCancel={() => setModalConfig({ isOpen: false })} 
            />
        </div>
    );
};