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
          <h1 className="text-2xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-[#b85c1f]" />
            Exclusive Table QR Generator & Manager
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Admin console to provision, manage, and print QR tent cards for customer in-table ordering
          </p>
        </div>

        <button
          onClick={fetchTables}
          className="px-3.5 py-2 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-xl border border-[#ebdccd] shadow-xs transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#b85c1f] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tables</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Add New Table Form */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 sm:p-6 shadow-card">
        <h2 className="text-xs font-bold text-[#2e241f] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#b85c1f]" />
          Register New Cafe Table & Provision QR Code
        </h2>

        <form onSubmit={handleCreateTable} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#786c65] mb-1.5">
              Table Number
            </label>
            <input
              type="number"
              min="1"
              required
              value={newTableNum}
              onChange={(e) => setNewTableNum(e.target.value)}
              placeholder="e.g. 13, 14"
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#786c65] mb-1.5">
              Seating Capacity
            </label>
            <input
              type="number"
              min="1"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              placeholder="e.g. 4"
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#786c65] mb-1.5">
              Dining Zone / Location
            </label>
            <select
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition cursor-pointer"
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
            className="w-full py-2.5 px-4 bg-[#b85c1f] hover:bg-[#a35017] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{creating ? 'Generating...' : 'Generate Table QR'}</span>
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#b85c1f]" />
            Loading tables and QR codes...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm bg-white rounded-2xl border border-[#ebdccd] p-8">
            <Armchair className="w-10 h-10 mx-auto mb-3 text-[#b85c1f]/40" />
            No tables registered yet. Use the form above to add Table #1!
          </div>
        ) : (
          tables.map((table) => {
            const qrUrl = `${CUSTOMER_BASE_URL}/table/${table.tableNumber}`;
            const isOccupied = table.status === 'occupied';

            return (
              <div
                key={table.tableNumber}
                className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card hover:shadow-elevated hover:border-[#b85c1f]/40 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#b85c1f]/10 border border-[#b85c1f]/20 text-[#b85c1f] font-extrabold flex items-center justify-center text-base">
                        #{table.tableNumber}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#2e241f]">
                          Table {table.tableNumber}
                        </h3>
                        <p className="text-[11px] text-[#786c65]">
                          {table.location || 'Indoor Main Hall'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(table.tableNumber, table.status)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer shadow-2xs ${
                        isOccupied
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : 'Available'}
                    </button>
                  </div>

                  {/* QR Code Presentation Box */}
                  <div className="bg-[#faf7f2] p-4 rounded-xl flex flex-col items-center justify-center border border-[#ebdccd] my-3">
                    <div className="p-2 bg-white rounded-lg shadow-2xs">
                      <QRCodeSVG
                        id={`qr-svg-${table.tableNumber}`}
                        value={qrUrl}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-[12px] font-bold text-[#2e241f] tracking-wider uppercase font-display">
                        Bean & Brew Cafe
                      </div>
                      <div className="text-[11px] text-[#786c65] font-mono mt-0.5">
                        Scan to Order &bull; Table #{table.tableNumber}
                      </div>
                    </div>
                  </div>

                  {/* Link details */}
                  <div className="bg-[#faf7f2] border border-[#ebdccd] rounded-xl p-2.5 my-3 flex items-center justify-between text-xs">
                    <div className="truncate font-mono text-[11px] text-[#786c65] max-w-[200px]">
                      {qrUrl}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyUrl(table.tableNumber)}
                        className="p-1.5 text-[#786c65] hover:text-[#2e241f] rounded-lg hover:bg-white transition cursor-pointer"
                        title="Copy direct table order link"
                      >
                        {copiedTable === table.tableNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#786c65] hover:text-[#b85c1f] rounded-lg hover:bg-white transition"
                        title="Open table order page in customer view"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#786c65] px-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#b85c1f]" />
                      Capacity: {table.capacity || 4} Guests
                    </span>
                    <span className="text-[11px] font-medium text-[#2e241f]">
                      Orders: {table.currentOrders?.length || 0} active
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#ebdccd] flex items-center gap-2">
                  <button
                    onClick={() => setPrintModalTable(table)}
                    className="flex-1 py-2 px-3 bg-[#f5efe6] hover:bg-[#ebdccd] text-[#2e241f] border border-[#ebdccd] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#b85c1f]" />
                    <span>Print Stand</span>
                  </button>
                  <button
                    onClick={() => downloadQR(table.tableNumber)}
                    className="p-2 bg-[#faf7f2] hover:bg-[#ebdccd] text-[#2e241f] border border-[#ebdccd] rounded-xl transition cursor-pointer"
                    title="Download SVG QR"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.tableNumber)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#2e241f]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdccd] rounded-3xl w-full max-w-md p-6 relative shadow-elevated">
            <button
              onClick={() => setPrintModalTable(null)}
              className="absolute top-4 right-4 text-[#786c65] hover:text-[#2e241f] p-1.5 rounded-xl hover:bg-[#faf7f2] cursor-pointer no-print transition"
            >
              ✕
            </button>

            <h2 className="text-base font-bold text-[#2e241f] mb-4 no-print flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#b85c1f]" />
              Table Stand Card Preview
            </h2>

            {/* Printable Tent Card Design */}
            <div
              id="printable-tent-card"
              className="bg-[#faf7f2] text-[#2e241f] p-8 rounded-2xl shadow-md text-center border-3 border-[#b85c1f]/40"
            >
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <Coffee className="w-6 h-6 text-[#b85c1f]" />
                <span className="text-2xl font-black tracking-wide text-[#2e241f] font-display">
                  Bean & Brew
                </span>
              </div>
              <p className="text-xs text-[#786c65] font-medium tracking-wide">
                Artisanal Coffee & Kitchen
              </p>

              <div className="my-5 inline-block px-6 py-3 bg-white rounded-2xl border border-[#ebdccd] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#786c65] mb-0.5">
                  Table Number
                </div>
                <div className="text-4xl font-extrabold text-[#b85c1f]">
                  #{printModalTable.tableNumber}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center my-3">
                <div className="p-3 bg-white rounded-2xl border border-[#ebdccd] shadow-2xs">
                  <QRCodeSVG
                    value={`${CUSTOMER_BASE_URL}/table/${printModalTable.tableNumber}`}
                    size={190}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-[#2e241f]">Scan to Order From Table</h3>
                <p className="text-xs text-[#786c65] mt-1 max-w-xs mx-auto leading-relaxed">
                  Scan this QR code with your phone camera to view the menu and send orders directly to the kitchen!
                </p>
              </div>

              {/* Steps */}
              <div className="mt-5 pt-4 border-t border-[#ebdccd] grid grid-cols-3 gap-2 text-[10px] text-[#786c65]">
                <div>
                  <div className="font-bold text-[#b85c1f]">1. SCAN</div>
                  <div>Open camera & scan</div>
                </div>
                <div>
                  <div className="font-bold text-[#b85c1f]">2. ORDER</div>
                  <div>Pick food & drinks</div>
                </div>
                <div>
                  <div className="font-bold text-[#b85c1f]">3. ENJOY</div>
                  <div>Served at your table</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-[#b85c1f] hover:bg-[#a35017] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand Card</span>
              </button>
              <button
                onClick={() => setPrintModalTable(null)}
                className="py-2.5 px-4 bg-white hover:bg-[#faf7f2] text-[#2e241f] border border-[#ebdccd] rounded-xl text-xs font-semibold cursor-pointer transition"
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
