import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInvoices } from '../contexts/InvoiceContext';
import { useToast } from '../contexts/ToastContext';
import Clock from './Clock';
import { Invoice, UserRole, PaymentStatus } from '../types';
import InvoiceForm from './InvoiceForm';
import EmiDetails from './EmiDetails';
import PartnerDashboard from './PartnerDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import ReportGenerator from './ReportGenerator';
import ProductManager from './ProductManager';
import { CubeIcon } from './icons';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { invoices, deleteInvoice } = useInvoices();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [managingEmi, setManagingEmi] = useState<Invoice | null>(null);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isProductManagerVisible, setIsProductManagerVisible] = useState(false);

    const filteredInvoices = invoices.filter(invoice =>
        invoice.billNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePrint = (invoice: Invoice) => {
        const printContent = document.getElementById(`invoice-print-${invoice.id}`);
        if (printContent) {
            const newWindow = window.open('', '', 'width=800,height=600');
            newWindow?.document.write(`
                <html>
                    <head>
                        <title>Print Invoice</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style> body { -webkit-print-color-adjust: exact; } </style>
                    </head>
                    <body>${printContent.innerHTML}</body>
                </html>
            `);
            newWindow?.document.close();
            newWindow?.print();
        }
    };
    
    const handleDelete = (invoiceId: string) => {
        if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            deleteInvoice(invoiceId);
            showToast('Invoice deleted permanently.', 'success');
        }
    }

    const getStatusBadge = (status: PaymentStatus) => {
        const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
        switch (status) {
            case PaymentStatus.PAID:
                return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Paid</span>;
            case PaymentStatus.PARTIALLY_PAID:
                return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>Partially Paid</span>;
            case PaymentStatus.CANCELLED:
                return <span className={`${baseClasses} bg-red-500/20 text-red-400`}>Cancelled</span>;
            case PaymentStatus.PENDING:
            default:
                return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>Pending</span>;
        }
    };
    
    const renderEmployeeDashboard = () => (
        <>
            <main className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-xl font-semibold">Invoice Records</h2>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search by Bill No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        />
                         <button
                            onClick={() => setIsReportModalVisible(true)}
                            className="bg-purple-600/50 hover:bg-purple-600/75 border border-purple-500/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        >
                            Reports
                        </button>
                        <button
                            onClick={() => setIsProductManagerVisible(true)}
                            className="bg-gray-600/50 hover:bg-gray-600/75 border border-gray-500/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                        >
                           <CubeIcon/> Products
                        </button>
                        <button
                            onClick={() => { setEditingInvoice(null); setIsFormVisible(true); }}
                            className="bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        >
                            New Invoice
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-3">Bill No.</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Total Amount</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length > 0 ? filteredInvoices.map(invoice => (
                                <tr key={invoice.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-3 font-mono">
                                        {invoice.billNo}
                                        {invoice.emiEnabled && (
                                            <span className="ml-2 text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full align-middle">
                                                EMI
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">{invoice.customerName}</td>
                                    <td className="p-3">{new Date(invoice.dateOfPurchase).toLocaleDateString()}</td>
                                    <td className="p-3">{getStatusBadge(invoice.paymentStatus)}</td>
                                    <td className="p-3">
                                        {(() => {
                                            if (invoice.paymentStatus === PaymentStatus.CANCELLED) {
                                                return <span className="line-through text-gray-500">₹{invoice.grandTotal.toFixed(2)}</span>;
                                            }
                                            if (invoice.paymentStatus === PaymentStatus.PAID) {
                                                return <span className="font-bold text-green-400">Paid Off</span>;
                                            }

                                            const hasPaidEmi = invoice.emiEnabled && invoice.emiDetails?.installments.some(i => i.status === 'Paid');
                                            if (hasPaidEmi) {
                                                const totalInstallments = invoice.emiDetails!.installments.filter(i => i.status !== 'Cancelled').length;
                                                const paidCount = invoice.emiDetails!.installments.filter(i => i.status === 'Paid').length;
                                                const monthlyAmount = invoice.emiDetails!.installments[0]?.amount || 0;
                                                const remainingBalance = (totalInstallments - paidCount) * monthlyAmount;
                                                
                                                return (
                                                    <div>
                                                        <span className="text-sm line-through text-gray-500">
                                                            ₹{invoice.grandTotal.toFixed(2)}
                                                        </span>
                                                        <br />
                                                        <span className="font-bold text-green-400">
                                                            {remainingBalance > 0.01 ? `₹${remainingBalance.toFixed(2)} left` : 'Paid Off'}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return `₹${invoice.grandTotal.toFixed(2)}`;
                                        })()}
                                    </td>
                                    <td className="p-3 flex items-center gap-2 flex-wrap">
                                        <button onClick={() => { setEditingInvoice(invoice); setIsFormVisible(true); }} className="action-button bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300">Edit</button>
                                        {invoice.emiEnabled && (
                                            <button onClick={() => setManagingEmi(invoice)} className="action-button bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300">EMI</button>
                                        )}
                                        <button onClick={() => handlePrint(invoice)} className="action-button bg-green-500/20 hover:bg-green-500/40 text-green-300">Print</button>
                                        <button onClick={() => handleDelete(invoice.id)} className="action-button bg-red-500/20 hover:bg-red-500/40 text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-400">
                                        No invoices found. {searchQuery ? 'Try a different search.' : 'Create a new one to get started.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {isFormVisible && (
                <InvoiceForm
                    invoice={editingInvoice}
                    onClose={() => { setIsFormVisible(false); setEditingInvoice(null); }}
                />
            )}
            
            {managingEmi && (
                <EmiDetails
                    invoice={managingEmi}
                    onClose={() => setManagingEmi(null)}
                />
            )}

            {isReportModalVisible && (
                <ReportGenerator
                    invoices={invoices}
                    onClose={() => setIsReportModalVisible(false)}
                />
            )}

            {isProductManagerVisible && (
                <ProductManager
                    onClose={() => setIsProductManagerVisible(false)}
                />
            )}
            
            {/* Hidden printable versions */}
            <div className="hidden">
                {invoices.map(invoice => (
                    <div key={`print-${invoice.id}`} id={`invoice-print-${invoice.id}`} className="p-8 bg-white text-black">
                         <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-brand-blue">BAJAJ TAX INVOICE</h1>
                                <p className="text-gray-600">Official Invoice</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Bill No:</strong> {invoice.billNo}</p>
                                <p><strong>Date:</strong> {new Date(invoice.dateOfPurchase).toLocaleDateString()}</p>
                            </div>
                         </div>
                        <div className="flex items-start gap-4 mb-8 p-4 border border-gray-200 rounded-lg">
                            {invoice.customerPhoto && (
                                <img src={invoice.customerPhoto} alt="Customer" className="w-24 h-24 rounded-lg object-cover" />
                            )}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Billed To:</h2>
                                <p className="font-bold">{invoice.customerName}</p>
                                <p>{invoice.address}</p>
                            </div>
                        </div>
                        <table className="w-full text-left mb-8">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">S.No</th>
                                    <th className="p-2">Product Name</th>
                                    <th className="p-2 text-right">Rate</th>
                                    <th className="p-2 text-right">Extra Amt</th>
                                    <th className="p-2 text-right">Discount</th>
                                    <th className="p-2 text-right">GST (%)</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2">{item.sNo}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-2 text-right">₹{item.extraAmt.toFixed(2)}</td>
                                    <td className="p-2 text-right">₹{item.discount.toFixed(2)}</td>
                                    <td className="p-2 text-right">{item.gst}%</td>
                                    <td className="p-2 text-right">₹{item.total.toFixed(2)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between"><span className="font-semibold">Subtotal:</span><span>₹{invoice.subTotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Down Payment:</span><span>- ₹{invoice.downPayment.toFixed(2)}</span></div>
                                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span >Grand Total:</span><span>₹{invoice.grandTotal.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const getPortalTitle = () => {
        switch (user?.role) {
            case UserRole.PARTNER: return 'BAJAJ PARTNER PORTAL';
            case UserRole.PRINCIPAL: return 'BAJAJ PRINCIPAL PORTAL';
            default: return 'BAJAJ INVOICE PORTAL';
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                       {getPortalTitle()}
                    </h1>
                    <p className="text-gray-300">Welcome, {user?.id} ({user?.role})</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                        <Clock />
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600/50 hover:bg-red-600/75 border border-red-500/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {(() => {
                switch (user?.role) {
                    case UserRole.PARTNER: return <PartnerDashboard />;
                    case UserRole.PRINCIPAL: return <PrincipalDashboard />;
                    default: return renderEmployeeDashboard();
                }
            })()}
        </div>
    );
};

export default Dashboard;