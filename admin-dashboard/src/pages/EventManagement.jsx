import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';
import { Plus, Trash2, Edit, Calendar, MapPin, ImageIcon, Save, Loader2, X } from 'lucide-react';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', date: '', location: '', description: '', isLatest: true
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        for (let i = 0; i < files.length; i++) {
            data.append('images', files[i]);
        }

        try {
            if (editing) {
                await axios.patch(`${import.meta.env.VITE_API_URL}/events/${editing._id}`, data);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/events`, data);
            }
            fetchEvents();
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', date: '', location: '', description: '', isLatest: true });
            setFiles([]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Delete this event and its gallery?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`);
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Event Management</h2>
                    <p className="text-white/40 text-sm">Manage ISOR events, conferences, and photo galleries.</p>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ title: '', date: '', location: '', description: '', isLatest: true }); setFiles([]); }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> Add New Event
                </button>
            </div>

            {showForm && (
                <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Event' : 'New Event Details'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Title</label>
                                <input 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., Annual General Body Meeting 2024"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Date</label>
                                <input 
                                    required
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={formData.date ? formData.date.split('T')[0] : ''}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., ICAR-IIOR, Hyderabad"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Display Settings</label>
                                <div className="flex items-center gap-4 h-[58px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isLatest} 
                                            onChange={e => setFormData({...formData, isLatest: e.target.checked})}
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-white/60">Show in Latest Events</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Description</label>
                            <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary h-32"
                                placeholder="Brief summary of the event..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gallery Images (Multiple)</label>
                            <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:border-primary/50 transition-all cursor-pointer relative">
                                <input 
                                    type="file" 
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={e => setFiles(e.target.files)}
                                />
                                <ImageIcon size={48} className="mx-auto text-white/10 mb-4" />
                                <p className="text-white/60">Drag & drop or click to upload gallery images</p>
                                <p className="text-white/20 text-xs mt-2">{files.length} files selected</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-4 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {editing ? 'Update Event' : 'Save Event'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                    <div key={event._id} className="bg-[#1e293b] rounded-[2rem] p-8 shadow-2xl border border-white/5 group hover:border-primary/50 transition-all flex gap-6">
                        <div className="w-48 h-48 bg-black/20 rounded-2xl flex-shrink-0 overflow-hidden border border-white/5 relative">
                            {event.images && event.images.length > 0 ? (
                                <img src={getServerUrl(event.images[0])} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={40} className="text-white/5" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-full text-white/80">
                                {event.images?.length || 0} Images
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-bold text-white">{event.title}</h4>
                                    {event.isLatest && <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-full font-bold">LATEST</span>}
                                </div>
                                <div className="flex flex-wrap gap-4 text-white/40 text-xs mb-4">
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-1"><MapPin size={14} /> {event.location}</div>
                                </div>
                                <p className="text-white/60 text-sm line-clamp-2 mb-4">{event.description}</p>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button 
                                    onClick={() => { setEditing(event); setFormData(event); setShowForm(true); }}
                                    className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => deleteEvent(event._id)}
                                    className="bg-error/10 text-error p-3 rounded-xl hover:bg-error hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && !loading && (
                <div className="text-center py-20 bg-[#1e293b] rounded-[3rem] border border-white/5">
                    <Calendar size={64} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No events found. Start by adding one.</p>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
