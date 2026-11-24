import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  RefreshCw,
  Search,
  MessageCircle
} from 'lucide-react';
import { reservationApi } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reservationApi.getAll();
      setReservations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Could not load reservations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await reservationApi.updateStatus(id, status);
      setReservations((prev) =>
        prev.map((r) => (r._id === id || r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update reservation status:', err);
      alert('Failed to update reservation');
    }
  };

  const filtered = reservations.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (r.name || '').toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-[#b85c1f]" />
            Table Reservations
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Manage table bookings, guest headcounts, and reservation confirmations
          </p>
        </div>

        <button
          onClick={fetchReservations}
          className="px-3.5 py-2 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-xl border border-[#ebdccd] shadow-xs transition flex items-center gap-2 text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#b85c1f] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl p-4.5 shadow-card flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                filter === st
                  ? 'bg-[#b85c1f] text-white shadow-xs'
                  : 'bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786c65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest name, phone..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl overflow-hidden shadow-card">
        {loading && reservations.length === 0 ? (
          <div className="py-16 text-center text-[#786c65] text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#b85c1f]" />
            Loading reservations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#786c65] text-sm">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-[#b85c1f]/40" />
            No reservations match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ebdccd] bg-[#f5efe6] text-[#786c65] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Special Requests</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccd]">
                {filtered.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id} className="hover:bg-[#faf7f2] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2e241f]">{item.name}</div>
                        <div className="text-[10px] text-[#786c65] font-mono">
                          ID: #{String(id).slice(-6)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#2e241f] flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#b85c1f]" />
                          <span>{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="text-[#786c65] text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-[#786c65]" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2e241f]">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="text-[#786c65] text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#b85c1f]" />
                          <span>{item.time}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#2e241f]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#faf7f2] border border-[#ebdccd] text-[#2e241f]">
                          <Users className="w-3 h-3 text-[#b85c1f]" />
                          {item.guests} {item.guests === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#786c65] max-w-xs truncate">
                        {item.specialRequests || 'None'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.phone && (
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${item.name}! Your table reservation for ${item.guests} guests on ${new Date(item.date).toLocaleDateString()} at ${item.time} is ${item.status} at Bean & Brew Cafe.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition"
                              title="Send WhatsApp confirmation"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleStatus(id, 'confirmed')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {item.status !== 'cancelled' && item.status !== 'completed' && (
                            <button
                              onClick={() => handleStatus(id, 'cancelled')}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
