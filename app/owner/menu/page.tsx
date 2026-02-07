'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  spicy?: boolean;
  popular?: boolean;
  options?: { name: string; choices: { label: string; price: number }[] }[];
  trackStock?: boolean;
  stock?: number | null;
  lowStockThreshold?: number;
  orderCount?: number;
}

const DEFAULT_CATEGORIES = [
  'Appetizers',
  'Soups',
  'Salads',
  'Entrees',
  'Sides',
  'Desserts',
  'Beverages',
  'Specials',
  'Kids Menu',
  'Combos',
];

export default function OwnerMenuPage() {
  const { currentBusiness } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editor form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
    spicy: false,
    popular: false,
    trackStock: false,
    stock: '',
    lowStockThreshold: '5',
    flashSalePrice: '',
    saleStartTime: '',
    saleEndTime: '',
    isLimitedRun: false,
  });

  const fetchItems = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const menuRef = collection(db, 'businesses', currentBusiness.businessId, 'menuItems');
      const q = query(menuRef, orderBy('category'));
      const snap = await getDocs(q);
      const data: MenuItem[] = [];
      snap.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
      });
      setItems(data);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [currentBusiness]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...items.map(i => i.category)])).filter(Boolean);

  const openEditor = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category: item.category,
        image: item.image || '',
        available: item.available !== false,
        spicy: item.spicy || false,
        popular: item.popular || false,
        trackStock: item.trackStock || false,
        stock: item.stock?.toString() || '',
        lowStockThreshold: (item.lowStockThreshold || 5).toString(),
        flashSalePrice: (item as any).flashSalePrice?.toString() || '',
        saleStartTime: (item as any).saleStartTime || '',
        saleEndTime: (item as any).saleEndTime || '',
        isLimitedRun: (item as any).isLimitedRun || false,
      });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        description: '',
        price: '',
        category: categories[0] || 'Entrees',
        image: '',
        available: true,
        spicy: false,
        popular: false,
        trackStock: false,
        stock: '',
        lowStockThreshold: '5',
        flashSalePrice: '',
        saleStartTime: '',
        saleEndTime: '',
        isLimitedRun: false,
      });
    }
    setShowEditor(true);
    setMessage('');
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingItem(null);
    setMessage('');
  };

  const saveItem = async () => {
    if (!currentBusiness || !form.name.trim() || !form.price) return;
    setSaving(true);
    setMessage('');

    try {
      const menuRef = collection(db, 'businesses', currentBusiness.businessId, 'menuItems');
      const itemData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        prices: { order: parseFloat(form.price) },
        category: form.category || 'Entrees',
        image: form.image.trim() || null,
        available: form.available,
        spicy: form.spicy,
        popular: form.popular,
        trackStock: form.trackStock,
        stock: form.trackStock ? (form.stock ? parseInt(form.stock) : 0) : null,
        lowStockThreshold: form.trackStock ? parseInt(form.lowStockThreshold) || 5 : null,
        flashSalePrice: form.flashSalePrice ? parseFloat(form.flashSalePrice) : null,
        saleStartTime: form.saleStartTime || null,
        saleEndTime: form.saleEndTime || null,
        isLimitedRun: form.isLimitedRun,
        updatedAt: new Date().toISOString(),
      };

      if (editingItem) {
        // Update existing
        const itemDoc = doc(db, 'businesses', currentBusiness.businessId, 'menuItems', editingItem.id);
        await updateDoc(itemDoc, itemData);
        setMessage('Item updated!');
      } else {
        // Create new
        const newDoc = doc(menuRef);
        await setDoc(newDoc, { ...itemData, createdAt: new Date().toISOString() });
        setMessage('Item added!');
      }

      await fetchItems();
      setTimeout(() => closeEditor(), 800);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!currentBusiness || !confirm('Delete this menu item?')) return;
    try {
      await deleteDoc(doc(db, 'businesses', currentBusiness.businessId, 'menuItems', itemId));
      await fetchItems();
      if (selectedItemId === itemId) closeEditor();
    } catch {
      /* silently fail */
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (!currentBusiness) return;
    try {
      const itemDoc = doc(db, 'businesses', currentBusiness.businessId, 'menuItems', item.id);
      await updateDoc(itemDoc, { available: !item.available });
      await fetchItems();
    } catch {
      /* silently fail */
    }
  };

  const selectedItemId = editingItem?.id;

  const filtered = items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return item.name.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s);
    }
    return true;
  });

  // Group by category
  const grouped: Record<string, MenuItem[]> = {};
  filtered.forEach(item => {
    const cat = item.category || 'Uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  if (!currentBusiness) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Menu Editor</h1>
          <p className="text-zinc-400 font-medium mt-1">
            {items.length} items · {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors"
        >
          <FaPlus className="text-xs" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <select
          title="Filter by category"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 font-bold text-sm">Loading menu...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="text-zinc-600 font-bold mb-2">No menu items yet</p>
          <p className="text-zinc-400 text-sm mb-6">Add your dishes, drinks, and specials to get started.</p>
          <button
            onClick={() => openEditor()}
            className="px-8 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                {category} ({catItems.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-4 transition-all ${
                      !item.available ? 'opacity-50' : ''
                    } ${
                      selectedItemId === item.id
                        ? 'border-black ring-1 ring-black'
                        : 'border-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-sm truncate">
                          {item.name}
                          {item.spicy && <span className="ml-1">🌶️</span>}
                          {item.popular && <span className="ml-1">⭐</span>}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <span className="font-black text-black text-sm shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            item.available
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {item.available ? '● Available' : '● Unavailable'}
                        </button>
                        {item.trackStock && item.stock !== undefined && item.stock !== null && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.stock <= 0
                              ? 'bg-red-100 text-red-600'
                              : item.stock <= (item.lowStockThreshold || 5)
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                          }`}>
                            {item.stock <= 0 ? 'Sold Out' : `${item.stock} in stock`}
                          </span>
                        )}
                        {item.orderCount && item.orderCount > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {item.orderCount} orders
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditor(item)}
                          className="p-2 text-zinc-400 hover:text-black transition-colors"
                          aria-label="Edit item"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                          aria-label="Delete item"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Editor Modal ────────────────────────────────────── */}
      {showEditor && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={closeEditor} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-black">
                  {editingItem ? 'Edit Item' : 'New Menu Item'}
                </h2>
                <button onClick={closeEditor} className="p-2 text-zinc-400 hover:text-black" aria-label="Close">
                  <FaTimes />
                </button>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-sm font-bold ${
                    message.startsWith('Error')
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="General Tso's Chicken"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                  placeholder="Crispy chicken in sweet and spicy sauce..."
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="12.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Category
                  </label>
                  <select
                    title="Category"
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://..."
                />
              </div>

              {/* ── Stock / Inventory Tracking ── */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-black text-sm">Track Stock</span>
                    <p className="text-xs text-zinc-400 mt-0.5">Enable for limited-quantity items (bakery, specials, etc.)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, trackStock: !prev.trackStock }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.trackStock ? 'bg-black' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      form.trackStock ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>

                {form.trackStock && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.lowStockThreshold}
                        onChange={e => setForm(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Flash Sale / Limited Run ── */}
              <div className="border border-orange-200 rounded-xl p-4 space-y-3 bg-orange-50/30">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-black text-sm">Flash Sale</span>
                    <p className="text-xs text-zinc-400 mt-0.5">Set a temporary sale price with a time window</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      flashSalePrice: prev.flashSalePrice ? '' : prev.price ? (parseFloat(prev.price) * 0.8).toFixed(2) : '',
                    }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.flashSalePrice ? 'bg-orange-500' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      form.flashSalePrice ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>

                {form.flashSalePrice && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.flashSalePrice}
                        onChange={e => setForm(prev => ({ ...prev, flashSalePrice: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-orange-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        placeholder="9.99"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                          Starts
                        </label>
                        <input
                          type="datetime-local"
                          value={form.saleStartTime}
                          onChange={e => setForm(prev => ({ ...prev, saleStartTime: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-orange-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                          Ends
                        </label>
                        <input
                          type="datetime-local"
                          value={form.saleEndTime}
                          onChange={e => setForm(prev => ({ ...prev, saleEndTime: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-orange-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, isLimitedRun: !prev.isLimitedRun }))}
                        className={`w-8 h-5 rounded-full transition-colors relative ${
                          form.isLimitedRun ? 'bg-orange-500' : 'bg-zinc-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                          form.isLimitedRun ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <span className="text-sm font-medium text-zinc-600">Limited run (disappears when sold out)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { key: 'available', label: 'Available', icon: <FaCheck className="text-xs" /> },
                  { key: 'spicy', label: 'Spicy 🌶️', icon: null },
                  { key: 'popular', label: 'Popular ⭐', icon: null },
                ].map(toggle => (
                  <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-black text-sm">{toggle.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          [toggle.key]: !prev[toggle.key as keyof typeof prev],
                        }))
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        form[toggle.key as keyof typeof form]
                          ? 'bg-black'
                          : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          form[toggle.key as keyof typeof form]
                            ? 'translate-x-5.5'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>

              {/* Save */}
              <button
                onClick={saveItem}
                disabled={saving || !form.name.trim() || !form.price}
                className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
