'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Edit, Trash2, Search, Filter, RefreshCw, 
  CheckCircle2, XCircle, AlertCircle, ShoppingBag, DollarSign,
  Tag, Shield, Image as ImageIcon, Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';
import CloudinaryImageUpload from '@/components/last-dance/CloudinaryImageUpload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SERVICE_CATEGORIES = [
  'Makeup Artist',
  'Nail Tech',
  'Merchandise',
  'Hair & Styling',
  'Photography',
  'Other'
];

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Makeup Artist',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
    totalPriceKES: 1500,
    depositAmountKES: 50,
    stockOrSlots: -1,
    providerName: '',
    providerContact: '',
    internalNotes: '',
    featured: false,
    isActive: true
  });

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/admin/all`, getAuthHeader());
      if (res.data?.success) {
        setServices(res.data.services || []);
      }
    } catch (err) {
      console.error('Error fetching admin services:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to fetch services. Make sure you are logged in.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'Makeup Artist',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
      totalPriceKES: 1500,
      depositAmountKES: 50,
      stockOrSlots: -1,
      providerName: '',
      providerContact: '',
      internalNotes: '',
      featured: false,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      category: service.category || 'Makeup Artist',
      description: service.description || '',
      imageUrl: service.imageUrl || '',
      totalPriceKES: service.totalPriceKES || 0,
      depositAmountKES: service.depositAmountKES !== undefined ? service.depositAmountKES : 50,
      stockOrSlots: service.stockOrSlots !== undefined ? service.stockOrSlots : -1,
      providerName: service.providerName || '',
      providerContact: service.providerContact || '',
      internalNotes: service.internalNotes || '',
      featured: !!service.featured,
      isActive: service.isActive !== undefined ? service.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Service title is required.');
      return;
    }
    if (Number(formData.depositAmountKES) > Number(formData.totalPriceKES)) {
      alert('Upfront deposit cannot be greater than the total price.');
      return;
    }

    setSaving(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      if (editingService) {
        await axios.put(
          `${API_BASE_URL}/last-dance/services/admin/${editingService._id}`,
          formData,
          getAuthHeader()
        );
        setFeedbackMsg({ type: 'success', text: `"${formData.title}" updated successfully!` });
      } else {
        await axios.post(
          `${API_BASE_URL}/last-dance/services/admin/create`,
          formData,
          getAuthHeader()
        );
        setFeedbackMsg({ type: 'success', text: `"${formData.title}" created successfully!` });
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Save service error:', err);
      alert(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.title}"?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/last-dance/services/admin/${service._id}`, getAuthHeader());
      setFeedbackMsg({ type: 'success', text: `Deleted "${service.title}".` });
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await axios.put(
        `${API_BASE_URL}/last-dance/services/admin/${service._id}`,
        { isActive: !service.isActive },
        getAuthHeader()
      );
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: !s.isActive } : s));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Filtered List
  const filteredServices = services.filter(service => {
    const matchesCat = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.providerName && service.providerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-black/[0.08] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Services &amp; Merchandise Catalog</h1>
            <span className="bg-[#762e99]/10 text-[#762e99] text-xs font-bold px-2.5 py-1 rounded-full">
              {services.length} Total Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure services (Makeup, Nails, Hair), merchandise, total prices, and custom upfront deposit booking fees.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#762e99]' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#762e99]/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {feedbackMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          feedbackMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg({ type: '', text: '' })} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === 'All'
                ? 'bg-[#5e2590] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({services.length})
          </button>
          {SERVICE_CATEGORIES.map(cat => {
            const count = services.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#5e2590] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service title or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#762e99]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-[#762e99] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold">Loading catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.08]">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Services Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? `No items matched "${searchQuery}".` : 'Start by adding your first service or merchandise item.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center space-x-2 text-xs font-bold text-[#762e99] bg-[#762e99]/10 hover:bg-[#762e99]/20 px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map(service => (
            <div
              key={service._id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                service.isActive ? 'border-black/[0.08] hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Card Image Banner */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80'}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#5e2590] px-2.5 py-1 rounded-lg shadow-xs">
                    {service.category}
                  </span>
                  {service.featured && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-1 rounded-lg shadow-xs flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(service)}
                    title={service.isActive ? 'Active (Click to Hide)' : 'Hidden (Click to Make Active)'}
                    className={`p-1.5 rounded-lg backdrop-blur-md text-xs font-bold shadow-xs transition ${
                      service.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-white'
                    }`}
                  >
                    {service.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {service.description || 'No description provided.'}
                  </p>
                </div>

                {/* Pricing & Deposit Configuration Display */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Full Price:</span>
                    <span className="font-black text-slate-900 text-sm">
                      KES {Number(service.totalPriceKES).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-purple-50/80 px-2.5 py-1.5 rounded-xl border border-purple-100">
                    <span className="text-[#5e2590] font-bold">Upfront Deposit:</span>
                    <span className="font-extrabold text-[#762e99]">
                      KES {Number(service.depositAmountKES).toLocaleString()}
                    </span>
                  </div>

                  {/* Private Admin Info Pill (clearly tagged) */}
                  <div className="bg-slate-100/80 p-2 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold truncate max-w-[150px]">
                        {service.providerName || 'Unassigned Provider'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic">Internal only</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#762e99] hover:bg-purple-50 transition"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Service Modal with Cloudinary Integration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-black/[0.08]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingService ? 'Edit Service / Merchandise' : 'Create New Service / Merchandise'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure pricing, upfront deposit fee, and Cloudinary photo.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5 text-xs">
              {/* Service Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Service / Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glam Graduation Red-Carpet Makeup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99] bg-white"
                  >
                    {SERVICE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Slots / Stock (-1 for unlimited)</label>
                  <input
                    type="number"
                    value={formData.stockOrSlots}
                    onChange={(e) => setFormData({ ...formData, stockOrSlots: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                  />
                </div>
              </div>

              {/* Pricing & Configurable Upfront Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Total Full Price (KES) *
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">Total amount the client ultimately pays.</p>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1500"
                    value={formData.totalPriceKES}
                    onChange={(e) => setFormData({ ...formData, totalPriceKES: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#762e99] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5e2590] mb-1">
                    Upfront Deposit Amount (KES) *
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">Prompted to client immediately upon booking.</p>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    value={formData.depositAmountKES}
                    onChange={(e) => setFormData({ ...formData, depositAmountKES: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs font-black text-[#5e2590] focus:outline-none focus:border-[#762e99] bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detail what is included, package benefits, style choices, sizing..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                />
              </div>

              {/* Cloudinary Image Upload Component */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Service / Product Photo (Cloudinary Upload)
                </label>
                <CloudinaryImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="last_dance_services"
                  label="Upload Item Image (Cloudinary)"
                />
              </div>

              {/* Internal Admin & Vendor Contact Section (NOT exposed on public UI) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <Shield className="w-4 h-4 text-[#762e99]" />
                  <span className="font-extrabold text-xs">Internal Admin &amp; Vendor Notes</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-md">
                    Hidden from Client UI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Default Provider Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Makeup Studio"
                      value={formData.providerName}
                      onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Provider Phone / Contact</label>
                    <input
                      type="text"
                      placeholder="e.g. 0712345678"
                      value={formData.providerContact}
                      onChange={(e) => setFormData({ ...formData, providerContact: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Internal Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Specialist requires 30 mins notice before client arrival."
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#762e99] focus:ring-[#762e99]"
                  />
                  <span className="font-bold text-slate-700 text-xs">Active on Marketplace</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-[#762e99] focus:ring-[#762e99]"
                  />
                  <span className="font-bold text-slate-700 text-xs">Mark as Featured / Top Pick</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white font-black shadow-md shadow-[#762e99]/20 transition flex items-center space-x-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingService ? 'Update Item' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
