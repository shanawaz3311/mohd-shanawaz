import React, { useState } from 'react';
import { useInvoices } from '../contexts/InvoiceContext';
import { useToast } from '../contexts/ToastContext';
import { Invoice, Emi, EmiInstallment, EmiInstallmentStatus } from '../types';
import { CloseIcon } from './icons';

interface EmiApplicationModalProps {
    onClose: () => void;
}

const EmiApplicationModal: React.FC<EmiApplicationModalProps> = ({ onClose }) => {
    const { getInvoiceByBillNo, updateInvoice } = useInvoices();
    const { showToast } = useToast();

    const [billNo, setBillNo] = useState('');
    const [error, setError] = useState('');
    const [foundInvoice, setFoundInvoice] = useState<Invoice | null>(null);

    const [tenure, setTenure] = useState<8 | 9 | 10 | 11>(8);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    
    const interestRate = 12.5; // Fixed interest rate

    const handleSearch = () => {
        setError('');
        setFoundInvoice(null);
        if (!billNo.trim()) {
            setError('Please enter a Bill No.');
            return;
        }
        const invoice = getInvoiceByBillNo(billNo.trim());
        if (!invoice) {
            setError(`Invoice with Bill No. "${billNo}" not found.`);
            return;
        }
        if (!invoice.emiEnabled) {
            setError('This invoice is not marked for an EMI option.');
            return;
        }
        if (invoice.emiDetails) {
            setError('This invoice already has an EMI schedule processed.');
            return;
        }
        setFoundInvoice(invoice);
    };

    const handleGenerateAndSaveEmi = () => {
        if (!foundInvoice) return;

        const principal = foundInvoice.grandTotal;
        const monthlyRate = interestRate / 12 / 100;
        const numberOfInstallments = tenure;

        const emiNumerator = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfInstallments);
        const emiDenominator = Math.pow(1 + monthlyRate, numberOfInstallments) - 1;
        
        const monthlyAmount = emiDenominator > 0 ? emiNumerator / emiDenominator : principal / numberOfInstallments;

        const newEmi: Emi = {
            tenure,
            interestRate,
            startDate,
            installments: [],
        };

        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            showToast("Invalid start date provided.", 'error');
            return; 
        }

        for (let i = 0; i < numberOfInstallments; i++) {
            const installmentDate = new Date(start);
            installmentDate.setDate(1);
            installmentDate.setMonth(start.getMonth() + i);
            
            newEmi.installments.push({
                id: crypto.randomUUID(),
                month: installmentDate.getMonth() + 1,
                year: installmentDate.getFullYear(),
                amount: monthlyAmount,
                status: EmiInstallmentStatus.PENDING,
            });
        }
        
        const updatedInvoice = { ...foundInvoice, emiDetails: newEmi };
        updateInvoice(updatedInvoice);
        showToast(`EMI schedule created and saved permanently for Bill No. ${foundInvoice.billNo}`, 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-light border border-white/20 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold">Process EMI Application</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Search Section */}
                    <div className="p-4 bg-white/5 rounded-lg">
                         <h3 className="font-semibold mb-2">Find Invoice</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={billNo}
                                onChange={(e) => setBillNo(e.target.value)}
                                placeholder="Enter Bill No. to search"
                                className="input-field w-full"
                            />
                            <button onClick={handleSearch} className="py-2 px-4 rounded-lg bg-cyan-600/50 hover:bg-cyan-600/75 border border-cyan-500/80 font-bold transition-all">
                                Search
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>

                    {/* EMI Form Section */}
                    {foundInvoice && (
                        <div className="space-y-4 animate-fade-in">
                             <div className="p-4 bg-white/10 rounded-lg">
                                 <h3 className="font-semibold text-lg text-brand-accent mb-2">Application Details</h3>
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                     <p>Customer:</p><p className="font-medium">{foundInvoice.customerName}</p>
                                     <p>Bill No:</p><p className="font-medium font-mono">{foundInvoice.billNo}</p>
                                     <p>Amount to Finance:</p><p className="font-bold text-lg text-green-400">₹{foundInvoice.grandTotal.toFixed(2)}</p>
                                 </div>
                             </div>

                             <h3 className="font-semibold pt-4 border-t border-white/10">Setup EMI Schedule</h3>
                            <div>
                                <label className="block text-sm">EMI Tenure (Months)</label>
                                <select value={tenure} onChange={(e) => setTenure(Number(e.target.value) as 8|9|10|11)} className="input-field mt-1 w-full">
                                    <option value={8}>8 Months</option>
                                    <option value={9}>9 Months</option>
                                    <option value={10}>10 Months</option>
                                    <option value={11}>11 Months</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm">EMI Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field mt-1 w-full" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/30 border-t border-white/20 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600/50 hover:bg-gray-600/75 border border-gray-500/80 transition-all">Cancel</button>
                    <button 
                        type="button" 
                        onClick={handleGenerateAndSaveEmi} 
                        disabled={!foundInvoice}
                        className="py-2 px-4 rounded-lg bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate & Attach Schedule
                    </button>
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
                     @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default EmiApplicationModal;