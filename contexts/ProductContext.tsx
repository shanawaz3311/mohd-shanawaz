import React, { createContext, useContext, ReactNode } from 'react';
import { MasterProduct } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Sample data for initial setup
const initialProducts: MasterProduct[] = [
    { id: 'prod-1', name: 'Bajaj Finserv EMI Card', rate: 0, gst: 0 },
    { id: 'prod-2', name: 'Extended Warranty Plan', rate: 2500, gst: 18 },
    { id: 'prod-5', name: 'iPhone 17 Pro Max', rate: 179999, gst: 18 },
    { id: 'prod-6', name: 'SS Kids Laptop That Set', rate: 4999, gst: 18 },
];

interface ProductContextType {
    products: MasterProduct[];
    addProduct: (product: Omit<MasterProduct, 'id'>) => void;
    updateProduct: (product: MasterProduct) => void;
    deleteProduct: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useLocalStorage<MasterProduct[]>('masterProducts', initialProducts);

    const addProduct = (productData: Omit<MasterProduct, 'id'>) => {
        const newProduct: MasterProduct = { id: crypto.randomUUID(), ...productData };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (updatedProduct: MasterProduct) => {
        setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};