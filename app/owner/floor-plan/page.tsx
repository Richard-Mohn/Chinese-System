'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaChevronLeft, FaPlus, FaMinus, FaTrash, FaSave,
  FaChair, FaUsers, FaGlassMartini, FaTree, FaLock,
  FaDoorOpen, FaCircle, FaSquare, FaUndo, FaRedo,
  FaExpand, FaCompress, FaEdit, FaCheck
} from 'react-icons/fa';

interface TableItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'circle' | 'rectangle' | 'square';
  label: string;
  seats: number;
  zone: 'indoor' | 'patio' | 'bar' | 'private' | 'vip';
  rotation: number;
}

interface FloorPlanData {
  tables: TableItem[];
  zones: { name: string; color: string }[];
  totalCapacity: number;
}

const ZONE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  indoor: { bg: 'bg-blue-500/20', border: 'border-blue-500', label: 'Indoor' },
  patio: { bg: 'bg-green-500/20', border: 'border-green-500', label: 'Patio' },
  bar: { bg: 'bg-purple-500/20', border: 'border-purple-500', label: 'Bar' },
  private: { bg: 'bg-amber-500/20', border: 'border-amber-500', label: 'Private' },
  vip: { bg: 'bg-pink-500/20', border: 'border-pink-500', label: 'VIP' },
};

const INITIAL_TABLES: TableItem[] = [];

let nextId = 1;
function genId() { return `table_${nextId++}_${Date.now()}`; }

export default function OwnerFloorPlanPage() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabelText, setNewLabelText] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load business
  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setBusinessId(d.id);
          const data = d.data();
          if (data.floorPlan?.tables) {
            setTables(data.floorPlan.tables);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  const selectedTable = tables.find(t => t.id === selectedId);
  const totalCapacity = tables.reduce((sum, t) => sum + t.seats, 0);
  const zoneCounts = tables.reduce((acc, t) => {
    acc[t.zone] = (acc[t.zone] || 0) + t.seats;
    return acc;
  }, {} as Record<string, number>);

  function addTable(zone: TableItem['zone'] = 'indoor') {
    const newTable: TableItem = {
      id: genId(),
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      width: 80,
      height: 80,
      shape: zone === 'bar' ? 'rectangle' : 'circle',
      label: `T${tables.length + 1}`,
      seats: zone === 'bar' ? 3 : 4,
      zone,
      rotation: 0,
    };
    setTables(prev => [...prev, newTable]);
    setSelectedId(newTable.id);
  }

  function updateTable(id: string, updates: Partial<TableItem>) {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  function removeTable(id: string) {
    setTables(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateTable(id: string) {
    const source = tables.find(t => t.id === id);
    if (!source) return;
    const newTable: TableItem = {
      ...source,
      id: genId(),
      x: source.x + 30,
      y: source.y + 30,
      label: `T${tables.length + 1}`,
    };
    setTables(prev => [...prev, newTable]);
    setSelectedId(newTable.id);
  }

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const table = tables.find(t => t.id === id);
    if (!table || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragId(id);
    setSelectedId(id);
    setDragOffset({
      x: e.clientX - rect.left - table.x,
      y: e.clientY - rect.top - table.y,
    });
  }, [tables]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 40, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - dragOffset.y));
    updateTable(dragId, { x, y });
  }, [dragId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragId(null);
  }, []);

  async function saveFloorPlan() {
    if (!businessId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        floorPlan: {
          tables,
          totalCapacity,
          updatedAt: serverTimestamp(),
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/owner" className="text-zinc-400 hover:text-white"><FaChevronLeft /></Link>
            <div>
              <h1 className="text-lg font-black">Floor Plan Manager</h1>
              <p className="text-xs text-zinc-500">Drag tables to arrange your layout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-xs text-zinc-500">Total Capacity</p>
              <p className="text-lg font-black text-white">{totalCapacity} seats</p>
            </div>
            <button
              onClick={saveFloorPlan}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 transition-all"
            >
              {saved ? <><FaCheck /> Saved!</> : saving ? 'Saving...' : <><FaSave /> Save</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-4 flex gap-4">
        {/* Left sidebar — add tables */}
        <div className="w-56 shrink-0 space-y-4">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Add Table</h3>
            <div className="space-y-2">
              {Object.entries(ZONE_COLORS).map(([zone, config]) => (
                <button
                  key={zone}
                  onClick={() => addTable(zone as TableItem['zone'])}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 ${config.bg} border ${config.border} rounded-xl text-sm font-bold text-white hover:opacity-80 transition-all`}
                >
                  <FaPlus className="text-xs" /> {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zone summary */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Zones</h3>
            <div className="space-y-2">
              {Object.entries(ZONE_COLORS).map(([zone, config]) => (
                <div key={zone} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <span className={`w-3 h-3 rounded-full ${config.bg} border ${config.border}`} />
                    {config.label}
                  </span>
                  <span className="font-bold text-white">{zoneCounts[zone] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected table properties */}
          {selectedTable && (
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Table Properties</h3>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Label</label>
                <input
                  type="text"
                  value={selectedTable.label}
                  onChange={e => updateTable(selectedTable.id, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg text-white text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Seats</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTable(selectedTable.id, { seats: Math.max(1, selectedTable.seats - 1) })}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="text-lg font-black flex-1 text-center">{selectedTable.seats}</span>
                  <button
                    onClick={() => updateTable(selectedTable.id, { seats: selectedTable.seats + 1 })}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Shape</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['circle', 'square', 'rectangle'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => updateTable(selectedTable.id, {
                        shape,
                        width: shape === 'rectangle' ? 120 : 80,
                        height: 80,
                      })}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedTable.shape === shape
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {shape === 'circle' ? '○' : shape === 'square' ? '□' : '▬'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Zone</label>
                <select
                  value={selectedTable.zone}
                  onChange={e => updateTable(selectedTable.id, { zone: e.target.value as TableItem['zone'] })}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {Object.entries(ZONE_COLORS).map(([zone, config]) => (
                    <option key={zone} value={zone}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => duplicateTable(selectedTable.id)}
                  className="flex-1 py-2 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => removeTable(selectedTable.id)}
                  className="flex-1 py-2 bg-red-600/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <div
            ref={canvasRef}
            className="bg-zinc-900/50 rounded-2xl border border-zinc-800 relative overflow-hidden select-none"
            style={{ height: '70vh', cursor: dragId ? 'grabbing' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedId(null)}
          >
            {/* Grid dots */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Tables */}
            {tables.map(table => {
              const zoneConfig = ZONE_COLORS[table.zone];
              const isSelected = selectedId === table.id;
              return (
                <div
                  key={table.id}
                  className={`absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-shadow ${
                    isSelected ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.width,
                    height: table.height,
                    transform: `rotate(${table.rotation}deg)`,
                  }}
                  onMouseDown={e => handleMouseDown(e, table.id)}
                >
                  <div
                    className={`w-full h-full ${zoneConfig.bg} border-2 ${
                      isSelected ? 'border-white shadow-lg shadow-white/20' : zoneConfig.border
                    } flex flex-col items-center justify-center transition-all hover:scale-105 ${
                      table.shape === 'circle' ? 'rounded-full' : table.shape === 'square' ? 'rounded-xl' : 'rounded-xl'
                    }`}
                  >
                    <span className="text-xs font-black text-white">{table.label}</span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <FaChair className="text-[8px]" /> {table.seats}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <FaChair className="text-5xl text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold mb-2">No tables yet</p>
                  <p className="text-zinc-600 text-sm">Use the sidebar to add tables to your floor plan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
