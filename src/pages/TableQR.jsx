import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Trash2,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Armchair,
  Users,
  Sparkles,
  RefreshCw,
  Coffee
} from 'lucide-react';
import { tableApi } from '../lib/api';

export default function TableQR() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedTable, setCopiedTable] = useState(null);
  const [printModalTable, setPrintModalTable] = useState(null);

  // New table form state
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [newLocation, setNewLocation] = useState('Indoor Main Hall');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Customer app base URL (port 5000)
  const CUSTOMER_BASE_URL = 'http://localhost:5000';

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await tableApi.getAll();
      setTables(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Could not fetch tables list from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    setCreating(true);
    setError('');

    try {
      await tableApi.create({
        tableNumber: parseInt(newTableNum, 10),
        capacity: parseInt(newCapacity, 10) || 4,
        location: newLocation,
        status: 'available'
      });
      setNewTableNum('');
      await fetchTables();
    } catch (err) {
      console.error('Failed to create table:', err);
      setError(err.response?.data?.message || 'Failed to create table');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTable = async (tableNum) => {
    if (!window.confirm(`Delete Table #${tableNum}? This will remove its exclusive QR code.`)) {
      return;
    }
    try {
      await tableApi.delete(tableNum);
      setTables((prev) => prev.filter((t) => t.tableNumber !== tableNum));
    } catch (err) {
      console.error('Failed to delete table:', err);
      alert('Failed to delete table');
    }
  };

  const handleToggleStatus = async (tableNum, currentStatus) => {
    const nextStatus = currentStatus === 'occupied' ? 'available' : 'occupied';
    try {
      await tableApi.updateStatus(tableNum, nextStatus);
      setTables((prev) =>
        prev.map((t) => (t.tableNumber === tableNum ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update table status');
    }
  };

  const copyUrl = (tableNum) => {
    const url = `${CUSTOMER_BASE_URL}/table/${tableNum}`;
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNum);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const downloadQR = (tableNum) => {
    const svg = document.getElementById(`qr-svg-${tableNum}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `bean-brew-table-${tableNum}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-amber-500" />
            Exclusive Table QR Generator & Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Admin-only console to generate, manage, and print QR tent cards for customer in-table ordering
          </p>
        </div>

        <button
          onClick={fetchTables}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tables</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Add New Table Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" />
          Register New Cafe Table & Provision QR Code
        </h2>

        <form onSubmit={handleCreateTable} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Table Number
            </label>
            <input
              type="number"
              min="1"
              required
              value={newTableNum}
              onChange={(e) => setNewTableNum(e.target.value)}
              placeholder="e.g. 1, 2, 10"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Seating Capacity
            </label>
            <input
              type="number"
              min="1"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              placeholder="e.g. 4"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Dining Zone / Location
            </label>
            <select
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Indoor Main Hall">Indoor Main Hall</option>
              <option value="Outdoor Patio">Outdoor Patio</option>
              <option value="Window Bar">Window Bar</option>
              <option value="Mezzanine Lounge">Mezzanine Lounge</option>
              <option value="Terrace Garden">Terrace Garden</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{creating ? 'Generating...' : 'Generate Table QR'}</span>
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-500" />
            Loading tables and QR codes...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <Armchair className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            No tables registered yet. Use the form above to add Table #1!
          </div>
        ) : (
          tables.map((table) => {
            const qrUrl = `${CUSTOMER_BASE_URL}/table/${table.tableNumber}`;
            const isOccupied = table.status === 'occupied';

            return (
              <div
                key={table.tableNumber}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-base">
                        #{table.tableNumber}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Table {table.tableNumber}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {table.location || 'Indoor Main Hall'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(table.tableNumber, table.status)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                        isOccupied
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : 'Available'}
                    </button>
                  </div>

                  {/* QR Code Presentation Box */}
                  <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner my-3">
                    <QRCodeSVG
                      id={`qr-svg-${table.tableNumber}`}
                      value={qrUrl}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="mt-2 text-center">
                      <div className="text-[11px] font-bold text-slate-900 tracking-wider uppercase">
                        Bean & Brew Cafe
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        Scan to Order &bull; Table #{table.tableNumber}
                      </div>
                    </div>
                  </div>

                  {/* Link details */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 my-3 flex items-center justify-between text-xs">
                    <div className="truncate font-mono text-[11px] text-slate-400 max-w-[200px]">
                      {qrUrl}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyUrl(table.tableNumber)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Copy direct table order link"
                      >
                        {copiedTable === table.tableNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Open table order page in customer view"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Capacity: {table.capacity || 4} Guests
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Orders: {table.currentOrders?.length || 0} active
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setPrintModalTable(table)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Stand</span>
                  </button>
                  <button
                    onClick={() => downloadQR(table.tableNumber)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                    title="Download SVG QR"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.tableNumber)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Delete Table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Table Tent Stand Modal */}
      {printModalTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setPrintModalTable(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer no-print"
            >
              ✕
            </button>

            <h2 className="text-base font-bold text-white mb-4 no-print flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-500" />
              Table Stand Card Preview
            </h2>

            {/* Printable Tent Card Design */}
            <div
              id="printable-tent-card"
              className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl text-center border-4 border-amber-600/30"
            >
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="w-6 h-6 text-amber-700" />
                <span className="text-xl font-black uppercase tracking-wider text-amber-900">
                  Bean & Brew
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium tracking-wide">
                Artisanal Coffee & Kitchen
              </p>

              <div className="my-6 inline-block p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-1">
                  Table Number
                </div>
                <div className="text-4xl font-extrabold text-amber-950">
                  {printModalTable.tableNumber}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center my-4">
                <QRCodeSVG
                  value={`${CUSTOMER_BASE_URL}/table/${printModalTable.tableNumber}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900">Scan to Order From Table</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Open your camera, scan this QR code to view our menu, order drinks & food directly to your table!
                </p>
              </div>

              {/* Steps */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-[10px] text-slate-700 font-medium">
                <div>
                  <div className="font-bold text-amber-800">1. SCAN</div>
                  <div>Open camera & scan QR</div>
                </div>
                <div>
                  <div className="font-bold text-amber-800">2. ORDER</div>
                  <div>Pick food & drinks</div>
                </div>
                <div>
                  <div className="font-bold text-amber-800">3. ENJOY</div>
                  <div>Served right here</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand Card</span>
              </button>
              <button
                onClick={() => setPrintModalTable(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

