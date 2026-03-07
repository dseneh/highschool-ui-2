import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const formatCurrency = (amount: number, currency?: string) => {
    // Validate currency: must be a 3-letter ISO 4217 code
    // If invalid, empty, or a symbol like "$", default to USD
    const isValidCurrencyCode = currency && /^[A-Z]{3}$/.test(currency.trim())
    const currencyCode = isValidCurrencyCode ? currency.trim() : 'USD'
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

export const getErrorMessage = (error: any) => {
    const e = (error as any)?.response?.data
    return (
        e?.detail ||
        e?.details?.[0] ||
        e?.errors?.[0] ||
        e?.error ||
        e?.message ||
        'An unexpected error occurred'
    )
}

export const getGradeBGColorClass = (percentage: number | null) => {
    return colorClass('bg', percentage)
}

export const getGradeTextColorClass = (percentage: number | null) => {
    return colorClass('text', percentage)
}

export const colorClass = (type: string, percentage: number | null) => {
    if (percentage === null || percentage === undefined) return `${type}-gray-500`
    const numPercentage = Number(percentage)
    if (isNaN(numPercentage)) return `${type}-gray-500`
    if (numPercentage < 70) return `${type}-red-500`
    // if (numPercentage >= 70 && numPercentage < 80) return `${type}-orange-500`
    if (numPercentage >= 70 && numPercentage < 90) return `${type}-green-500`
    if (numPercentage >= 90) return `${type}-blue-600`
    return `${type}-gray-500`
}
