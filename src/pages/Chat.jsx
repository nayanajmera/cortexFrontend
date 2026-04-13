import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Bot, User, FileText } from "lucide-react"; 
import CortexLogo from "../components/CortexLogo";

const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: "ai", content: "Hello! I am Cortex. Ask me anything about your notes." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/chat", { message: userMsg.content });
            
            const aiMsg = { 
                role: "ai", 
                content: res.data.answer,
                sources: res.data.sources
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble accessing your brain right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#FDFCF8]">

            <div className="flex items-center px-6 py-4 bg-white border-b border-stone-200 shadow-sm">
                <button onClick={() => navigate("/dashboard")} className="p-2 mr-4 rounded-full hover:bg-stone-100 transition">
                    <ArrowLeft size={20} className="text-stone-600" />
                </button>
                <div className="flex items-center gap-3">
                    <CortexLogo />
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full uppercase tracking-wider relative top-[-6px]">Chat Beta</span>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === "ai" ? "bg-black text-white" : "bg-stone-200 text-stone-600"
                        }`}>
                            {msg.role === "ai" ? <Bot size={16} /> : <User size={16} />}
                        </div>


                        <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            

                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                msg.role === "user" 
                                    ? "bg-black text-white rounded-tr-none" 
                                    : "bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm"
                            }`}>
                                {msg.content}
                            </div>


                            {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 space-y-2 w-full">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.slice(0, 3).map((source, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => navigate(`/dump/edit/${source.id}`)}
                                                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-2 rounded-lg text-xs cursor-pointer transition border border-stone-200"
                                            >
                                                <FileText size={12} />
                                                <span className="truncate max-w-[150px] italic">
                                                    "{source.content}"
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                ))}
                

                <div ref={messagesEndRef} />
            </div>


            <div className="p-4 bg-white border-t border-stone-200">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your brain a question..."
                        className="flex-1 p-4 pr-12 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-inner"
                        disabled={loading}
                    />
                    <button 
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;