import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { CloseIcon, DocumentReportIcon } from './icons';

declare const jspdf: any;

interface ReportGeneratorProps {
    invoices: Invoice[];
    onClose: () => void;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ invoices, onClose }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const availableYears = useMemo(() => {
        const years = new Set(invoices.map(inv => new Date(inv.dateOfPurchase).getFullYear()));
        // FIX: Explicitly typing the sort parameters `a` and `b` as `number` resolves the arithmetic operation type error.
        return [...years].sort((a: number, b: number) => b - a);
    }, [invoices]);

    const generatePdf = (title: string, data: Invoice[], filename: string) => {
        if (data.length === 0) {
            alert(`No invoice data found for the selected period. Cannot generate report.`);
            return;
        }

        const doc = new jspdf.jsPDF();

        // Calculate summary
        const totalSales = data.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const totalDownPayment = data.reduce((sum, inv) => sum + inv.downPayment, 0);
        const totalFinanced = data.reduce((sum, inv) => sum + (inv.emiEnabled ? inv.grandTotal : 0), 0);
        const emiInvoices = data.filter(inv => inv.emiEnabled).length;
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor("#0072b5");
        doc.text("Bajaj Sales Report", 14, 22);
        doc.setFontSize(14);
        doc.setTextColor("#0f172a");
        doc.text(title, 14, 30);
        
        // Summary Box
        doc.setFontSize(12);
        doc.text("Report Summary", 14, 45);
        const summaryText = `
Total Invoices: ${data.length}
Total Sales: Rs. ${totalSales.toFixed(2)}
Total Down Payments: Rs. ${totalDownPayment.toFixed(2)}
Total Amount Financed (EMI): Rs. ${totalFinanced.toFixed(2)}
Invoices with EMI: ${emiInvoices} (${((emiInvoices / data.length) * 100).toFixed(1)}%)
        `;
        doc.setDrawColor("#e5e7eb");
        doc.roundedRect(14, 48, 182, 40, 3, 3, 'S');
        doc.text(summaryText, 20, 55);

        // Table
        const tableColumn = ["Bill No", "Customer", "Date", "Subtotal", "Down Pmt.", "Grand Total", "EMI"];
        const tableRows: (string | number)[][] = [];

        data.forEach(inv => {
            const invoiceData = [
                inv.billNo,
                inv.customerName.slice(0, 20),
                new Date(inv.dateOfPurchase).toLocaleDateString(),
                inv.subTotal.toFixed(2),
                inv.downPayment.toFixed(2),
                inv.grandTotal.toFixed(2),
                inv.emiEnabled ? 'Yes' : 'No'
            ];
            tableRows.push(invoiceData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            theme: 'grid',
            headStyles: { fillColor: '#0072b5' },
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor("#6b7280");
            doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
        }

        doc.save(filename);
    }

    const handleGenerateMonthly = () => {
        const filteredInvoices = invoices.filter(inv => {
            const date = new Date(inv.dateOfPurchase);
            return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
        });
        const reportTitle = `Monthly Report for ${monthNames[selectedMonth-1]} ${selectedYear}`;
        const filename = `Bajaj_Monthly_Report_${selectedYear}_${selectedMonth}.pdf`;
        generatePdf(reportTitle, filteredInvoices, filename);
    };

    const handleGenerateYearly = () => {
        const filteredInvoices = invoices.filter(inv => {
            const date = new Date(inv.dateOfPurchase);
            return date.getFullYear() === selectedYear;
        });
        const reportTitle = `Yearly Report for ${selectedYear}`;
        const filename = `Bajaj_Yearly_Report_${selectedYear}.pdf`;
        generatePdf(reportTitle, filteredInvoices, filename);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-light border border-white/20 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold">Generate Sales Report</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {/* Monthly Report */}
                    <div className="p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold text-lg mb-4 text-brand-accent">Monthly Report</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1">Year</label>
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="input-field w-full">
                                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                                    {availableYears.length === 0 && <option>{new Date().getFullYear()}</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Month</label>
                                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="input-field w-full">
                                    {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGenerateMonthly} className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 font-bold transition-all">
                            <DocumentReportIcon className="w-5 h-5"/> Generate Monthly PDF
                        </button>
                    </div>

                    {/* Yearly Report */}
                    <div className="p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold text-lg mb-4 text-green-400">Yearly Report</h3>
                        <div className="grid grid-cols-1">
                             <div>
                                <label className="block text-sm mb-1">Year</label>
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="input-field w-full">
                                     {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                                     {availableYears.length === 0 && <option>{new Date().getFullYear()}</option>}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGenerateYearly} className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-600/50 hover:bg-green-600/75 border border-green-500/80 font-bold transition-all">
                           <DocumentReportIcon className="w-5 h-5"/> Generate Yearly PDF
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-black/30 border-t border-white/20 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600/50 hover:bg-gray-600/75 border border-gray-500/80 transition-all">Close</button>
                </div>
                
                 <style>{`
                    .input-field {
                        background-color: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 0.375rem;
                        padding: 0.5rem 0.75rem;
                        color: white;
                    }
                    .input-field:focus {
                        outline: none;
                        border-color: #38bdf8;
                        box-shadow: 0 0 0 2px #38bdf840;
                    }
                     select.input-field option {
                        background-color: #1e293b;
                        color: white;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ReportGenerator;