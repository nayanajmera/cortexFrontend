import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Button from "../components/Button";

export default function EditDump(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags: "",
        isPrivate: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDump = async () => {
            try {
                const res = await api.get(`/dumps/${id}`);
                const dump = res.data;

                setFormData({
                    title: dump.title || "", 
                    content: dump.content || "",
                    tags: dump.tags ? dump.tags.join(", ") : "",
                    isPrivate: dump.isPrivate
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dump:", err);
                setError("Could not load this dump. It might have been deleted.");
                setLoading(false);
            }
        };
        fetchDump();
    }, [id]);

    const onChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const formattedTags = formData.tags
                .split(",")
                .map(tag => tag.trim())
                .filter(tag => tag !== "");
            
            await api.put(`/dumps/${id}`, {
                title: formData.title,
                content: formData.content,
                tags: formattedTags,
                isPrivate: formData.isPrivate
            });
            
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.msg || "Error updating dump");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#FDFCF8]">
            <div className="animate-pulse text-stone-400">Loading thought...</div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#FDFCF8] space-y-4">
            <div className="text-red-500 font-medium">{error}</div>
            <button 
                onClick={() => navigate(-1)}
                className="text-black underline hover:text-stone-600"
            >
                Return to previous page
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCF8] py-10 px-4 flex justify-center">
            <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
                

                <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
                    <h1 className="text-xl font-bold text-stone-800">Edit Mode</h1>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-sm font-medium text-stone-500 hover:text-black transition flex items-center gap-2"
                    >
                        Cancel & Return
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            Title ({formData.title.length}/100)
                        </label>
                        <input
                            type="text"
                            name="title"
                            maxLength={100}
                            value={formData.title}
                            onChange={onChange}
                            className="w-full text-2xl font-bold text-stone-800 border-b-2 border-transparent focus:border-black outline-none placeholder-stone-300 transition-colors"
                            placeholder="Untitled Thought"
                        />
                    </div>


                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            Content ({formData.content.length}/16000)
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={onChange}
                            maxLength={16000}
                            required
                            className="w-full h-[400px] p-4 text-lg leading-relaxed text-stone-700 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none font-sans"
                            placeholder="Start writing..."
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black placeholder-stone-400"
                                placeholder="ideas, work, urgent..."
                            />
                            <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
                        </div>


                        <div className="flex items-center justify-start md:justify-end pt-6">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={onChange}
                                    className="w-5 h-5 text-black border-stone-300 rounded focus:ring-black cursor-pointer"
                                />
                                <span className="ml-3 text-stone-600 group-hover:text-black transition">
                                    Keep this note <strong>Private</strong>
                                </span>
                            </label>
                        </div>
                    </div>


                    <div className="flex justify-end pt-6 border-t border-stone-100 mt-6">
                        <Button
                            type="submit"
                            className="px-8"
                            isLoading={saving}
                            loadingText="Saving Changes..."
                        >
                            Update Thought
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};