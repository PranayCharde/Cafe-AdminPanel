import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  RefreshCw,
  Search,
  CheckCircle,
  Archive,
  ExternalLink
} from 'lucide-react';
import { contactApi } from '../lib/api';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await contactApi.getAll();
      setInquiries(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError('Could not load inquiries from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await contactApi.updateStatus(id, status);
      setInquiries((prev) =>
        prev.map((i) => (i._id === id || i.id === id ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const filtered = inquiries.filter((inq) => {
    if (filter !== 'all' && inq.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (inq.name || '').toLowerCase();
      const email = (inq.email || '').toLowerCase();
      const subject = (inq.subject || '').toLowerCase();
      const msg = (inq.message || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !subject.includes(q) && !msg.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-amber-500" />
            Customer Inquiries & Feedback
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming messages from the website contact form
          </p>
        </div>

        <button
          onClick={fetchInquiries}
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
          {['all', 'new', 'replied', 'archived'].map((st) => (
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
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && inquiries.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-500" />
            Loading messages...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            No messages found.
          </div>
        ) : (
          filtered.map((item) => {
            const id = item._id || item.id;
            const isNew = item.status === 'new';

            return (
              <div
                key={id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition ${
                  isNew ? 'border-amber-500/40' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{item.name}</h3>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:text-amber-400 flex items-center gap-1 transition"
                        >
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{item.email}</span>
                        </a>
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="hover:text-amber-400 flex items-center gap-1 transition"
                          >
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{item.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.subject && (
                    <div className="text-xs font-semibold text-slate-200 mb-1.5">
                      Subject: {item.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="capitalize text-slate-400 text-[11px]">
                    Status: <span className="font-semibold text-slate-200">{item.status}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(
                        `Re: ${item.subject || 'Your inquiry at Bean & Brew'}`
                      )}`}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reply Email</span>
                    </a>
                    {item.status !== 'replied' && (
                      <button
                        onClick={() => handleUpdateStatus(id, 'replied')}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                        title="Mark Replied"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {item.status !== 'archived' && (
                      <button
                        onClick={() => handleUpdateStatus(id, 'archived')}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

