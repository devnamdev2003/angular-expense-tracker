import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilService {
    calculateDaysBetween(startDateStr: string, targetDateStr: string): number {

        if (!startDateStr || !targetDateStr) {
            return 0;
        }

        const startDate = new Date(startDateStr);
        const targetDate = new Date(targetDateStr);

        if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
            return 0;
        }

        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const differenceInMs = end.getTime() - start.getTime();
        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

        const finalDays = Math.ceil(differenceInDays) + 1;

        return finalDays < 0 ? 0 : finalDays;
    }
}