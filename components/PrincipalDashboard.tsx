import React, { useState } from 'react';
import EmiApplicationModal from './EmiApplicationModal';
import { useInvoices } from '../contexts/InvoiceContext';
import { useToast } from '../contexts/ToastContext';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-white/10 pb-2">{title}</h3>
        <div>{children}</div>
    </div>
);

const PrincipalDashboard: React.FC = () => {
    const [isEmiModalVisible, setIsEmiModalVisible] = useState(false);
    const [searchBillNo, setSearchBillNo] = useState('');
    const { getInvoiceByBillNo } = useInvoices();
    const { showToast } = useToast();

    const handleStatusSearch = () => {
        if (!searchBillNo.trim()) {
            showToast('Please enter a Bill No. to search.', 'error');
            return;
        }

        const invoice = getInvoiceByBillNo(searchBillNo.trim());

        if (!invoice) {
            showToast(`Invoice with Bill No. "${searchBillNo}" not found.`, 'error');
            return;
        }

        if (!invoice.emiEnabled) {
            showToast(`Invoice ${invoice.billNo} is not an EMI application.`, 'info');
            return;
        }

        if (invoice.emiDetails) {
            showToast(`Application for ${invoice.billNo} is Approved.`, 'success');
        } else {
            showToast(`Application for ${invoice.billNo} is Pending Processing.`, 'info');
        }
    };


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card title="Initiate EMI Application">
                    <p className="text-gray-300 text-sm mb-4">
                        Start a new EMI application process for a customer.
                    </p>
                    <button
                        onClick={() => setIsEmiModalVisible(true)}
                        className="w-full action-button bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 text-white">
                        New Application
                    </button>
                </Card>

                <Card title="Check Application Status">
                     <p className="text-gray-300 text-sm mb-4">
                        Look up the current status of an ongoing application using the Bill No.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Bill No."
                            value={searchBillNo}
                            onChange={(e) => setSearchBillNo(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        />
                        <button onClick={handleStatusSearch} className="action-button bg-cyan-500/50 hover:bg-cyan-500/75 border border-cyan-500/80 text-white">
                            Search
                        </button>
                    </div>
                </Card>

                <Card title="Marketing & Promotions">
                    <p className="text-gray-300 text-sm mb-4">
                        Access the latest promotional materials, offers, and campaign details.
                    </p>
                    <button className="w-full action-button bg-purple-500/50 hover:bg-purple-500/75 border border-purple-500/80 text-white">
                        View Materials
                    </button>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card title="Principal Overview">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">42</p>
                                <p className="text-sm text-gray-400">Applications This Month</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">₹12,50,000</p>
                                <p className="text-sm text-gray-400">Total Approved Amount</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">3</p>
                                <p className="text-sm text-gray-400">Pending Queries</p>
                            </div>
                        </div>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <div className="grid grid-rows-2 gap-8">
                        <Card title="View Payouts">
                             <p className="text-gray-300 text-sm mb-4">
                                Check your commission statements.
                            </p>
                            <button className="w-full action-button bg-green-500/50 hover:bg-green-500/75 border border-green-500/80 text-white">
                                View Commissions
                            </button>
                        </Card>
                        <Card title="Manage Customer Queries">
                             <div className="flex justify-between items-center">
                                <p className="text-gray-300 text-sm mb-4">
                                    Respond to customer questions.
                                </p>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                             </div>
                            <button className="w-full action-button bg-yellow-500/50 hover:bg-yellow-500/75 border border-yellow-500/80 text-white">
                                View Queries
                            </button>
                        </Card>
                    </div>
                </div>
            </div>

            {isEmiModalVisible && (
                <EmiApplicationModal onClose={() => setIsEmiModalVisible(false)} />
            )}

        </div>
    );
};

export default PrincipalDashboard;