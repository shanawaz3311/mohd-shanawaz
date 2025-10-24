import React from 'react';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-brand-accent mb-4 border-b border-white/10 pb-2">{title}</h3>
        <div>{children}</div>
    </div>
);

const PartnerDashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card title="Manage Client Information">
                    <p className="text-gray-300 text-sm mb-4">
                        Add, view, and update client details to keep records accurate and up-to-date.
                    </p>
                    <button className="w-full action-button bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 text-white">
                        View Clients
                    </button>
                </Card>

                <Card title="Check Application Statuses">
                     <p className="text-gray-300 text-sm mb-4">
                        Track the progress of loan and product applications in real-time.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Application ID"
                            className="w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        />
                        <button className="action-button bg-cyan-500/50 hover:bg-cyan-500/75 border border-cyan-500/80 text-white">
                            Search
                        </button>
                    </div>
                </Card>

                <Card title="Track Your Portfolio">
                    <p className="text-gray-300 text-sm mb-4">
                        Monitor your portfolio of loans and other financial products.
                    </p>
                    <button className="w-full action-button bg-green-500/50 hover:bg-green-500/75 border border-green-500/80 text-white">
                        View Portfolio
                    </button>
                </Card>
            </div>
            
            <Card title="Partnership Overview">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-white">15</p>
                        <p className="text-sm text-gray-400">Active Applications</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">₹5,00,000</p>
                        <p className="text-sm text-gray-400">Total Disbursed</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-white">8</p>
                        <p className="text-sm text-gray-400">New Clients This Month</p>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default PartnerDashboard;