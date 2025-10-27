

export enum UserRole {
    EMPLOYEE = 'Employee',
    PARTNER = 'Partner',
    IBA = 'IBA',
    PRINCIPAL = 'Principal',
}

export interface User {
    id: string;
    role: UserRole;
}

export interface MasterProduct {
    id: string;
    name: string;
    rate: number;
    gst: number;
}

export interface Product {
    id:string;
    productId?: string; // ID from MasterProduct
    sNo: string;
    name: string;
    rate: number;
    extraAmt: number;
    discount: number;
    gst: number;
    total: number;
}

export enum PaymentStatus {
    PENDING = 'Pending',
    PAID = 'Paid',
    PARTIALLY_PAID = 'Partially Paid',
    CANCELLED = 'Cancelled',
}

export interface Invoice {
    id: string;
    billNo: string;
    customerName: string;
    address: string;
    customerPhoto?: string;
    dateOfPurchase: string;
    items: Product[];
    downPayment: number;
    subTotal: number;
    grandTotal: number;
    emiEnabled: boolean;
    paymentStatus: PaymentStatus;
    emiDetails?: Emi;
}

export enum EmiInstallmentStatus {
    PENDING = 'Pending',
    PAID = 'Paid',
    CANCELLED = 'Cancelled',
}

export interface EmiInstallment {
    id: string;
    month: number;
    year: number;
    amount: number;
    status: EmiInstallmentStatus;
}

export interface Emi {
    tenure: 8 | 9 | 10 | 11;
    interestRate: number; // Stored as a percentage e.g., 12 for 12%
    startDate: string;
    installments: EmiInstallment[];
    nocNumber?: string; // No Objection Certificate number
}