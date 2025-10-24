import React, { useState, useMemo } from 'react';
import { Invoice, Emi, EmiInstallment, EmiInstallmentStatus } from '../types';
import { useInvoices } from '../contexts/InvoiceContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon } from './icons';

interface EmiDetailsProps {
    invoice: Invoice;
    onClose: () => void;
}

const EmiDetails: React.FC<EmiDetailsProps> = ({ invoice, onClose }) => {
    const { updateInvoice } = useInvoices();
    const { showToast } = useToast();
    const [emiData, setEmiData] = useState<Emi | undefined>(invoice.emiDetails);

    const financeAmount = invoice.grandTotal;
    const allEmisPaid = useMemo(() => {
        if (!emiData) return false;
        const nonCancelled = emiData.installments.filter(i => i.status !== EmiInstallmentStatus.CANCELLED);
        if (nonCancelled.length === 0) return false;
        return nonCancelled.every(i => i.status === EmiInstallmentStatus.PAID);
    }, [emiData]);


    const generateNocNumber = (): string => {
        return Math.random().toString().slice(2, 14);
    };

    const handleTogglePaid = (installmentId: string) => {
        if (!emiData) return;
        const updatedInstallments = emiData.installments.map(inst =>
            inst.id === installmentId ? { ...inst, status: inst.status === EmiInstallmentStatus.PAID ? EmiInstallmentStatus.PENDING : EmiInstallmentStatus.PAID } : inst
        );
        
        const nonCancelled = updatedInstallments.filter(i => i.status !== EmiInstallmentStatus.CANCELLED);
        const allArePaid = nonCancelled.length > 0 && nonCancelled.every(i => i.status === EmiInstallmentStatus.PAID);

        let newNocNumber = emiData.nocNumber;

        if (allArePaid && !emiData.nocNumber) {
            newNocNumber = generateNocNumber();
        }

        setEmiData({ ...emiData, installments: updatedInstallments, nocNumber: newNocNumber });
    };

    const handleSave = () => {
        if (!emiData) return;
        const updatedInvoice = { ...invoice, emiDetails: emiData };
        updateInvoice(updatedInvoice);
        showToast('EMI details saved permanently.', 'success');
        onClose();
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById(`emi-print-content`);
        if (printContent) {
            const newWindow = window.open('', '', 'width=800,height=600');
            newWindow?.document.write(`
                <html>
                    <head>
                        <title>Print EMI Details - Bill ${invoice.billNo}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style> 
                            body { 
                                -webkit-print-color-adjust: exact; 
                                color-adjust: exact;
                                font-family: sans-serif;
                            } 
                            @page {
                                size: A4;
                                margin: 20mm;
                            }
                            .print-header {
                                text-align: center;
                                margin-bottom: 2rem;
                            }
                            .print-header h1 {
                                font-size: 2rem;
                                color: #0072b5;
                                font-weight: bold;
                            }
                            .print-header p {
                                font-size: 1rem;
                                color: #4b5563;
                            }
                            @media print {
                                .completion-message {
                                    background-color: #e0f2fe !important;
                                    border: 2px solid #0ea5e9 !important;
                                    color: #0369a1 !important;
                                    padding: 1rem;
                                    text-align: center;
                                    font-weight: bold;
                                    font-size: 1.25rem;
                                    border-radius: 0.5rem;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-header">
                           <h1>BAJAJ EMI SCHEDULE</h1>
                           <p>Bill No: ${invoice.billNo} | Customer: ${invoice.customerName}</p>
                        </div>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            newWindow?.document.close();
            newWindow?.print();
        }
    };
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-light border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold">EMI Details for Bill No: {invoice.billNo}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {!emiData ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/5 rounded-lg">
                            <svg className="w-16 h-16 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h3 className="text-xl font-semibold text-yellow-300">EMI Application Pending</h3>
                            <p className="text-gray-300 mt-2 max-w-sm">This invoice has been marked for an EMI option. The application is currently awaiting processing by the Principal.</p>
                        </div>
                    ) : (
                        <div>
                            <div id="emi-print-content">
                                <div className="p-4 bg-white/5 rounded-lg mb-4 text-center">
                                    <h3 className="text-lg font-semibold">EMI Schedule Summary</h3>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        <p>Financed Amount: <span className="font-bold">₹{financeAmount.toFixed(2)}</span></p>
                                        <p>Tenure: <span className="font-bold">{emiData.tenure} Months</span></p>
                                        <p>Interest Rate: <span className="font-bold">{emiData.interestRate}% p.a.</span></p>
                                        <p>Monthly EMI: <span className="font-bold">₹{emiData.installments[0]?.amount.toFixed(2)}</span></p>
                                    </div>
                                </div>
                                {allEmisPaid && (
                                    <div className="p-4 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-center font-bold mb-4 completion-message">
                                        YOUR EMI HAS BEEN ALL COMPLETED
                                        {emiData.nocNumber && (
                                            <p className="text-sm font-mono mt-2 tracking-widest">NOC No: {emiData.nocNumber}</p>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {emiData.installments.map(inst => (
                                        <div key={inst.id} className={`flex justify-between items-center p-3 rounded-lg ${inst.status === EmiInstallmentStatus.PAID ? 'bg-green-500/20' : inst.status === EmiInstallmentStatus.CANCELLED ? 'bg-red-500/20 opacity-60' : 'bg-white/5'}`}>
                                            <div>
                                                <p className="font-semibold">{monthNames[inst.month-1]} {inst.year}</p>
                                                <p className="text-sm text-gray-300">Amount: ₹{inst.amount.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    inst.status === EmiInstallmentStatus.PAID ? 'bg-green-500' : 
                                                    inst.status === EmiInstallmentStatus.CANCELLED ? 'bg-red-500' : 'bg-yellow-500'
                                                }`}>
                                                    {inst.status.toUpperCase()}
                                                </span>
                                                {inst.status !== EmiInstallmentStatus.CANCELLED && (
                                                    <button onClick={() => handleTogglePaid(inst.id)} className="text-sm py-1 px-2 border rounded-md hover:bg-white/10 no-print">
                                                        Mark as {inst.status === EmiInstallmentStatus.PAID ? 'Pending' : 'Paid'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/30 border-t border-white/20 flex justify-end gap-4 flex-wrap">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600/50 hover:bg-gray-600/75 border border-gray-500/80 transition-all">Close</button>
                    {emiData && <button type="button" onClick={handlePrint} className="py-2 px-4 rounded-lg bg-blue-600/50 hover:bg-blue-600/75 border border-blue-500/80 font-bold transition-all">Print</button>}
                    {emiData && <button type="button" onClick={handleSave} className="py-2 px-4 rounded-lg bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 font-bold transition-all">Save Changes</button>}
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

export default EmiDetails;