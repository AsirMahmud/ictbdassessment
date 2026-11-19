"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Receipt, DollarSign, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await fetchApi<any[]>("/billing/invoices");
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleRecordPayment = async () => {
    if (!paymentModalInvoice || paymentAmount <= 0) return;
    setLoading(true);
    try {
      await fetchApi(`/billing/invoices/${paymentModalInvoice.id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(paymentAmount),
          payment_method: "CASH",
          notes: "Collected at front cashier desk"
        })
      });
      setPaymentModalInvoice(null);
      setPaymentAmount(0);
      loadInvoices();
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Billing & Cashier Ledger"
        subtitle="Manage diagnostic and consultation invoices, collect due payments, and print receipts"
      />

      <div className="p-6 sm:p-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>Master Invoicing Ledger</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{invoices.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Due Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Cashier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="p-4 text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-700">${inv.subtotal.toFixed(2)}</td>
                    <td className="p-4 text-slate-500">${inv.discount.toFixed(2)}</td>
                    <td className="p-4 font-bold text-slate-900">${inv.total.toFixed(2)}</td>
                    <td className="p-4 font-semibold text-emerald-700">${inv.paid.toFixed(2)}</td>
                    <td className="p-4 font-bold text-rose-600">${inv.due > 0 ? inv.due.toFixed(2) : "0.00"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === "PARTIALLY_PAID"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {inv.due > 0 ? (
                        <button
                          onClick={() => {
                            setPaymentModalInvoice(inv);
                            setPaymentAmount(inv.due);
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm"
                        >
                          Collect Due
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Collect Payment */}
        {paymentModalInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Record Due Collection</h4>
                  <p className="text-xs text-slate-500">{paymentModalInvoice.invoice_number}</p>
                </div>
                <button onClick={() => setPaymentModalInvoice(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total:</span>
                  <span className="font-bold text-slate-900">${paymentModalInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Settled:</span>
                  <span className="font-semibold text-emerald-700">${paymentModalInvoice.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                  <span>Remaining Due:</span>
                  <span className="font-bold text-rose-600">${paymentModalInvoice.due.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($)</label>
                <input
                  type="number"
                  max={paymentModalInvoice.due}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={loading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
