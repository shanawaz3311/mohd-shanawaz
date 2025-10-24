import React, { useState, useEffect } from 'react';
import { MasterProduct } from '../types';
import { useProducts } from '../contexts/ProductContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

interface ProductManagerProps {
    onClose: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ onClose }) => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { showToast } = useToast();
    const [editingProduct, setEditingProduct] = useState<MasterProduct | null>(null);
    const [formData, setFormData] = useState({ name: '', rate: '', gst: '' });

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                rate: String(editingProduct.rate),
                gst: String(editingProduct.gst)
            });
        } else {
            setFormData({ name: '', rate: '', gst: '' });
        }
    }, [editingProduct]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const name = formData.name.trim();
        const rate = parseFloat(formData.rate);
        const gst = parseFloat(formData.gst);

        if (!name) {
            showToast('Product name cannot be empty.', 'error');
            return;
        }
        if (isNaN(rate) || rate < 0) {
            showToast('Please enter a valid, non-negative rate.', 'error');
            return;
        }
        if (isNaN(gst) || gst < 0) {
            showToast('Please enter a valid, non-negative GST %.', 'error');
            return;
        }

        const productData = { name, rate, gst };

        if (editingProduct) {
            updateProduct({ ...editingProduct, ...productData });
            showToast(`Product "${name}" updated and saved permanently.`, 'success');
        } else {
            addProduct(productData);
            showToast(`Product "${name}" added and saved permanently.`, 'success');
        }
        setEditingProduct(null);
        setFormData({ name: '', rate: '', gst: '' });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData({ name: '', rate: '', gst: '' });
    };
    
    const handleDelete = (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const productToDelete = products.find(p => p.id === productId);
            deleteProduct(productId);
            if (productToDelete) {
                showToast(`Product "${productToDelete.name}" deleted permanently.`, 'success');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-light border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold">Manage Products</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-white/5 rounded-lg items-end">
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" required className="input-field sm:col-span-2" />
                            <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleInputChange} placeholder="Rate (₹)" required className="input-field" />
                            <input type="number" step="0.01" name="gst" value={formData.gst} onChange={handleInputChange} placeholder="GST (%)" required className="input-field" />
                            <div className="flex gap-2 sm:col-span-4 justify-end">
                                {editingProduct && <button type="button" onClick={handleCancelEdit} className="py-2 px-4 rounded-lg bg-gray-500/80 hover:bg-gray-500/90 text-sm font-semibold">Cancel</button>}
                                <button type="submit" className="flex-grow py-2 px-4 rounded-lg bg-brand-accent/80 hover:bg-brand-accent/90 text-sm font-semibold">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                            </div>
                        </form>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Product List</h3>
                        <div className="space-y-2">
                            {products.map(product => (
                                <div key={product.id} className="grid grid-cols-5 gap-3 p-3 items-center bg-white/5 rounded-lg">
                                    <div className="col-span-2 font-medium">{product.name}</div>
                                    <div>₹{product.rate.toFixed(2)}</div>
                                    <div>{product.gst}% GST</div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingProduct(product)} className="text-sm py-1 px-3 rounded bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300">Edit</button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                             {products.length === 0 && <p className="text-center p-4 text-gray-400">No products found. Add one to get started.</p>}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/30 border-t border-white/20 flex justify-end">
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
                `}</style>
            </div>
        </div>
    );
};

export default ProductManager;