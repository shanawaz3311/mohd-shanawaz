import React, { useState, useEffect } from 'react';
import { Invoice, Product, PaymentStatus } from '../types';
import { useInvoices } from '../contexts/InvoiceContext';
import { useProducts } from '../contexts/ProductContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, PlusIcon, TrashIcon, CameraIcon } from './icons';

interface InvoiceFormProps {
    invoice: Invoice | null;
    onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose }) => {
    const { addInvoice, updateInvoice } = useInvoices();
    const { products: masterProducts } = useProducts();
    const { showToast } = useToast();

    const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'subTotal' | 'grandTotal'>>({
        billNo: '',
        customerName: '',
        address: '',
        customerPhoto: '',
        dateOfPurchase: new Date().toISOString().split('T')[0],
        items: [],
        downPayment: 0,
        emiEnabled: false,
        paymentStatus: PaymentStatus.PENDING,
    });
    
    const subTotal = formData.items.reduce((acc, item) => acc + item.total, 0);
    const grandTotal = subTotal - formData.downPayment;

    useEffect(() => {
        if (invoice) {
            setFormData({
                billNo: invoice.billNo,
                customerName: invoice.customerName,
                address: invoice.address,
                customerPhoto: invoice.customerPhoto || '',
                dateOfPurchase: invoice.dateOfPurchase,
                items: invoice.items,
                downPayment: invoice.downPayment,
                emiEnabled: invoice.emiEnabled || false,
                paymentStatus: invoice.paymentStatus || PaymentStatus.PENDING,
            });
        } else {
            // New invoice: generate bill number
            setFormData(prev => ({
                ...prev,
                billNo: `BAJ-${Date.now().toString().slice(-8)}`
            }));
        }
    }, [invoice]);
    
    useEffect(() => {
        // Only auto-update status for new invoices based on payment
        if (!invoice) {
            if (formData.paymentStatus === PaymentStatus.CANCELLED) return; // Respect manual cancellation

            let newStatus = PaymentStatus.PENDING;
            if (grandTotal <= 0 && subTotal > 0) {
                newStatus = PaymentStatus.PAID;
            } else if (formData.downPayment > 0) {
                newStatus = PaymentStatus.PARTIALLY_PAID;
            }

            if (newStatus !== formData.paymentStatus) {
                setFormData(prev => ({ ...prev, paymentStatus: newStatus }));
            }
        }
    }, [invoice, formData.downPayment, subTotal, grandTotal, formData.paymentStatus]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox
                ? (e.target as HTMLInputElement).checked
                : (name === 'downPayment' ? parseFloat(value) || 0 : value)
        }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showToast('File size should not exceed 2MB.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, customerPhoto: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, customerPhoto: '' }));
        // Also reset the file input
        const fileInput = document.getElementById('customerPhoto') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        const item = { ...newItems[index] };
        
        const numValue = parseFloat(value) || 0;
        
        // Only allow changing these fields manually
        if (name === 'sNo' || name === 'extraAmt' || name === 'discount') {
             (item as any)[name] = (name === 'sNo') ? value : numValue;
        }

        const base = item.rate + item.extraAmt - item.discount;
        item.total = base * (1 + item.gst / 100);
        newItems[index] = item;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleProductSelect = (index: number, productId: string) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index] };
        const selectedProduct = masterProducts.find(p => p.id === productId);

        if (selectedProduct) {
            item.productId = productId;
            item.name = selectedProduct.name;
            item.rate = selectedProduct.rate;
            item.gst = selectedProduct.gst;
        } else {
            item.productId = '';
            item.name = '';
            item.rate = 0;
            item.gst = 0;
        }

        const base = item.rate + item.extraAmt - item.discount;
        item.total = base * (1 + item.gst / 100);
        newItems[index] = item;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const newItem: Product = {
            id: crypto.randomUUID(),
            productId: '',
            sNo: (formData.items.length + 1).toString(),
            name: '',
            rate: 0,
            extraAmt: 0,
            discount: 0,
            gst: 0,
            total: 0,
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalInvoice: Invoice = {
            id: invoice ? invoice.id : crypto.randomUUID(),
            ...formData,
            subTotal,
            grandTotal,
            emiDetails: invoice?.emiDetails, // Preserve existing EMI details
        };

        if (invoice) {
            updateInvoice(finalInvoice);
            showToast('Invoice updated and saved permanently.', 'success');
        } else {
            addInvoice(finalInvoice);
            showToast('Invoice created and saved permanently.', 'success');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-light border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold">{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center justify-center space-y-2">
                            <input
                                type="file"
                                id="customerPhoto"
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={handlePhotoUpload}
                            />
                            <label htmlFor="customerPhoto" className="cursor-pointer">
                                {formData.customerPhoto ? (
                                    <img src={formData.customerPhoto} alt="Customer" className="w-28 h-28 rounded-full object-cover border-2 border-brand-accent shadow-lg" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-gray-400 hover:bg-white/20 hover:border-brand-accent transition-colors">
                                        <CameraIcon />
                                        <span className="text-xs mt-1">Upload Photo</span>
                                    </div>
                                )}
                            </label>
                            {formData.customerPhoto && (
                                <button type="button" onClick={removePhoto} className="text-xs text-red-400 hover:text-red-300">
                                    Remove Photo
                                </button>
                            )}
                        </div>
                        <div className="md:col-span-3 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Customer Name" required className="input-field" />
                                <input type="text" name="billNo" value={formData.billNo} placeholder="Bill No." required readOnly className="input-field bg-white/5" />
                            </div>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required className="input-field w-full" rows={2}></textarea>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <input type="date" name="dateOfPurchase" value={formData.dateOfPurchase} onChange={handleInputChange} required className="input-field" />
                                <div>
                                     <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                     <select
                                        name="paymentStatus"
                                        id="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleInputChange}
                                        className="input-field w-full"
                                     >
                                        {Object.values(PaymentStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                     </select>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-md justify-center h-full">
                                     <input
                                        type="checkbox"
                                        name="emiEnabled"
                                        id="emiEnabled"
                                        checked={formData.emiEnabled}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 rounded border-gray-400 bg-white/20 text-brand-accent focus:ring-brand-accent focus:ring-2 cursor-pointer"
                                    />
                                    <label htmlFor="emiEnabled" className="font-medium text-gray-200 cursor-pointer select-none">
                                        Offer EMI Option
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Product Details</h3>
                        {formData.items.map((item, index) => (
                             <div key={item.id} className="grid grid-cols-12 gap-2 p-3 bg-white/5 rounded-lg">
                                 <input type="text" name="sNo" value={item.sNo} onChange={(e) => handleItemChange(index, e)} placeholder="S.No" className="input-field col-span-2 sm:col-span-1" />
                                 <select value={item.productId || ''} onChange={(e) => handleProductSelect(index, e.target.value)} className="input-field col-span-10 sm:col-span-4">
                                     <option value="">-- Select Product --</option>
                                     {masterProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                 </select>
                                 <input type="number" name="rate" value={item.rate} readOnly={!!item.productId} onChange={(e) => handleItemChange(index, e)} placeholder="Rate" className={`input-field col-span-4 sm:col-span-1 ${!!item.productId ? 'bg-white/5' : ''}`} />
                                 <input type="number" name="extraAmt" value={item.extraAmt} onChange={(e) => handleItemChange(index, e)} placeholder="Extra" className="input-field col-span-4 sm:col-span-1" />
                                 <input type="number" name="discount" value={item.discount} onChange={(e) => handleItemChange(index, e)} placeholder="Discount" className="input-field col-span-4 sm:col-span-1" />
                                 <input type="number" name="gst" value={item.gst} readOnly={!!item.productId} onChange={(e) => handleItemChange(index, e)} placeholder="GST %" className={`input-field col-span-4 sm:col-span-1 ${!!item.productId ? 'bg-white/5' : ''}`} />
                                 <input type="text" value={`₹${item.total.toFixed(2)}`} readOnly className="input-field col-span-6 sm:col-span-2 bg-white/5" />
                                 <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-400 col-span-2 sm:col-span-1 flex items-center justify-center"><TrashIcon /></button>
                             </div>
                        ))}
                         <button type="button" onClick={addItem} className="flex items-center gap-2 text-brand-accent hover:text-sky-300 font-semibold p-2">
                             <PlusIcon className="w-5 h-5" /> Add Product
                         </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/20">
                         <div>
                            <label className="block text-sm">Net Cash Downpayment</label>
                            <input type="number" name="downPayment" value={formData.downPayment} onChange={handleInputChange} placeholder="Down Payment" className="input-field mt-1" />
                         </div>
                         <div className="text-right md:col-span-2 space-y-2">
                            <p className="text-lg">Subtotal: <span className="font-bold">₹{subTotal.toFixed(2)}</span></p>
                            <p className="text-xl font-bold text-brand-accent">Grand Total: <span className="font-extrabold">₹{grandTotal.toFixed(2)}</span></p>
                         </div>
                    </div>
                </form>
                 <div className="p-4 bg-black/30 border-t border-white/20 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600/50 hover:bg-gray-600/75 border border-gray-500/80 transition-all">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="py-2 px-4 rounded-lg bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 font-bold transition-all">{invoice ? 'Update Invoice' : 'Save Invoice'}</button>
                </div>
            </div>
            {/* Fix on line 150: Replaced <style jsx> with <style> to fix TypeScript error. styled-jsx is not configured in this project. */}
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
    );
};

export default InvoiceForm;