// services/calendarService.ts
import { supabase } from '../lib/supabase';
import type {
    CalendarItem,
    GetDueCalendarParams,
    ServiceResponse
} from '../types/calendar';

export class CalendarService {

    /**
     * Fetches the schedule of pending installment payments within a specific date range.
     * Useful for "Upcoming Collections" or "Overdue" lists.
     */
    static async getDueCalendar(params: GetDueCalendarParams = {}): Promise<ServiceResponse<CalendarItem[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_due_calendar', {
                p_start_date: params.p_start_date ?? null, // Passing null triggers DB default (Today)
                p_end_date: params.p_end_date ?? null,     // Passing null triggers DB default (Today + 30)
                p_limit: params.p_limit ?? 100
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as CalendarItem[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching the due calendar.'
            };
        }
    }
}