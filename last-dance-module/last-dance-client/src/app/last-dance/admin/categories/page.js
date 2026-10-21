'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tag, Plus, Edit2, Trash2, ArrowUp, ArrowDown, 
  CheckCircle2, AlertCircle, RefreshCw, X, 
  Sparkles, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const QUICK_PRESETS = [
  'Best DJ / Entertainer',
  'Most Photogenic',
  'Campus Innovator',
  'Sports Star of the Year',
  'Fashion Icon of the Night',
  'Creative of the Year'
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingAdd, setSavingAdd] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignTarget, setReassignTarget] = useState('');
  const [savingDelete, setSavingDelete] = useState(false);

  const [reordering, setReordering] = useState(false);

  const showToast = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
  };

  const fetchCategories = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/categories`);
      if (res.data?.success) {
        setCategories(res.data.categories || []);
        setCategoryStats(res.data.categoryStats || {});
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      showToast('error', 'Could not load categories from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(false);
  }, [fetchCategories]);

  // 1. Add Category
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    if (categories.some(c => c.toLowerCase() === clean.toLowerCase())) {
      showToast('error', `A category named "${clean}" already exists.`);
      return;
    }

    setSavingAdd(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/admin/categories`,
        { name: clean },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showToast('success', res.data.message || `Category "${clean}" created!`);
        setNewCategoryName('');
        setAddModalOpen(false);
        fetchCategories();
      } else {
        showToast('error', res.data?.message || 'Failed to add category.');
      }
    } catch (err) {
      console.error('Add category error:', err);
      showToast('error', err.response?.data?.message || 'Error adding category.');
    } finally {
      setSavingAdd(false);
    }
  };

  // 2. Edit / Rename Category
  const handleOpenEdit = (catName) => {
    setCategoryToEdit(catName);
    setEditCategoryName(catName);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    const clean = editCategoryName.trim();
    if (!clean || !categoryToEdit) return;

    if (clean.toLowerCase() !== categoryToEdit.toLowerCase() && 
        categories.some(c => c.toLowerCase() === clean.toLowerCase())) {
      showToast('error', `A category named "${clean}" already exists.`);
      return;
    }

    setSavingEdit(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.put(
        `${API_BASE_URL}/last-dance/admin/categories/${encodeURIComponent(categoryToEdit)}`,
        { newName: clean },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showToast('success', res.data.message || `Category renamed to "${clean}"!`);
        setEditModalOpen(false);
        setCategoryToEdit(null);
        fetchCategories();
      } else {
        showToast('error', res.data?.message || 'Failed to rename category.');
      }
    } catch (err) {
      console.error('Edit category error:', err);
      showToast('error', err.response?.data?.message || 'Error updating category.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 3. Delete Category
  const handleOpenDelete = (catName) => {
    setCategoryToDelete(catName);
    // Suggest first alternative category for reassignment if available
    const alternatives = categories.filter(c => c.toLowerCase() !== catName.toLowerCase());
    setReassignTarget(alternatives[0] || '');
    setDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!categoryToDelete) return;

    const count = categoryStats[categoryToDelete]?.total || 0;
    if (count > 0 && !reassignTarget) {
      showToast('error', 'Please select an existing category to reassign candidates to.');
      return;
    }

    setSavingDelete(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.delete(
        `${API_BASE_URL}/last-dance/admin/categories/${encodeURIComponent(categoryToDelete)}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          data: { reassignTo: reassignTarget }
        }
      );

      if (res.data?.success) {
        showToast('success', res.data.message || `Category "${categoryToDelete}" deleted!`);
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        showToast('error', res.data?.message || 'Failed to delete category.');
      }
    } catch (err) {
      console.error('Delete category error:', err);
      showToast('error', err.response?.data?.message || 'Error deleting category.');
    } finally {
      setSavingDelete(false);
    }
  };

  // 4. Reorder Categories (Move Up / Down)
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setCategories(updated);
    setReordering(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.put(
        `${API_BASE_URL}/last-dance/admin/categories/reorder`,
        { categories: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        showToast('success', 'Leaderboard navigation tab order updated!');
      }
    } catch (err) {
      console.error('Reorder error:', err);
      showToast('error', 'Failed to save new category order.');
      fetchCategories();
    } finally {
      setReordering(false);
    }
  };

  const totalAssignedNominees = Object.values(categoryStats).reduce((acc, curr) => acc + (curr.total || 0), 0);
  const categoriesWithCandidates = Object.values(categoryStats).filter(c => (c.total || 0) > 0).length;

  return (
    <div className="space-y-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Toast Notification */}
      {actionMessage.text && (
        <div className={`p-4 rounded-2xl border text-[13px] font-medium flex items-center justify-between shadow-sm animate-fade-in ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-black/40 hover:text-black ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Award Structure & Ballot Navigation
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            Nominee Categories
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Configure award titles, control the order of tabs on the public leaderboard, and manage candidate distribution
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading || reordering}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white text-[12px] font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">Active Categories</p>
          <p className="text-[28px] font-normal tracking-tight text-black leading-none">{categories.length}</p>
          <p className="text-[11px] text-[#762e99] font-medium pt-1">Visible on public leaderboard</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">Total Enrolled Nominees</p>
          <p className="text-[28px] font-normal tracking-tight text-black leading-none">{totalAssignedNominees}</p>
          <p className="text-[11px] text-emerald-600 font-medium pt-1">Across all categories</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">Contested Categories</p>
          <p className="text-[28px] font-normal tracking-tight text-black leading-none">{categoriesWithCandidates}</p>
          <p className="text-[11px] text-black/45 pt-1">Have at least 1 nominee</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">Tab Reordering</p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-medium text-black">Drag-free 1-Click Ordering</span>
          </div>
          <p className="text-[11px] text-black/45">Controls frontend category pills</p>
        </div>
      </div>

      {/* Categories List Section */}
      <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div>
            <h2 className="text-[18px] font-normal text-black">Configured Categories</h2>
            <p className="text-[12px] text-black/50">
              The order shown here dictates the exact left-to-right order of the navigation tabs on the public leaderboard.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[#762e99] bg-[#762e99]/10 px-3 py-1 rounded-full">
            {categories.length} Categories
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#762e99] mx-auto" />
            <p className="text-[13px] text-black/50">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black/40">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-medium text-black">No categories found</p>
            <p className="text-[12px] text-black/45 max-w-sm mx-auto">
              Get started by adding your first award category for Last Dance 2026.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#762e99] text-white text-[12px] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Category</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const stats = categoryStats[cat] || { total: 0, approved: 0, pending: 0 };
              return (
                <div 
                  key={cat}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-black/[0.07] bg-[#fbfbfb] hover:bg-white hover:border-[#762e99]/30 hover:shadow-xs transition-all gap-3"
                >
                  {/* Left: Reorder Controls & Name */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    
                    {/* Reorder Buttons */}
                    <div className="flex flex-col space-y-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0 || reordering}
                        title="Move Up"
                        className="w-6 h-6 rounded-md border border-black/10 bg-white hover:bg-black/5 text-black/60 hover:text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === categories.length - 1 || reordering}
                        title="Move Down"
                        className="w-6 h-6 rounded-md border border-black/10 bg-white hover:bg-black/5 text-black/60 hover:text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Order Pill */}
                    <span className="w-7 h-7 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[11px] font-bold text-black/60 shrink-0">
                      {idx + 1}
                    </span>

                    {/* Category Title */}
                    <div className="truncate">
                      <p className="text-[14px] font-medium text-black truncate">{cat}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-black/45 mt-0.5">
                        <span>Position #{idx + 1} on Nav</span>
                        <span>&bull;</span>
                        <span className="text-[#762e99] font-medium">{stats.total} total candidate{stats.total === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominee Breakdown Badges & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                    
                    {/* Approved / Pending Breakdown Badges */}
                    <div className="flex items-center space-x-1.5">
                      <span 
                        title="Approved Nominees"
                        className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
                      >
                        {stats.approved} approved
                      </span>
                      {stats.pending > 0 && (
                        <span 
                          title="Pending Nominees"
                          className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"
                        >
                          {stats.pending} pending
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        title="Rename Category"
                        className="p-2 rounded-xl border border-black/10 bg-white text-black/70 hover:text-[#762e99] hover:border-[#762e99]/40 hover:bg-[#762e99]/5 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(cat)}
                        title="Delete Category"
                        className="p-2 rounded-xl border border-black/10 bg-white text-black/70 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: ADD CATEGORY
         ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-black/[0.08]">
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#762e99]" />
                <h3 className="text-[18px] font-semibold text-black">Add New Category</h3>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="text-black/40 hover:text-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Best DJ / Entertainer"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border border-black/[0.1] rounded-2xl text-[14px] font-medium text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-black/45">Quick Suggestions</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setNewCategoryName(preset)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/5 hover:bg-[#762e99]/10 hover:text-[#762e99] text-black/70 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-[#762e99]/15 text-[12px] text-black/60 leading-relaxed">
                <p>
                  This new category will instantly appear on the public registration page dropdown and on the leaderboard category navigation bar.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={savingAdd}
                  className="px-5 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdd || !newCategoryName.trim()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 disabled:opacity-50 transition shadow-sm"
                >
                  <Plus className={`w-3.5 h-3.5 ${savingAdd ? 'animate-spin' : ''}`} />
                  <span>{savingAdd ? 'Adding...' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT / RENAME CATEGORY
         ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-black/[0.08]">
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#762e99]" />
                <h3 className="text-[18px] font-semibold text-black">Rename Category</h3>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-black/40 hover:text-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                  New Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border border-black/[0.1] rounded-2xl text-[14px] font-medium text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
                />
              </div>

              {/* Data Migration Notice */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-[12px] text-amber-900 leading-relaxed flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Automated Candidate Migration:</p>
                  <p className="text-amber-800/80 mt-0.5">
                    All <strong>{categoryStats[categoryToEdit]?.total || 0} candidate(s)</strong> currently under &ldquo;{categoryToEdit}&rdquo; will be automatically migrated to &ldquo;{editCategoryName || 'the new name'}&rdquo; without loss of votes.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editCategoryName.trim()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 disabled:opacity-50 transition shadow-sm"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${savingEdit ? 'animate-spin' : ''}`} />
                  <span>{savingEdit ? 'Renaming...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DELETE CATEGORY (WITH SAFE REASSIGNMENT)
         ======================================================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-black/[0.08]">
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-[18px] font-semibold text-black">Delete Category</h3>
              </div>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="text-black/40 hover:text-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <p className="text-[13px] text-black/70 leading-relaxed">
                Are you sure you want to permanently delete the category <strong className="text-black">&ldquo;{categoryToDelete}&rdquo;</strong>?
              </p>

              {(categoryStats[categoryToDelete]?.total || 0) > 0 ? (
                <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex items-start space-x-2 text-amber-900 text-[12px]">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Candidate Reassignment Required:</p>
                      <p className="text-amber-800/80 mt-0.5">
                        There are <strong>{categoryStats[categoryToDelete]?.total} candidate(s)</strong> registered in this category. Choose where to reassign them:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-amber-900">
                      Reassign Candidates To:
                    </label>
                    <select
                      required
                      value={reassignTarget}
                      onChange={(e) => setReassignTarget(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-[13px] font-medium text-black focus:outline-none focus:border-[#762e99]"
                    >
                      {categories
                        .filter(c => c.toLowerCase() !== (categoryToDelete || '').toLowerCase())
                        .map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[12px] text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This category has 0 candidates enrolled and can be safely removed.</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={savingDelete}
                  className="px-5 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDelete || ((categoryStats[categoryToDelete]?.total || 0) > 0 && !reassignTarget)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold disabled:opacity-50 transition shadow-sm"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${savingDelete ? 'animate-spin' : ''}`} />
                  <span>{savingDelete ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
