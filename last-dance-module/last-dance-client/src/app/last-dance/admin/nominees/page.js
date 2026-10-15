'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, CheckCircle2, Edit, Trash2, Search, Plus, 
  XCircle, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import CloudinaryImageUpload from '@/components/last-dance/CloudinaryImageUpload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  'Mr & Miss Last Dance',
  'Most Likely to Succeed',
  'Best Dressed / Most Stylish',
  'Life of the Party',
  'Power Couple',
  'Campus Icon',
  'Comeback King/Queen',
  'Squad of the Year',
  'Most Missed'
];

export default function AdminNomineesPage() {
  const [candidates, setCandidates] = useState([]);
  const [candidateStats, setCandidateStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'pending' | 'approved'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85',
    category: 'Mr & Miss Last Dance',
    oneLiner: '',
    pitch: '',
    voteCount: 0,
    isApproved: true
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.get(`${API_BASE_URL}/last-dance/admin/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setCandidates(res.data.candidates || []);
        setCandidateStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const showActionMsg = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const handleApprove = async (candidateId, isApproved) => {
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const res = await axios.patch(`${API_BASE_URL}/last-dance/admin/candidates/${candidateId}/approve`, 
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        showActionMsg(`Candidate ${isApproved ? 'Approved' : 'Unapproved'} successfully!`);
        fetchCandidates();
      }
    } catch (err) {
      console.error('Approve candidate error:', err);
    }
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate?')) return;
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const res = await axios.delete(`${API_BASE_URL}/last-dance/admin/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        showActionMsg('Candidate deleted successfully!');
        fetchCandidates();
      }
    } catch (err) {
      console.error('Delete candidate error:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setCandidateForm({
      name: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85',
      category: 'Mr & Miss Last Dance',
      oneLiner: '',
      pitch: '',
      voteCount: 0,
      isApproved: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      name: candidate.name || '',
      photoUrl: candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85',
      category: candidate.category || 'Mr & Miss Last Dance',
      oneLiner: candidate.oneLiner || '',
      pitch: candidate.pitch || '',
      voteCount: candidate.voteCount || 0,
      isApproved: candidate.isApproved !== undefined ? candidate.isApproved : true
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCandidate) {
        const res = await axios.put(`${API_BASE_URL}/last-dance/admin/candidates/${editingCandidate._id}`, candidateForm, { headers });
        if (res.data?.success) {
          showActionMsg('Candidate updated successfully!');
          setIsModalOpen(false);
          fetchCandidates();
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/last-dance/admin/candidates`, candidateForm, { headers });
        if (res.data?.success) {
          showActionMsg('New candidate created successfully!');
          setIsModalOpen(false);
          fetchCandidates();
        }
      }
    } catch (err) {
      console.error('Save candidate error:', err);
      alert(err.response?.data?.message || 'Failed to save candidate.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (statusTab === 'pending' && c.isApproved) return false;
    if (statusTab === 'approved' && !c.isApproved) return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.oneLiner?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#10b981] text-white px-5 py-3 rounded-2xl font-medium text-[13px] flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Candidate Moderation
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            Nominees Control
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Review nominee submissions, manage categories, and approve public profiles
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90 transition self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nominee</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: `All (${candidates.length})` },
              { id: 'pending', label: `Pending (${candidateStats?.pendingCount || 0})` },
              { id: 'approved', label: `Approved (${candidateStats?.approvedCount || 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition whitespace-nowrap ${
                  statusTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-[#f7f7f7] text-black/70 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Category */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-black/40 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name or quote..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-black/15 bg-white pl-9 pr-3 py-2 text-[13px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-black/15 bg-white px-3 py-2 text-[13px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/[0.08] rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-black/40 text-[13px]">
            Loading candidates database...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-16 text-center text-black/40 text-[13px]">
            No nominees match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-black/[0.08] bg-[#fafafa] text-black/50 uppercase text-[10px] font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate Profile</th>
                  <th className="px-6 py-4">Award Category</th>
                  <th className="px-6 py-4">Vote Count</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {filteredCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-black/[0.015] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={c.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                          alt={c.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0 border border-black/10"
                        />
                        <div className="truncate max-w-xs sm:max-w-sm">
                          <p className="font-medium text-black text-[14px] truncate">{c.name}</p>
                          <p className="text-[12px] text-black/50 italic truncate">"{c.oneLiner}"</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#762e99]">
                      {c.category}
                    </td>
                    <td className="px-6 py-4 font-normal text-black font-mono">
                      {(c.voteCount || 0).toLocaleString()} votes
                    </td>
                    <td className="px-6 py-4">
                      {c.isApproved ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ff914d]/10 text-[#ff914d]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="px-3 py-1 rounded-full border border-black/15 text-black hover:bg-black/5 text-[11px] font-medium transition"
                      >
                        Edit
                      </button>
                      {!c.isApproved ? (
                        <button
                          onClick={() => handleApprove(c._id, true)}
                          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(c._id, false)}
                          className="px-3 py-1 rounded-full bg-[#ff914d] hover:bg-[#ea580c] text-white text-[11px] font-medium transition"
                        >
                          Unapprove
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="px-2 py-1 rounded-full text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-black/[0.08] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl my-8 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div>
                <h3 className="text-[20px] font-normal text-black">
                  {editingCandidate ? 'Edit Nominee Profile' : 'Add New Candidate'}
                </h3>
                <p className="text-[12px] text-black/50 mt-0.5">
                  Update candidate credentials and portrait photo
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/10 text-black/70 flex items-center justify-center transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-[13px]">
              
              {/* Cloudinary Image Upload */}
              <div className="p-4 bg-[#fafafa] border border-black/[0.08] rounded-2xl">
                <CloudinaryImageUpload
                  value={candidateForm.photoUrl}
                  onChange={(url) => setCandidateForm(prev => ({ ...prev, photoUrl: url }))}
                  folder="last_dance_candidates"
                  label="Candidate Portrait Photo"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                  Candidate / Duo Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandre & Sophia"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-black/15 bg-white px-3.5 py-2.5 text-[14px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                  Award Category *
                </label>
                <select
                  value={candidateForm.category}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-black/15 bg-white px-3.5 py-2.5 text-[14px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                  One-Liner Catchphrase * (Max 120 chars)
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. The duo that stole everyone's hearts on campus!"
                  value={candidateForm.oneLiner}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, oneLiner: e.target.value }))}
                  className="w-full border border-black/15 bg-white px-3.5 py-2.5 text-[14px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                  Pitch Description *
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={1000}
                  placeholder="Tell voters why this candidate deserves the trophy..."
                  value={candidateForm.pitch}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, pitch: e.target.value }))}
                  className="w-full border border-black/15 bg-white px-3.5 py-2.5 text-[14px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                    Initial Vote Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={candidateForm.voteCount}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, voteCount: Number(e.target.value) }))}
                    className="w-full border border-black/15 bg-white px-3.5 py-2.5 text-[14px] text-black outline-none rounded-xl focus:border-[#762e99] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-black/70 mb-1">
                    Visibility Status
                  </label>
                  <div className="flex items-center space-x-3 pt-2">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-[12px]">
                      <input
                        type="radio"
                        name="approval"
                        checked={candidateForm.isApproved === true}
                        onChange={() => setCandidateForm(prev => ({ ...prev, isApproved: true }))}
                        className="text-[#762e99]"
                      />
                      <span>Approved</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-[12px]">
                      <input
                        type="radio"
                        name="approval"
                        checked={candidateForm.isApproved === false}
                        onChange={() => setCandidateForm(prev => ({ ...prev, isApproved: false }))}
                        className="text-[#762e99]"
                      />
                      <span>Pending</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-black hover:bg-black/5 text-[12px] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white hover:opacity-90 text-[12px] font-medium transition"
                >
                  {saving ? 'Saving...' : (editingCandidate ? 'Save Changes' : 'Create Candidate')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
