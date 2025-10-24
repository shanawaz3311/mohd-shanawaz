
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Invoice } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InvoiceContextType {
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (invoice: Invoice) => void;
    deleteInvoice: (invoiceId: string) => void;
    getInvoiceByBillNo: (billNo: string) => Invoice | undefined;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);

    const addInvoice = (invoice: Invoice) => {
        setInvoices(prev => [...prev, invoice]);
    };

    const updateInvoice = (updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
    };

    const deleteInvoice = (invoiceId: string) => {
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    };

    const getInvoiceByBillNo = (billNo: string) => {
        return invoices.find(inv => inv.billNo.toLowerCase() === billNo.toLowerCase());
    };

    return (
        <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, getInvoiceByBillNo }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoices = (): InvoiceContextType => {
    const context = useContext(InvoiceContext);
    if (context === undefined) {
        throw new Error('useInvoices must be used within an InvoiceProvider');
    }
    return context;
};
