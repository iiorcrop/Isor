import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, 
    Plus, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    Menu as MenuIcon,
    Loader2,
    CheckCircle,
    Link as LinkIcon,
    Layers
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const MenuSettings = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/menu');
            setMenuItems(res.data.items);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch menu', err);
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setMenuItems([...menuItems, { label: 'New Item', link: '#', isDropdown: false, children: [] }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...menuItems];
        newItems.splice(index, 1);
        setMenuItems(newItems);
    };

    const handleAddChild = (parentIndex) => {
        const newItems = [...menuItems];
        if (!newItems[parentIndex].children) newItems[parentIndex].children = [];
        newItems[parentIndex].children.push({ label: 'New Sub-item', link: '#' });
        newItems[parentIndex].isDropdown = true;
        setMenuItems(newItems);
    };

    const handleRemoveChild = (parentIndex, childIndex) => {
        const newItems = [...menuItems];
        newItems[parentIndex].children.splice(childIndex, 1);
        if (newItems[parentIndex].children.length === 0) {
            newItems[parentIndex].isDropdown = false;
        }
        setMenuItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...menuItems];
        newItems[index][field] = value;
        setMenuItems(newItems);
    };

    const handleChildChange = (parentIndex, childIndex, field, value) => {
        const newItems = [...menuItems];
        newItems[parentIndex].children[childIndex][field] = value;
        setMenuItems(newItems);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await axios.post('http://localhost:5000/api/menu', { items: menuItems });
            setMessage('Menu updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Failed to save menu', err);
            setMessage('Error saving menu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Navigation Menu</h1>
                    <p className="text-text-muted mt-1">Manage your website's main navigation links and dropdowns.</p>
                </div>
                <div className="flex gap-4 items-center">
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-success/10 text-success px-4 py-2 rounded-xl flex items-center gap-2 border border-success/20"
                        >
                            <CheckCircle size={18} />
                            {message}
                        </motion.div>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="space-y-4">
                <Reorder.Group axis="y" values={menuItems} onReorder={setMenuItems} className="space-y-4">
                    {menuItems.map((item, index) => (
                        <Reorder.Item 
                            key={index} 
                            value={item}
                            className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg cursor-grab active:cursor-grabbing text-white/40">
                                    <MenuIcon size={20} />
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-1">Label</label>
                                        <input 
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-1">Link</label>
                                        <div className="relative">
                                            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={item.link}
                                                onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 md:pt-0">
                                    <button 
                                        onClick={() => handleAddChild(index)}
                                        title="Add Sub-menu"
                                        className="p-2.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Sub-items (Dropdown) */}
                            {item.children && item.children.length > 0 && (
                                <div className="mt-6 ml-12 space-y-3 border-l-2 border-white/5 pl-6 pb-2">
                                    {item.children.map((child, childIndex) => (
                                        <div key={childIndex} className="flex items-center gap-3">
                                            <input 
                                                type="text"
                                                placeholder="Sub-menu Label"
                                                value={child.label}
                                                onChange={(e) => handleChildChange(index, childIndex, 'label', e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-accent"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Sub-menu Link"
                                                value={child.link}
                                                onChange={(e) => handleChildChange(index, childIndex, 'link', e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white/60 focus:outline-none focus:border-accent"
                                            />
                                            <button 
                                                onClick={() => handleRemoveChild(index, childIndex)}
                                                className="text-white/20 hover:text-danger transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <button 
                    onClick={handleAddItem}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/40 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold"
                >
                    <Plus size={20} />
                    Add New Menu Item
                </button>
            </div>
        </div>
    );
};

export default MenuSettings;
