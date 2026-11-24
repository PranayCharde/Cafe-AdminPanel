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

    const dineInCount = validOrders.filter((o) => o.orderType === 'dine-in').length;
    const deliveryCount = validOrders.length - dineInCount;

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
      deliveryCount,
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-amber-500" />
            Performance & Sales Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time business insights, dining breakdowns, and bestselling dishes
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            ${metrics.totalRev.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>Across {metrics.validOrdersCount} completed orders</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">
            ${metrics.avgOrderValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Per paying customer ticket
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Dine-In QR Ratio</span>
            <Armchair className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {metrics.validOrdersCount > 0
              ? Math.round((metrics.dineInCount / metrics.validOrdersCount) * 100)
              : 0}
            %
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.dineInCount} dine-in vs {metrics.deliveryCount} takeaway
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Table Occupancy</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {Math.round(metrics.tableUtilRate)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.occupiedTables} of {tables.length} tables currently seated
          </div>
        </div>
      </div>

      {/* Grid: Top Sellers & Order Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Bestselling Menu Items
            </h2>
            <span className="text-xs text-slate-400">By quantity sold</span>
          </div>

          {metrics.topItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
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
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {item.count} sold (${item.revenue.toFixed(2)})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                Dine-In Table vs Delivery Channel
              </h2>
              <span className="text-xs text-slate-400">Order Volume</span>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    In-Store Table QR Orders
                  </span>
                  <span>{metrics.dineInCount} orders</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
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
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    Takeaway & Online Delivery
                  </span>
                  <span>{metrics.deliveryCount} orders</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.validOrdersCount > 0
                          ? (metrics.deliveryCount / metrics.validOrdersCount) * 100
                          : 50
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Channel Insights:</div>
            <p>
              Direct QR-table orders streamline table turnover by letting diners order and re-order without waiting for staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

