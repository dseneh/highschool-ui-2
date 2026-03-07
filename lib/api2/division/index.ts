"use client";
import { useDivisionsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useDivisions() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useDivisionsApi()

    const getDivisions = (options = {}) =>
        useApiQuery(
            ['divisions'], () => api.getDivisionsApi().then((res) => res.data), options)

    const getDivision = (id: string, options = {}) =>
        useApiQuery(
            ['divisions', id], () => api.getDivisionApi(id).then((res) => res.data), options)

    const createDivision = (options = {}) =>
        useApiMutation(
            (data: any) => api.createDivisionApi(data).then((res) => res.data), options)

    const updateDivision = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editDivisionApi(id, data).then((res) => res.data), options)

    const partialUpdateDivision = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updateDivisionApi(id, data).then((res) => res.data), options)

    const deleteDivision = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteDivisionApi(id).then((res: any) => res.data), options)

    return {
        getDivisions,
        getDivision,
        createDivision,
        updateDivision,
        partialUpdateDivision,
        deleteDivision,
    }
}

