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

  const availableCount = products.filter((p) => p.available !== false).length;
  const unavailableCount = products.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-[#b85c1f]" />
            Menu Catalog & Kitchen Availability
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Admin console: Add dishes, edit pricing, and mark items <span className="text-emerald-700 font-semibold">In Stock</span> or <span className="text-rose-700 font-semibold">Sold Out / Unavailable</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 bg-[#b85c1f] hover:bg-[#a35017] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-xl border border-[#ebdccd] shadow-xs transition cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 text-[#b85c1f] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI Availability Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#ebdccd] rounded-2xl p-4.5 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs text-[#786c65] font-semibold block">Total Menu Items</span>
            <span className="text-2xl font-extrabold text-[#2e241f] mt-1 block">{products.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#b85c1f]/10 text-[#b85c1f] flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4.5 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-semibold block">In Stock & Ready to Make</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{availableCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-rose-200/80 rounded-2xl p-4.5 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-800 font-semibold block">Sold Out / Cannot be Made</span>
            <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{unavailableCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl p-4.5 shadow-card space-y-3.5">
        {/* Availability Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#786c65] font-bold uppercase tracking-wider mr-1">Filter:</span>
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                availabilityFilter === 'all'
                  ? 'bg-[#b85c1f] text-white shadow-xs'
                  : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              In Stock ({availableCount})
            </button>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                availabilityFilter === 'unavailable'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Sold Out ({unavailableCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786c65]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-10 pr-3.5 py-2 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#ebdccd] pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#2e241f] text-white'
                : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-[#2e241f] text-white'
                  : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading && products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#b85c1f]" />
            Loading catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm bg-white rounded-2xl border border-[#ebdccd] p-8">
            No items found matching the selected filter.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const prodId = prod._id || prod.id;
            const isAvail = prod.available !== false;

            return (
              <div
                key={prodId}
                className={`bg-white border rounded-2xl overflow-hidden shadow-card hover:shadow-elevated flex flex-col justify-between transition ${
                  isAvail ? 'border-[#ebdccd] hover:border-[#b85c1f]/40' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div>
                  <div className="relative h-44 w-full bg-[#f5efe6] overflow-hidden">
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
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-md uppercase tracking-wider flex items-center gap-1 ${
                          isAvail
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white shadow-rose-900/30'
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

                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      {prod.isFeatured && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ea8e47] text-white font-bold text-[10px] shadow">
                          Featured
                        </span>
                      )}
                    </div>

                    {!isAvail && (
                      <div className="absolute inset-x-0 bottom-0 bg-rose-900/90 py-1.5 px-2.5 text-center text-[11px] text-white font-semibold truncate">
                        {prod.availabilityNote || 'Cannot be made at this time'}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className={`font-bold text-sm leading-snug ${isAvail ? 'text-[#2e241f]' : 'text-[#786c65]'}`}>
                        {prod.name}
                      </h3>
                      <span className="text-[#b85c1f] font-extrabold text-sm shrink-0">
                        ₹{Number(prod.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#786c65] line-clamp-2 mb-3">
                      {prod.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-[#786c65]">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-[#faf7f2] border border-[#ebdccd] font-medium text-[#2e241f]">
                        {prod.category}
                      </span>
                      {prod.prepTime && (
                        <span className="flex items-center gap-1 text-[#786c65]">
                          <Clock className="w-3 h-3 text-[#b85c1f]" />
                          {prod.prepTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-[#ebdccd] space-y-2 bg-[#faf7f2]/60">
                  {/* Availability Toggle Button */}
                  <button
                    onClick={() => handleToggleAvailability(prod)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isAvail
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isAvail ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Mark as Sold Out</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark In Stock & Available</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="flex-1 py-1.5 px-3 bg-white hover:bg-[#f5efe6] text-[#2e241f] border border-[#ebdccd] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#b85c1f]" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => handleDelete(prodId, prod.name)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#2e241f]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdccd] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative shadow-elevated">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#786c65] hover:text-[#2e241f] p-1.5 rounded-xl hover:bg-[#faf7f2] cursor-pointer transition"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-[#2e241f] mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#b85c1f]" />
              {editingProduct ? 'Edit Menu Item & Kitchen Status' : 'Add New Dish to Menu'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#786c65] font-semibold mb-1.5">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Masala Chai, Hazelnut Latte"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#786c65] font-semibold mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.00"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[#786c65] font-semibold mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition cursor-pointer capitalize"
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
                <label className="block text-[#786c65] font-semibold mb-1.5">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Freshly prepared with artisanal ingredients..."
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[#786c65] font-semibold mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                />
              </div>

              {/* Kitchen Availability Controls */}
              <div className="p-4 rounded-2xl border border-[#ebdccd] bg-[#faf7f2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#2e241f] block text-xs">Kitchen Preparation Status</span>
                    <span className="text-[11px] text-[#786c65]">Can this dish currently be prepared by the kitchen?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#ebdccd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {!formData.available && (
                  <div className="pt-2.5 border-t border-[#ebdccd]">
                    <label className="block text-rose-800 font-semibold mb-1 text-[11px]">
                      Reason / Customer Notice (Displayed on menu)
                    </label>
                    <input
                      type="text"
                      value={formData.availabilityNote}
                      onChange={(e) => setFormData({ ...formData, availabilityNote: e.target.value })}
                      placeholder="e.g. Sold Out for Today, Out of Seasonal Berries"
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-[#2e241f] placeholder-rose-300 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#786c65] font-semibold mb-1.5">Prep Time</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    placeholder="5-10 mins"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[#786c65] font-semibold mb-1.5">
                    Dietary Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    placeholder="veg, gluten-free, organic"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#2e241f] font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#b85c1f] focus:ring-[#b85c1f] accent-[#b85c1f]"
                  />
                  <span>Featured Dish on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#ebdccd] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd] rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#b85c1f] hover:bg-[#a35017] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
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
