import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Customer } from '../../types';
import { parseCSVContent } from '../../utils/crmValidation';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (customers: Partial<Customer>[]) => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<Partial<Customer>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const { data, errors } = parseCSVContent(content);
      setParsedData(data);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleHeader = 'Name,Company,Email,Phone,Status,Deal Value,Industry,Source\n';
    const sampleRow1 = 'Alice Cooper,Acme Corp,alice@acme.com,555-0192,active,25000,Technology,Inbound\n';
    const sampleRow2 = 'Bob Smith,Smith LLC,bob@smith.com,555-0143,lead,12000,Finance,Referral\n';
    const blob = new Blob([sampleHeader + sampleRow1 + sampleRow2], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cherryflow_sample_customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onImportSuccess(parsedData);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Import Customers via CSV</h2>
              <p className="text-xs text-zinc-500">
                Bulk upload client records from external CRMs or spreadsheets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar: Download Sample CSV */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
          <span className="text-zinc-600 dark:text-zinc-400">Need a template to format your file?</span>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            <Download size={14} /> Download Sample CSV
          </button>
        </div>

        {/* Drag and Drop File Upload Area */}
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-rose-500/50 transition-colors bg-zinc-50/50 dark:bg-zinc-800/30">
          <Upload size={32} className="mx-auto text-zinc-400 mb-2" />
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {fileName ? `Selected file: ${fileName}` : 'Click to select CSV file from your device'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Supports standard CSV with headers (Name, Email, Company, etc.)</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Error / Warning Notices */}
        {parseErrors.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={15} /> CSV Parsing Warnings:
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5">
              {parseErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview Table */}
        {parsedData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} /> Ready to import {parsedData.length} records:
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {parsedData.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-semibold">{row.name}</td>
                      <td className="py-2 px-3 text-zinc-500">{row.email}</td>
                      <td className="py-2 px-3">{row.company}</td>
                      <td className="py-2 px-3 capitalize">{row.status}</td>
                      <td className="py-2 px-3 font-semibold">${row.dealValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <p className="p-2 text-center text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40">
                  + {parsedData.length - 10} more records
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isProcessing && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>Import {parsedData.length} Customers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
