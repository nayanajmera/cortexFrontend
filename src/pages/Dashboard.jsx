import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Search, X, Tag, Type, MessageSquare, Users } from "lucide-react";
import toast from "react-hot-toast";
import CortexLogo from "../components/CortexLogo";
import ConfirmModal from "../components/ConfirmModal";
import Button from "../components/Button";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [dumps, setDumps] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags: ""
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [dumpToDelete, setDumpToDelete] = useState(null);
    const navigate = useNavigate();

    // 1. Fetch Dumps
    useEffect(() => {
        fetchDumps();
    }, []);

    const fetchDumps = async () => {
        setLoading(true);
        try {
            const res = await api.get("/dumps");
            setDumps(res.data);
            setIsSearching(false);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching dumps:", err);
            setLoading(false);
        }
    };

    // 2. Search
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await api.get(`/dumps/search?query=${searchQuery}`);
            setDumps(res.data);
            setIsSearching(true);
            setLoading(false);
        } catch (err) {
            console.error("Error searching:", err);
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        fetchDumps();
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleAddDump = async (e) => {
        e.preventDefault();
        const { title, content, tags } = formData;

        if (!content.trim()) return;

        if (title.length > 100) {
            return toast.error("Title is too long (Max 100 chars).");
        }

        const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== "");
        if (tagArray.length > 10) {
            return toast.error("You can only add up to 10 tags.");
        }

        const longTags = tagArray.filter(t => t.length > 20);
        if (longTags.length > 0) {
            return toast.error(`Tags must be short. These are too long: ${longTags.join(", ")}`);
        }

        setIsSaving(true);
        try {
            const res = await api.post("/dumps", {
                title: title.trim() || "Untitled Thought",
                content: content,
                tags: tagArray
            });

            if (!isSearching) {
                setDumps([res.data, ...dumps]);
            }

            setFormData({ title: "", content: "", tags: "" });
            toast.success("Thought saved!");

        } catch (err) {
            console.error("Error adding dump:", err);
            toast.error("Failed to save dump. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRequest = (e, id) => {
        e.stopPropagation();
        setDumpToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!dumpToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/dumps/${dumpToDelete}`);
            setDumps(dumps.filter(dump => dump._id !== dumpToDelete));
            toast.success("Thought deleted");
            setDeleteModalOpen(false);
            setDumpToDelete(null);
        } catch (err) {
            console.error("Error deleting dump:", err);
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A]">

            <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <CortexLogo />
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {/* HIVES BUTTON */}
                    <button
                        onClick={() => navigate('/hives')}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold rounded-lg transition"
                    >
                        <Users size={16} />
                        <span className="hidden sm:inline">Hives</span>
                    </button>
                    <button
                        onClick={() => navigate('/chat')}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold rounded-lg transition"
                    >
                        <MessageSquare size={16} />
                        <span className="hidden sm:inline">Ask AI</span>
                    </button>
                    
                    {/* Divider */}
                    <div className="h-6 w-px bg-stone-200 mx-1"></div>
                    
                    {/* Profile Bubble */}
                    <div
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group p-1"
                        title="Profile & Settings"
                    >
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm group-hover:ring-2 ring-stone-200 transition-all">
                            {user && (user.name ? user.name.charAt(0).toUpperCase() : "U")}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-10 p-6">

                {/* --- SEARCH BAR --- */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your brain..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none shadow-sm"
                        />
                        {isSearching && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-4 top-3.5 text-stone-400 hover:text-black"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </form>
                </div>

                {/* --- CAPTURE CARD (New Form) --- */}
                {!isSearching && (
                    <div className="mb-12 bg-white border border-stone-200 rounded-2xl shadow-sm p-6 relative group focus-within:ring-2 focus-within:ring-stone-200 transition-all">
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Capture Thought</h2>

                        <form onSubmit={handleAddDump} className="space-y-3">
                            {/* Title Input */}
                            <div className="flex items-center gap-3 border-b border-stone-100 pb-2">
                                <Type size={18} className="text-stone-400" />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={onChange}
                                    maxLength={100}
                                    placeholder="Title (Optional)"
                                    className="w-full font-bold text-stone-800 outline-none placeholder-stone-300"
                                />
                                <span className="text-xs text-stone-300">{formData.title.length}/100</span>
                            </div>

                            {/* Content Textarea */}
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={onChange}
                                maxLength={16000}
                                placeholder="What's on your mind?"
                                className="w-full h-24 text-lg bg-transparent outline-none resize-none placeholder-stone-300"
                            />

                            {/* Footer: Tags & Save Button */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 flex-1 mr-4">
                                    <Tag size={18} className="text-stone-400" />
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={onChange}
                                        placeholder="Tags (comma separated)..."
                                        className="w-full text-sm text-stone-600 outline-none placeholder-stone-300"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="px-6"
                                    isLoading={isSaving}
                                    loadingText="Saving..."
                                >
                                    <Plus size={16} /> Save
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        {isSearching
                            ? (dumps.length > 0 && dumps[0].isFallback ? `Found ${dumps.length} Keyword Matches` : `Found ${dumps.length} Results`)
                            : "Recent Dumps"}
                    </h3>

                    {isSearching && dumps.length > 0 && dumps[0].isFallback && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                            No exact semantic matches found. Falling back to keyword search.
                        </div>
                    )}

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-xl"></div>)}
                        </div>
                    ) : dumps.length === 0 ? (
                        <div className="text-center py-10 text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                            <p>{isSearching ? "No matching thoughts found." : "Your brain is empty."}</p>
                        </div>
                    ) : (dumps.map((dump) => {
                        const dumpUserId = typeof dump.user === 'string' ? dump.user : dump.user._id;
                        const isOwner = user && dumpUserId === user._id;

                        return (
                            <div
                                key={dump._id}
                                onClick={() => isOwner && navigate(`/dump/edit/${dump._id}`)}
                                className={`group p-6 bg-white border border-stone-200 rounded-xl shadow-sm relative transition-all 
                                        ${isOwner ? "cursor-pointer hover:shadow-md hover:border-black" : "cursor-default opacity-90"}
                                    `}
                            >
                                {dump.group && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                                        <span className="text-purple-600 bg-purple-50 px-1 rounded">
                                            {dump.group.name}
                                        </span>
                                        <span>•</span>
                                        <span className={isOwner ? "text-stone-800" : "text-blue-600"}>
                                            {isOwner ? "You" : (dump.user.username || "Teammate")}
                                        </span>
                                    </div>
                                )}

        
                                <h3 className={`text-xl font-bold mb-1 transition-colors ${isOwner ? "text-stone-800 group-hover:text-blue-600" : "text-stone-600"
                                    }`}>
                                    {dump.title || "Untitled Thought"}
                                </h3>

                                <p className="text-stone-500 truncate mb-4 pr-10">
                                    {dump.content}
                                </p>

                
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-stone-400">
                                            {new Date(dump.createdAt).toLocaleDateString()}
                                        </span>

                        
                                        <div className="flex gap-2">
                                            {dump.tags && dump.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500 font-medium">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>


                                    {isOwner && (
                                        <button
                                            onClick={(e) => handleDeleteRequest(e, dump._id)}
                                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                    )}
                </div>

            </main>

            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Delete Thought"
                message="Are you sure you want to delete this thought? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Keep It"
                isDanger={true}
                isLoading={isDeleting}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setDumpToDelete(null);
                }}
            />
        </div>
    );
};