import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Clock, 
  TrendingDown, 
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  initialStock: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  lastUpdated: string;
}

interface InventoryLog {
  id: string;
  orderNumber: string;
  patientName: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [summary, setSummary] = useState<any>({ totalItems: 6, lowStockCount: 0, totalStockValue: 0 });
  const [loading, setLoading] = useState(false);
  const [refillModalItem, setRefillModalItem] = useState<InventoryItem | null>(null);
  const [refillQty, setRefillQty] = useState<number>(50);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      if (res.data) {
        setItems(res.data.items || []);
        setLogs(res.data.logs || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.log('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRefillStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillModalItem) return;

    try {
      await axios.post('http://localhost:5000/api/inventory/refill', {
        itemId: refillModalItem.id,
        quantity: refillQty
      });
      alert(`Successfully added +${refillQty} ${refillModalItem.unit} to ${refillModalItem.name}!`);
      setRefillModalItem(null);
      fetchInventory();
    } catch (err) {
      alert('Failed to refill stock. Check backend server.');
    }
  };

  const lowStockItems = items.filter(i => i.currentStock <= i.reorderLevel);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & KPI CARDS */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Laboratory Reagent & Consumables Inventory</h3>
          <p className="text-xs text-slate-500">Auto-deducts vials & test reagents when patient orders are booked</p>
        </div>
        <button 
          onClick={fetchInventory}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tracked Items</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{items.length}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Vials, kits & reagents</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Low Stock Alerts</p>
            <h4 className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {lowStockItems.length}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lowStockItems.length > 0 ? 'Reorder needed immediately' : 'All items optimal'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Stock Value</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">₹{summary.totalStockValue?.toLocaleString('en-IN') || '0'}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Estimated lab asset</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Auto-Deductions</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">
              {logs.filter(l => l.action === 'AUTO_DEDUCT').length}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Tests processed</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* LOW STOCK BANNER ALERT (IF APPLICABLE) */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 text-rose-800">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <h5 className="font-bold text-xs sm:text-sm">Attention: {lowStockItems.length} Reagents/Vials are running low!</h5>
              <p className="text-xs text-rose-600">
                {lowStockItems.map(i => `${i.name} (${i.currentStock} ${i.unit} left)`).join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAGENTS INVENTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Real-Time Stock Catalog</h4>
            <p className="text-xs text-slate-400">Automatic decrement triggered on patient registration</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            Auto-Sync: Active
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Item Name / Code</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Available Stock</th>
              <th className="py-3 px-4">Reorder Level</th>
              <th className="py-3 px-4">Unit Cost</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isLow = item.currentStock <= item.reorderLevel;
              const pct = Math.min(100, Math.round((item.currentStock / item.initialStock) * 100));

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</p>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400">({pct}%)</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isLow ? 'bg-rose-500' : pct < 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 text-xs">
                    ₹{item.costPerUnit.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLow 
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isLow ? '⚠️ LOW STOCK' : '● OPTIMAL'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => {
                        setRefillModalItem(item);
                        setRefillQty(50);
                      }}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition border border-blue-200 cursor-pointer"
                    >
                      + Refill
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. REAL-TIME AUTO-DEDUCTION CONSUMPTION LOG */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm">Real-Time Inventory Consumption Audit Trail</h4>
          </div>
          <span className="text-xs text-slate-400">Live test auto-deductions</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No consumption events logged yet. Reagents will deduct when patients are registered.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 px-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    log.action === 'AUTO_DEDUCT' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {log.action === 'AUTO_DEDUCT' ? 'AUTO DEDUCT' : 'REFILL'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{log.orderNumber}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600">{log.patientName}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="font-medium text-slate-700">{log.details}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. REFILL STOCK POPUP MODAL */}
      {refillModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Refill Stock</h4>
                <p className="text-xs text-slate-500 mt-0.5">{refillModalItem.name}</p>
              </div>
              <button onClick={() => setRefillModalItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-slate-800">{refillModalItem.currentStock} {refillModalItem.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reorder Threshold:</span>
                <span className="font-mono text-slate-600">{refillModalItem.reorderLevel} {refillModalItem.unit}</span>
              </div>
            </div>

            <form onSubmit={handleRefillStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Add ({refillModalItem.unit})
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[25, 50, 100].map(val => (
                    <button 
                      type="button" 
                      key={val}
                      onClick={() => setRefillQty(val)}
                      className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                        refillQty === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={refillQty}
                  onChange={(e) => setRefillQty(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setRefillModalItem(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
