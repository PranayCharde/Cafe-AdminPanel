import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
  Check,
  Ban
} from 'lucide-react';
import { menuApi } from '../lib/api';

export default function MenuManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee',
    image: '',
    available: true,
    availabilityNote: '',
    isFeatured: false,
    prepTime: '5-10 mins',
    dietary: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodRes, catRes] = await Promise.all([
        menuApi.getProducts(),
        menuApi.getCategories()
      ]);
      setProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setError('Could not load menu items. Verify backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0]?.slug || 'coffee',
      image: '',
      available: true,
      availabilityNote: '',
      isFeatured: false,
      prepTime: '5-10 mins',
      dietary: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: String(prod.price || ''),
      category: prod.category || 'coffee',
      image: prod.imageUrl || prod.image || '',
      available: prod.available !== false,
      availabilityNote: prod.availabilityNote || '',
      isFeatured: Boolean(prod.isFeatured),
      prepTime: prod.prepTime || '5-10 mins',
      dietary: Array.isArray(prod.dietary) ? prod.dietary.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      imageUrl: formData.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
      available: formData.available,
      availabilityNote: !formData.available ? (formData.availabilityNote || 'Sold Out') : '',
      isFeatured: formData.isFeatured,
      prepTime: formData.prepTime,
      dietary: formData.dietary
        ? formData.dietary.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        : []
    };

    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        await menuApi.updateProduct(id, payload);
      } else {
        await menuApi.createProduct(payload);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || 'Failed to save product item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    try {
      await menuApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete menu item');
    }
  };

  // Quick 1-click availability toggle
  const handleToggleAvailability = async (prod) => {
    const id = prod._id || prod.id;
    const nextAvail = !prod.available;
    const note = nextAvail ? '' : 'Sold Out for Today';
    try {
      await menuApi.updateProduct(id, { available: nextAvail, availabilityNote: note });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id || p.id === id
            ? { ...p, available: nextAvail, availabilityNote: note }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      alert('Failed to update availability status');
    }
  };

  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
    if (availabilityFilter === 'available' && !prod.available) return false;
    if (availabilityFilter === 'unavailable' && prod.available) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchDesc = prod.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const availableCount = products.filter((p) => p.available).length;
  const unavailableCount = products.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-amber-500" />
            Menu Catalog & Kitchen Availability
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exclusively managed by Admin: Add dishes, edit prices, and mark items <span className="text-emerald-400 font-semibold">In Stock</span> or <span className="text-rose-400 font-semibold">Unavailable / Sold Out</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* KPI Availability Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Menu Items</span>
            <span className="text-2xl font-bold text-white mt-1 block">{products.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-medium block">In Stock & Ready to Make</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{availableCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 font-medium block">Sold Out / Cannot be Made</span>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">{unavailableCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Availability Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-semibold uppercase text-[10px]">Filter Availability:</span>
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                availabilityFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              In Stock ({availableCount})
            </button>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                availabilityFilter === 'unavailable'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Sold Out ({unavailableCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-500" />
            Loading catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            No items found matching the selected filter.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const prodId = prod._id || prod.id;
            const isAvail = prod.available !== false;

            return (
              <div
                key={prodId}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition ${
                  isAvail ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/40 bg-slate-950/80'
                }`}
              >
                <div>
                  <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={prod.imageUrl || prod.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'}
                      alt={prod.name}
                      className={`w-full h-full object-cover transition duration-300 ${
                        !isAvail ? 'grayscale opacity-60' : ''
                      }`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500';
                      }}
                    />

                    {/* Prominent Overlay Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md uppercase tracking-wider flex items-center gap-1 ${
                          isAvail
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-rose-600/95 text-white animate-pulse'
                        }`}
                      >
                        {isAvail ? (
                          <>
                            <Check className="w-3 h-3" /> In Stock
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" /> Sold Out
                          </>
                        )}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      {prod.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow">
                          Featured
                        </span>
                      )}
                    </div>

                    {!isAvail && (
                      <div className="absolute inset-x-0 bottom-0 bg-rose-950/80 backdrop-blur-xs py-1 px-2 text-center text-[11px] text-rose-300 font-medium truncate">
                        {prod.availabilityNote || 'Cannot be made at this time'}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm leading-tight ${isAvail ? 'text-white' : 'text-slate-400'}`}>
                        {prod.name}
                      </h3>
                      <span className="text-amber-400 font-bold text-sm shrink-0">
                        ₹{Number(prod.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {prod.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {prod.category}
                      </span>
                      {prod.prepTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prod.prepTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
                  {/* Availability Toggle Button */}
                  <button
                    onClick={() => handleToggleAvailability(prod)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isAvail
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isAvail ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-rose-400" />
                        <span>Mark as Sold Out</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark In Stock & Available</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-amber-400" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => handleDelete(prodId, prod.name)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      title="Delete dish from menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-500" />
              {editingProduct ? 'Edit Menu Item & Kitchen Status' : 'Add New Dish to Menu'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Masala Chai, Hazelnut Latte"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Freshly prepared with artisanal ingredients..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Kitchen Availability Controls */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Kitchen Preparation Status</span>
                    <span className="text-[11px] text-slate-400">Can this dish currently be made by the kitchen?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {!formData.available && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="block text-rose-400 font-medium mb-1 text-[11px]">
                      Reason / Customer Notice (Displayed on menu)
                    </label>
                    <input
                      type="text"
                      value={formData.availabilityNote}
                      onChange={(e) => setFormData({ ...formData, availabilityNote: e.target.value })}
                      placeholder="e.g. Sold Out for Today, Out of Seasonal Berries"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-rose-900/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    placeholder="5-10 mins"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Dietary Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    placeholder="veg, gluten-free, organic"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Featured Dish on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow transition cursor-pointer"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
