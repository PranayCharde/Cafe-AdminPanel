import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Coffee,
  Volume2,
  Search,
  Filter,
  Eye,
  RefreshCw,
  MessageCircle,
  Truck,
  Armchair,
  Check,
  XCircle,
  DollarSign
} from 'lucide-react';
import { orderApi } from '../lib/api';
import { socket } from '../lib/socket';
import { playKitchenChime } from '../lib/audio';
import { createCustomerWhatsAppLink } from '../lib/whatsapp';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Load orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderApi.getAll();
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not load orders. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket && !socket.connected) {
      socket.connect();
    }
    // Ensure subscription to admin channel
    socket.emit('join_admin');

    const handleNewOrder = (order) => {
      console.log('🔔 [Socket.IO] Realtime new order received:', order);
      playKitchenChime();
      setOrders((prev) => {
        const orderIdKey = order.orderId || order._id || order.id;
        const filtered = prev.filter(
          (o) =>
            o._id !== order._id &&
            o.id !== order.id &&
            (orderIdKey ? o.orderId !== orderIdKey : true)
        );
        return [order, ...filtered];
      });
    };

    const handleStatusUpdate = (updatedOrder) => {
      console.log('Realtime status update received:', updatedOrder);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id || o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
        )
      );
      if (selectedOrder && (selectedOrder._id === updatedOrder._id || selectedOrder.id === updatedOrder.id)) {
        setSelectedOrder((prev) => ({ ...prev, ...updatedOrder }));
      }
    };

    const handleDeleteOrder = ({ id }) => {
      setOrders((prev) => prev.filter((o) => o._id !== id && o.id !== id));
      if (selectedOrder && (selectedOrder._id === id || selectedOrder.id === id)) {
        setSelectedOrder(null);
      }
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);
    socket.on('order_deleted', handleDeleteOrder);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
      socket.off('order_deleted', handleDeleteOrder);
    };
  }, []);

  // Update status handler
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await orderApi.updateStatus(orderId, newStatus);
      const updated = res.data?.data;
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId || o.id === orderId ? { ...o, ...updated } : o))
        );
        if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
          setSelectedOrder((prev) => ({ ...prev, ...updated }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (typeFilter !== 'all') {
        if (typeFilter === 'dine-in' && order.orderType !== 'dine-in') return false;
        if (typeFilter === 'takeaway' && order.orderType !== 'takeaway' && order.orderType !== 'delivery') return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const orderNum = (order.orderNumber || '').toLowerCase();
        const custName = (order.customerName || order.user?.name || '').toLowerCase();
        const custPhone = (order.customerPhone || order.user?.phone || '').toLowerCase();
        const tableNum = String(order.tableNumber || '');
        if (
          !orderNum.includes(query) &&
          !custName.includes(query) &&
          !custPhone.includes(query) &&
          !tableNum.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, typeFilter, searchQuery]);

  // Metric counts
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    const preparing = orders.filter((o) => o.status === 'preparing').length;
    const ready = orders.filter((o) => o.status === 'ready').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const dineIn = orders.filter((o) => o.orderType === 'dine-in').length;
    const totalRev = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      active: pending + preparing + ready,
      pending,
      preparing,
      ready,
      completed,
      dineIn,
      takeaway: orders.length - dineIn,
      totalRev
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <ShoppingBag className="w-8 h-8 text-[#b85c1f]" />
            Kitchen Order Stream
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Real-time live queue for table orders and counter takeaway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playKitchenChime()}
            title="Test audio chime"
            className="p-2.5 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-2xl border border-[#ebdccd] shadow-xs transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#b85c1f]" />
            <span>Test Chime</span>
          </button>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-2xl border border-[#ebdccd] shadow-xs transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#b85c1f] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-[#786c65] font-semibold mb-1">
            <span>Active in Kitchen</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-[#2e241f]">{stats.active}</div>
          <div className="text-[11px] text-[#b85c1f] font-medium mt-1">
            {stats.pending} pending &bull; {stats.preparing} cooking &bull; {stats.ready} ready
          </div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-[#786c65] font-semibold mb-1">
            <span>Dine-In Tables</span>
            <Armchair className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{stats.dineIn}</div>
          <div className="text-[11px] text-[#786c65] mt-1">Direct QR table orders</div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-[#786c65] font-semibold mb-1">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-sky-700">{stats.completed}</div>
          <div className="text-[11px] text-[#786c65] mt-1">Served & completed orders</div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-[#786c65] font-semibold mb-1">
            <span>Total Sales Value</span>
            <DollarSign className="w-4 h-4 text-[#b85c1f]" />
          </div>
          <div className="text-3xl font-extrabold text-[#b85c1f]">₹{stats.totalRev.toFixed(2)}</div>
          <div className="text-[11px] text-[#786c65] mt-1">{orders.length} total orders recorded</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#b85c1f] text-white shadow-sm'
                    : 'bg-[#faf7f2] text-[#786c65] hover:text-[#2e241f] border border-[#ebdccd]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Filter & Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#faf7f2] border border-[#ebdccd] text-[#2e241f] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#b85c1f] cursor-pointer"
            >
              <option value="all">All Dining Types</option>
              <option value="dine-in">Dine-In (Table QR)</option>
              <option value="takeaway">Takeaway (Counter Pickup)</option>
            </select>

            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a89688]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order#, name, table..."
                className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89688] focus:outline-none focus:border-[#b85c1f]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white border border-[#ebdccd] rounded-2xl overflow-hidden shadow-card">
        {loading && orders.length === 0 ? (
          <div className="py-16 text-center text-[#786c65] text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#b85c1f]" />
            Loading kitchen queue...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-[#786c65] text-sm">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[#a89688]" />
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ebdccd] bg-[#f5efe6] text-[#786c65] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-5">Order #</th>
                  <th className="py-4 px-5">Customer & Table</th>
                  <th className="py-4 px-5">Items</th>
                  <th className="py-4 px-5">Total</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Time</th>
                  <th className="py-4 px-5 text-right">Kitchen Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe6]">
                {filteredOrders.map((order) => {
                  const orderId = order._id || order.id;
                  const isDineIn = order.orderType === 'dine-in';
                  const custName = order.customerName || order.user?.name || 'Walk-in Guest';
                  const custPhone = order.customerPhone || order.user?.phone || '';
                  const total = Number(order.totalAmount || 0).toFixed(2);
                  const isUpdating = updatingId === orderId;

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-[#faf7f2] transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-4 px-5 font-mono font-bold text-[#b85c1f]">
                        {order.orderNumber || `#${order.orderId || String(orderId).slice(-6)}`}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#2e241f]">{custName}</div>
                        <div className="text-[11px] text-[#786c65] flex items-center gap-1.5 mt-0.5 font-medium">
                          {isDineIn ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                              <Armchair className="w-3 h-3 text-emerald-600" />
                              Table {order.tableNumber || '?'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                              <ShoppingBag className="w-3 h-3 text-amber-600" />
                              Takeaway (Counter Pickup)
                            </span>
                          )}
                          {custPhone && <span>&bull; {custPhone}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="max-w-xs truncate text-[#2e241f] font-medium">
                          {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ') || 'No items'}
                        </div>
                        <div className="text-[11px] text-[#786c65] mt-0.5">
                          {order.items?.reduce((s, it) => s + (it.quantity || 1), 0)} total items
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-[#2e241f] text-sm">
                        ₹{total}
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-5 text-[#786c65] whitespace-nowrap font-medium">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {order.status === 'pending' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(orderId, 'preparing')}
                              className="px-3 py-1.5 bg-[#faede3] hover:bg-[#f5d9c2] text-[#b85c1f] border border-[#f5d9c2] rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Start Prep
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(orderId, 'ready')}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(orderId, 'completed')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => {
                                if (window.confirm('Cancel this order?')) {
                                  handleStatusChange(orderId, 'cancelled');
                                }
                              }}
                              className="p-1.5 text-[#a89688] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Cancel Order"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-[#786c65] hover:text-[#b85c1f] hover:bg-[#f5efe6] rounded-xl transition cursor-pointer"
                            title="View Customer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Customer & Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdccd] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-[#a89688] hover:text-[#2e241f] p-1.5 rounded-xl hover:bg-[#faf7f2] cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#b85c1f] to-[#ea8e47] text-white flex items-center justify-center shadow-md">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-[#2e241f]">
                    {selectedOrder.orderNumber || `#${selectedOrder.orderId || String(selectedOrder._id || selectedOrder.id).slice(-6)}`}
                  </h2>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-xs text-[#786c65] mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="bg-[#faf7f2] border border-[#ebdccd] rounded-2xl p-4 mb-5 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#b85c1f]">
                Customer & Table Information
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#786c65] block font-medium">Customer Name:</span>
                  <span className="text-[#2e241f] font-bold">
                    {selectedOrder.customerName || selectedOrder.user?.name || 'Walk-in Guest'}
                  </span>
                </div>
                <div>
                  <span className="text-[#786c65] block font-medium">Phone:</span>
                  <span className="text-[#2e241f] font-bold">
                    {selectedOrder.customerPhone || selectedOrder.user?.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[#786c65] block font-medium">Email:</span>
                  <span className="text-[#2e241f] font-medium">
                    {selectedOrder.customerEmail || selectedOrder.user?.email || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[#786c65] block font-medium">Dining Mode:</span>
                  <span className="text-[#2e241f] font-bold capitalize">
                    {selectedOrder.orderType === 'dine-in' || selectedOrder.tableNumber
                      ? `Table #${selectedOrder.tableNumber}`
                      : 'Takeaway (Counter Pickup)'}
                  </span>
                </div>
              </div>
              {selectedOrder.deliveryAddress && !selectedOrder.deliveryAddress.startsWith('Table') && (
                <div className="pt-2 border-t border-[#ebdccd] text-xs">
                  <span className="text-[#786c65] block font-medium">Pickup / Order Note:</span>
                  <span className="text-[#2e241f]">{selectedOrder.deliveryAddress}</span>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="pt-2 border-t border-[#ebdccd] text-xs">
                  <span className="text-[#b85c1f] font-bold block">Chef Note / Special Instructions:</span>
                  <span className="text-[#2e241f] italic">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3 mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#b85c1f]">
                Items Ordered
              </div>
              <div className="border border-[#ebdccd] rounded-2xl divide-y divide-[#ebdccd] bg-white">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#2e241f]">
                        {item.quantity}x {item.name}
                      </div>
                      {item.notes && <div className="text-[#786c65] text-[11px] italic">{item.notes}</div>}
                    </div>
                    <div className="text-right font-bold text-[#b85c1f]">
                      ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#2e241f] px-1 pt-1">
                <span>Total Amount:</span>
                <span className="text-[#b85c1f] text-xl font-bold">
                  ₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-[#ebdccd]">
              {/* WhatsApp Notification Button */}
              {(selectedOrder.customerPhone || selectedOrder.user?.phone) && (
                <a
                  href={createCustomerWhatsAppLink(
                    selectedOrder.customerPhone || selectedOrder.user?.phone,
                    selectedOrder,
                    selectedOrder.status
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Update</span>
                </a>
              )}

              {/* Status progression button */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'preparing')}
                  className="flex-1 py-3 px-4 bg-[#b85c1f] hover:bg-[#a35017] text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  Start Preparing
                </button>
              )}
              {selectedOrder.status === 'preparing' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'ready')}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  Mark Order Ready
                </button>
              )}
              {selectedOrder.status === 'ready' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'completed')}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  Complete Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
