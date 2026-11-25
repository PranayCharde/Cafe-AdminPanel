import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Armchair,
  Award,
  RefreshCw,
  Calendar,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { orderApi, tableApi, menuApi } from '../lib/api';

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, tableRes, prodRes] = await Promise.all([
        orderApi.getAll(),
        tableApi.getAll(),
        menuApi.getProducts()
      ]);
      setOrders(orderRes.data?.data || []);
      setTables(tableRes.data?.data || []);
      setProducts(prodRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? totalRev / validOrders.length : 0;

    const dineInCount = validOrders.filter((o) => o.orderType === 'dine-in' || !!o.tableNumber).length;
    const takeawayCount = validOrders.length - dineInCount;

    // Item popularity map
    const itemMap = {};
    validOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.name || 'Unknown Item';
        if (!itemMap[key]) {
          itemMap[key] = { count: 0, revenue: 0 };
        }
        itemMap[key].count += it.quantity || 1;
        itemMap[key].revenue += (it.quantity || 1) * (Number(it.price) || 0);
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tables utilization
    const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
    const tableUtilRate = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

    return {
      totalRev,
      ordersCount: orders.length,
      validOrdersCount: validOrders.length,
      avgOrderValue,
      dineInCount,
      takeawayCount,
      topItems,
      occupiedTables,
      tableUtilRate
    };
  }, [orders, tables]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2e241f] flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#b85c1f]" />
            Performance & Sales Analytics
          </h1>
          <p className="text-xs text-[#786c65] mt-1">
            Real-time business insights, dining breakdowns, and bestselling dishes
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 bg-white hover:bg-[#f5efe6] text-[#2e241f] rounded-xl border border-[#ebdccd] shadow-xs transition flex items-center gap-2 text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#b85c1f] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between text-[#786c65] text-xs font-semibold mb-2">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-[#b85c1f]" />
          </div>
          <div className="text-3xl font-extrabold text-[#2e241f]">
            ₹{metrics.totalRev.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <span>Across {metrics.validOrdersCount} completed orders</span>
          </div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between text-[#786c65] text-xs font-semibold mb-2">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-[#b85c1f]" />
          </div>
          <div className="text-3xl font-extrabold text-[#b85c1f]">
            ₹{metrics.avgOrderValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#786c65] mt-1">
            Per paying customer ticket
          </div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between text-[#786c65] text-xs font-semibold mb-2">
            <span>Dine-In QR Ratio</span>
            <Armchair className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {metrics.validOrdersCount > 0
              ? Math.round((metrics.dineInCount / metrics.validOrdersCount) * 100)
              : 0}
            %
          </div>
          <div className="text-[11px] text-[#786c65] mt-1">
            {metrics.dineInCount} dine-in vs {metrics.takeawayCount} takeaway
          </div>
        </div>

        <div className="bg-white border border-[#ebdccd] rounded-2xl p-5 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between text-[#786c65] text-xs font-semibold mb-2">
            <span>Table Occupancy</span>
            <Users className="w-4 h-4 text-[#ea8e47]" />
          </div>
          <div className="text-3xl font-extrabold text-[#ea8e47]">
            {Math.round(metrics.tableUtilRate)}%
          </div>
          <div className="text-[11px] text-[#786c65] mt-1">
            {metrics.occupiedTables} of {tables.length} tables seated
          </div>
        </div>
      </div>

      {/* Grid: Top Sellers & Order Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <div className="bg-white border border-[#ebdccd] rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#2e241f] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#b85c1f]" />
              Bestselling Menu Items
            </h2>
            <span className="text-xs text-[#786c65]">By quantity sold</span>
          </div>

          {metrics.topItems.length === 0 ? (
            <div className="py-12 text-center text-[#786c65] text-xs">
              No item orders recorded yet to calculate top sellers.
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.topItems.map((item, idx) => {
                const maxCount = metrics.topItems[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={item.name} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2e241f] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#faf7f2] border border-[#ebdccd] text-[#b85c1f] font-extrabold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-[#786c65] font-mono">
                        {item.count} sold (₹{item.revenue.toFixed(2)})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#faf7f2] border border-[#ebdccd] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#b85c1f] to-[#ea8e47] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Channel & Dining Split */}
        <div className="bg-white border border-[#ebdccd] rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#2e241f] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#b85c1f]" />
                Dine-In Table vs Takeaway Pickup
              </h2>
              <span className="text-xs text-[#786c65]">Order Volume</span>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs text-[#2e241f] mb-1.5 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    In-Store Table QR Orders
                  </span>
                  <span>{metrics.dineInCount} orders</span>
                </div>
                <div className="h-3 w-full bg-[#faf7f2] border border-[#ebdccd] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.validOrdersCount > 0
                          ? (metrics.dineInCount / metrics.validOrdersCount) * 100
                          : 50
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#2e241f] mb-1.5 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#b85c1f]" />
                    Takeaway & Counter Pickup
                  </span>
                  <span>{metrics.takeawayCount} orders</span>
                </div>
                <div className="h-3 w-full bg-[#faf7f2] border border-[#ebdccd] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#b85c1f] rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.validOrdersCount > 0
                          ? (metrics.takeawayCount / metrics.validOrdersCount) * 100
                          : 50
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#ebdccd] text-xs text-[#786c65] space-y-1">
            <div className="font-bold text-[#2e241f]">Channel Insights:</div>
            <p>
              Direct QR-table orders streamline table turnover by letting diners order and re-order without waiting for staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
