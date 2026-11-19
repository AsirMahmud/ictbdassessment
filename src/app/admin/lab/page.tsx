"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Microscope, Syringe, Printer, Activity, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminLabPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [labWorklist, setLabWorklist] = useState<any[]>([]);
  const [activeItemForEntry, setActiveItemForEntry] = useState<any>(null);
  const [parameterInputs, setParameterInputs] = useState<Record<string, any>>({});
  const [selectedSampleForBarcode, setSelectedSampleForBarcode] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [smpList, workList] = await Promise.all([
        fetchApi<any[]>("/samples"),
        fetchApi<any[]>("/lab/worklist"),
      ]);
      setSamples(smpList);
      setLabWorklist(workList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCollectSample = async (sampleId: string) => {
    setLoading(true);
    try {
      await fetchApi(`/samples/${sampleId}/collect`, {
        method: "POST",
        body: JSON.stringify({})
      });
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResults = async () => {
    if (!activeItemForEntry) return;
    setLoading(true);
    try {
      const paramsPayload = activeItemForEntry.parameters_template.map((pt: any) => ({
        parameter_id: pt.id,
        parameter_name: pt.name,
        numeric_value: parameterInputs[pt.name] !== undefined && parameterInputs[pt.name] !== "" ? Number(parameterInputs[pt.name]) : null,
        unit: pt.unit,
        ref_range: pt.ref_range_text || `${pt.ref_min} - ${pt.ref_max}`
      }));

      await fetchApi("/lab/results", {
        method: "POST",
        body: JSON.stringify({
          order_item_id: activeItemForEntry.order_item_id,
          technician_name: "Alex Vance, DMLT",
          parameters: paramsPayload,
          remarks: "Analytical investigation verified on automated analyzer."
        })
      });

      setActiveItemForEntry(null);
      setParameterInputs({});
      loadData();
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Clinical Laboratory & Analytical Workbench"
        subtitle="Phlebotomy specimen accessioning, thermal barcode tracking, and automated parameter flagging"
      />

      <div className="p-6 sm:p-8 space-y-8">
        {/* Step 1: Phlebotomy Specimen Tracking */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Syringe className="w-4 h-4 text-rose-500" />
                <span>Phlebotomy Specimen Collection & Barcode Counter</span>
              </h3>
              <p className="text-xs text-slate-400">Specimen tubes requiring draw and labeling</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
              {samples.length} Specimen Tubes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {samples.map((s) => (
              <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900 text-sm">{s.barcode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-800"
                        : s.status === "COLLECTED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-800">{s.sample_type}</p>
                  <p className="text-[11px] text-slate-500">Color: {s.tube_color}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => setSelectedSampleForBarcode(s)}
                    className="text-teal-700 font-bold text-xs hover:underline flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Label</span>
                  </button>

                  {s.status === "PENDING" && (
                    <button
                      onClick={() => handleCollectSample(s.id)}
                      disabled={loading}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      Collect Specimen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Lab Analytical Workbench Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Analytical Queues (Technician Workbench)</span>
              </h3>
              <p className="text-xs text-slate-400">Enter measured values and check biological reference intervals</p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-full border border-teal-200">
              {labWorklist.length} Investigations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Investigation</th>
                  <th className="p-3.5">Specimen</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Parameter Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labWorklist.map((lw) => (
                  <tr key={lw.order_item_id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{lw.order_number}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">{lw.patient_name}</span>
                      <span className="block text-[11px] text-slate-400">{lw.patient_uhid}</span>
                    </td>
                    <td className="p-3.5 font-bold text-teal-800">{lw.test_name}</td>
                    <td className="p-3.5 text-slate-600">{lw.sample_type}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lw.has_results ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lw.has_results ? "RESULTS LOGGED" : "PENDING RESULTS"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setActiveItemForEntry(lw);
                          const init: Record<string, any> = {};
                          if (lw.entered_values) {
                            lw.entered_values.forEach((ev: any) => {
                              init[ev.parameter_name] = ev.numeric_value ?? ev.text_value ?? "";
                            });
                          }
                          setParameterInputs(init);
                        }}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm"
                      >
                        {lw.has_results ? "Edit Values" : "Enter Values"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Lab Result Entry */}
        {activeItemForEntry && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Enter Observed Values</h3>
                  <p className="text-xs text-teal-700 font-bold">
                    {activeItemForEntry.test_name} — {activeItemForEntry.patient_name}
                  </p>
                </div>
                <button onClick={() => setActiveItemForEntry(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="space-y-3">
                {activeItemForEntry.parameters_template.map((pt: any) => (
                  <div key={pt.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{pt.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Biological Ref: {pt.ref_min} - {pt.ref_max} {pt.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Measured value..."
                        value={parameterInputs[pt.name] ?? ""}
                        onChange={(e) =>
                          setParameterInputs({
                            ...parameterInputs,
                            [pt.name]: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-600 w-12">{pt.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setActiveItemForEntry(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResults}
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow"
                >
                  Save & Calculate Flags
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Barcode Preview */}
        {selectedSampleForBarcode && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="border border-dashed border-slate-300 p-4 rounded-2xl bg-slate-50 space-y-2">
                <p className="font-mono font-bold text-lg text-slate-900">{selectedSampleForBarcode.barcode}</p>
                <div className="w-full h-10 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] tracking-widest font-mono">
                  ||||||| | ||||| |||| || ||||||
                </div>
                <p className="text-xs font-bold text-slate-800">{selectedSampleForBarcode.sample_type}</p>
                <p className="text-[10px] text-slate-400">Standard 50mm x 25mm Thermal Label</p>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setSelectedSampleForBarcode(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setSelectedSampleForBarcode(null);
                  }}
                  className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Print Label
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
