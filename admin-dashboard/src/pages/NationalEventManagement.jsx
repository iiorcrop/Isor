import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';
import { uploadToStorageServer } from '../utils/fileUploader';
import { Plus, Trash2, Edit, Calendar, MapPin, Save, Loader2, Tag, Check, X, Layers, PlusCircle, Trash, DollarSign, Users } from 'lucide-react';

const DEFAULT_FIELDS = [
    { label: 'Full Name', name: 'Name', fieldType: 'text', required: true, options: [] },
    { label: 'Email Address', name: 'Email', fieldType: 'email', required: true, options: [] },
    { label: 'Mobile / Phone Number', name: 'Phone', fieldType: 'phone', required: true, options: [] },
    { label: 'Designation', name: 'Designation', fieldType: 'text', required: false, options: [] },
    { label: 'Organization / Institute', name: 'Organization', fieldType: 'text', required: false, options: [] }
];

const NationalEventManagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '', eventDate: '', location: '', description: '', isFree: false, price: 0, isActive: true
    });
    const [customFields, setCustomFields] = useState(DEFAULT_FIELDS);
    const [bannerFile, setBannerFile] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/national-events`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddField = () => {
        setCustomFields([
            ...customFields,
            { label: '', name: '', fieldType: 'text', required: true, options: [] }
        ]);
    };

    const handleRemoveField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index, key, value) => {
        const updated = [...customFields];
        updated[index][key] = value;
        if (key === 'label') {
            updated[index].name = value;
        }
        setCustomFields(updated);
    };

    const handleOptionChange = (fieldIndex, optionsString) => {
        const updated = [...customFields];
        updated[fieldIndex].options = optionsString.split(',').map(s => s.trim()).filter(Boolean);
        setCustomFields(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let bannerImage = editing ? editing.bannerImage : '';
            if (bannerFile) {
                bannerImage = await uploadToStorageServer(bannerFile);
            }

            const payload = {
                title: formData.title,
                eventDate: formData.eventDate,
                location: formData.location || '',
                description: formData.description || '',
                isFree: formData.isFree,
                price: formData.isFree ? 0 : formData.price,
                isActive: formData.isActive,
                customFields: customFields,
                bannerImage: bannerImage
            };

            if (editing) {
                await axios.patch(`${import.meta.env.VITE_API_URL}/national-events/${editing._id}`, payload);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/national-events`, payload);
            }
            fetchEvents();
            setShowForm(false);
            setEditing(null);
            resetForm();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', eventDate: '', location: '', description: '', isFree: false, price: 0, isActive: true });
        setCustomFields(DEFAULT_FIELDS);
        setBannerFile(null);
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Delete this event? All registrations associated with it may remain archived.')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/national-events/${id}`);
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">National Events Management</h2>
                    <p className="text-white/40 text-sm">Create events, set prices, and build custom registration form fields.</p>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus size={20} /> Create New Event
                </button>
            </div>

            {showForm && (
                <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl border border-white/10 space-y-8 animate-in fade-in">
                    <h3 className="text-xl font-bold text-white pb-4 border-b border-white/10">
                        {editing ? 'Edit National Event' : 'Create National Event & Registration Form'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Event Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Title *</label>
                                <input 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., National Conference on Sustainable Agriculture 2026"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Date *</label>
                                <input 
                                    required
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={formData.eventDate ? formData.eventDate.split('T')[0] : ''}
                                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location / Venue</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., ICAR-IIOR, Rajendranagar, Hyderabad"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Banner Image</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary"
                                    onChange={e => setBannerFile(e.target.files[0])}
                                />
                            </div>
                        </div>

                        {/* Pricing Details */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={14} /> Pricing & Registration Fees
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10">
                                    <input 
                                        type="checkbox"
                                        checked={formData.isFree}
                                        onChange={e => setFormData({ ...formData, isFree: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-white">Free Registration</p>
                                        <p className="text-[10px] text-white/40">No payment screenshot required from applicants</p>
                                    </div>
                                </label>

                                {!formData.isFree && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Registration Fee (INR ₹) *</label>
                                        <input 
                                            type="number"
                                            required={!formData.isFree}
                                            min="0"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary font-mono font-bold"
                                            placeholder="500"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Description</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                placeholder="Summary of event objectives, topics, and schedule..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Custom Form Fields Builder */}
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Layers size={18} className="text-primary" /> Registration Form Fields Builder
                                    </h4>
                                    <p className="text-xs text-white/40">Customize input fields that users will fill out during registration.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAddField}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                                >
                                    <PlusCircle size={16} /> Add Custom Field
                                </button>
                            </div>

                            <div className="space-y-4">
                                {customFields.map((field, idx) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        <div className="md:col-span-4">
                                            <input 
                                                required
                                                placeholder="Field Label (e.g. T-Shirt Size)"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white"
                                                value={field.label}
                                                onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <select 
                                                className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-3 text-xs text-white"
                                                value={field.fieldType}
                                                onChange={e => handleFieldChange(idx, 'fieldType', e.target.value)}
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="email">Email</option>
                                                <option value="phone">Phone / Mobile</option>
                                                <option value="number">Number</option>
                                                <option value="select">Dropdown Select</option>
                                                <option value="textarea">Textarea Block</option>
                                            </select>
                                        </div>

                                        {field.fieldType === 'select' ? (
                                            <div className="md:col-span-3">
                                                <input 
                                                    placeholder="Options (comma separated)"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white"
                                                    value={(field.options || []).join(', ')}
                                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="md:col-span-3 flex items-center gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60">
                                                    <input 
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={e => handleFieldChange(idx, 'required', e.target.checked)}
                                                        className="rounded border-white/10 bg-white/5 text-primary"
                                                    />
                                                    Required
                                                </label>
                                            </div>
                                        )}

                                        <div className="md:col-span-2 flex justify-end">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveField(idx)}
                                                className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                                title="Remove field"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-4 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {editing ? 'Update National Event' : 'Publish National Event'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List of National Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                    <div key={event._id} className="bg-[#1e293b] rounded-[2rem] p-8 shadow-2xl border border-white/5 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {event.isFree ? 'FREE' : `PRICE: ₹${event.price}`}
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold ${event.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {event.isActive ? 'ACTIVE' : 'CLOSED'}
                                </span>
                            </div>

                            <h4 className="text-xl font-bold text-white leading-snug">{event.title}</h4>

                            <div className="flex flex-wrap gap-4 text-white/40 text-xs">
                                <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.eventDate).toLocaleDateString()}</div>
                                {event.location && <div className="flex items-center gap-1"><MapPin size={14} /> {event.location}</div>}
                            </div>

                            <p className="text-white/60 text-sm line-clamp-2">{event.description}</p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex gap-2 flex-wrap">
                            <button 
                                onClick={() => navigate(`/event-registrations?eventId=${event._id}`)}
                                className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <Users size={16} /> List Registrations
                            </button>
                            <button 
                                onClick={() => {
                                    setEditing(event);
                                    setFormData(event);
                                    setCustomFields(event.customFields || DEFAULT_FIELDS);
                                    setShowForm(true);
                                }}
                                className="bg-white/5 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <Edit size={16} /> Edit Event
                            </button>
                            <button 
                                onClick={() => deleteEvent(event._id)}
                                className="bg-error/10 text-error p-3 rounded-xl hover:bg-error hover:text-white transition-all"
                                title="Delete Event"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && !loading && (
                <div className="text-center py-20 bg-[#1e293b] rounded-[3rem] border border-white/5">
                    <Calendar size={64} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No national events created yet. Click above to create one.</p>
                </div>
            )}
        </div>
    );
};

export default NationalEventManagement;
