import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved) as T;
            } catch (error) {
                console.error('Error parsing JSON from localStorage', error);
                return defaultValue;
            }
        }
    }
    return defaultValue;
}

// FIX: Imported Dispatch and SetStateAction and used them in the return type annotation.
export const useLocalStorage = <T,>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};