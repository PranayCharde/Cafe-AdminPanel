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
          <h1 className="text-2xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-[#b85c1f]" />
            Customer Inquiries & Feedback
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Incoming messages from the website contact form
          </p>
        </div>

        <button
          onClick={fetchInquiries}
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
          {['all', 'new', 'replied', 'archived'].map((st) => (
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
            placeholder="Search inquiries..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading && inquiries.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#b85c1f]" />
            Loading messages...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#786c65] text-sm bg-white rounded-2xl border border-[#ebdccd] p-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#b85c1f]/40" />
            No messages found.
          </div>
        ) : (
          filtered.map((item) => {
            const id = item._id || item.id;
            const isNew = item.status === 'new';

            return (
              <div
                key={id}
                className={`bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated flex flex-col justify-between transition ${
                  isNew ? 'border-[#ea8e47] ring-1 ring-[#ea8e47]/30' : 'border-[#ebdccd]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#2e241f] text-sm">{item.name}</h3>
                        {isNew && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-300">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#786c65] mt-1">
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:text-[#b85c1f] flex items-center gap-1 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#b85c1f]" />
                          <span>{item.email}</span>
                        </a>
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="hover:text-[#b85c1f] flex items-center gap-1 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#b85c1f]" />
                            <span>{item.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-[#786c65] whitespace-nowrap font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.subject && (
                    <div className="text-xs font-bold text-[#2e241f] mb-2">
                      Subject: {item.subject}
                    </div>
                  )}

                  <p className="text-xs text-[#2e241f] bg-[#faf7f2] p-3.5 rounded-xl border border-[#ebdccd] leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ebdccd] flex items-center justify-between gap-2 text-xs">
                  <span className="capitalize text-[#786c65] text-[11px]">
                    Status: <span className="font-bold text-[#2e241f]">{item.status}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(
                        `Re: ${item.subject || 'Your inquiry at Bean & Brew'}`
                      )}`}
                      className="px-3 py-1.5 bg-[#f5efe6] hover:bg-[#ebdccd] text-[#2e241f] border border-[#ebdccd] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#b85c1f]" />
                      <span>Reply Email</span>
                    </a>
                    {item.status !== 'replied' && (
                      <button
                        onClick={() => handleUpdateStatus(id, 'replied')}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition cursor-pointer"
                        title="Mark Replied"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {item.status !== 'archived' && (
                      <button
                        onClick={() => handleUpdateStatus(id, 'archived')}
                        className="p-1.5 text-[#786c65] hover:text-[#2e241f] hover:bg-[#faf7f2] rounded-xl transition cursor-pointer"
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
