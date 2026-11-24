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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-amber-500" />
            Table Reservations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage table bookings, guest headcounts, and reservation confirmations
          </p>
        </div>

        <button
          onClick={fetchReservations}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                filter === st
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest name, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading && reservations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-500" />
            Loading reservations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            No reservations match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Special Requests</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: #{String(id).slice(-6)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{item.time}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          <Users className="w-3 h-3 text-slate-400" />
                          {item.guests} {item.guests === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
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
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                              title="Send WhatsApp confirmation"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleStatus(id, 'confirmed')}
                              className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {item.status !== 'cancelled' && item.status !== 'completed' && (
                            <button
                              onClick={() => handleStatus(id, 'cancelled')}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
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

