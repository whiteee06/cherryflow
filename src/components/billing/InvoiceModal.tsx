import React from 'react';
import { BillingInvoice } from '../../types';
import { X, Printer, Download, CheckCircle2, Building2, FileText, Globe } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  workspaceName?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  workspaceName = 'CherryFlow Workspace',
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const textData = `
==================================================
              CHERRYFLOW SAAS INVOICE
==================================================
Invoice Number : ${invoice.invoiceNumber}
Date           : ${new Date(invoice.createdAt).toLocaleDateString()}
Status         : ${invoice.status.toUpperCase()}
Tax ID         : ${invoice.gstVatId || 'N/A'}

CUSTOMER:
${workspaceName}
${invoice.billingAddress?.line1 || ''}
${invoice.billingAddress?.city || ''}, ${invoice.billingAddress?.state || ''} ${invoice.billingAddress?.postalCode || ''}
${invoice.billingAddress?.country || ''}

LINE ITEMS:
${invoice.lineItems.map((item) => `- ${item.description} (x${item.quantity}): $${item.amount.toFixed(2)}`).join('\n')}

Subtotal : $${invoice.amount.toFixed(2)}
Tax      : $${invoice.taxAmount.toFixed(2)}
TOTAL    : $${(invoice.amount + invoice.taxAmount).toFixed(2)} USD
==================================================
Thank you for subscribing to CherryFlow SaaS!
    `;

    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer print:hidden"
        >
          <X size={20} />
        </button>

        {/* Printable Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-sm">
                CF
              </div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">CherryFlow Inc.</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">100 Tech Plaza, San Francisco, CA 94105</p>
            <p className="text-xs text-zinc-500">support@cherryflow.io · EIN: 88-1920412</p>
          </div>

          <div className="sm:text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider inline-flex items-center gap-1">
              <CheckCircle2 size={12} /> {invoice.status}
            </span>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-2">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-xs text-zinc-500">
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Addresses & Tax details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <p className="font-bold text-zinc-400 uppercase tracking-wider mb-1">Billed To:</p>
            <p className="font-bold text-zinc-900 dark:text-white text-sm">{workspaceName}</p>
            {invoice.billingAddress && (
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {invoice.billingAddress.line1}
                <br />
                {invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.postalCode}
                <br />
                {invoice.billingAddress.country}
              </p>
            )}
          </div>

          <div>
            <p className="font-bold text-zinc-400 uppercase tracking-wider mb-1">Tax & Payment Info:</p>
            <p className="text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">GST/VAT Reg:</span> {invoice.gstVatId || 'VAT-US992019482'}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 mt-1">
              <span className="font-semibold">Payment Method:</span> Credit Card (Stripe)
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 mt-1">
              <span className="font-semibold">Currency:</span> USD ($)
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx} className="text-zinc-800 dark:text-zinc-200">
                  <td className="py-3 font-medium">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right font-mono font-bold">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal & Total */}
        <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono">${invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Estimated Tax (9%)</span>
              <span className="font-mono">${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span>Total Paid</span>
              <span className="font-mono text-rose-500">
                ${(invoice.amount + invoice.taxAmount).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Printable Controls */}
        <div className="pt-6 flex items-center justify-between print:hidden">
          <p className="text-[11px] text-zinc-400">Questions? Contact billing@cherryflow.io</p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print Invoice
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              Download Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
