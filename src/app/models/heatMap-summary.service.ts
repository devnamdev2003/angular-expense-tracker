/**
 * Represents a single heatmap summary entry.
 * This interface is used to describe the color intensity, total days,
 * and total expense amount for a specific heat level in the calendar heatmap.
 */
export interface HeatmapSummary {
    /**
     * The Tailwind/hex color code used to represent the heat level
     * (e.g. "#f87171" or "bg-green-500").
     */
    color: string;

    /**
     * The total number of days that fall under this heat level.
     * Used to group days with similar spending intensity.
     */
    days: number;

    /**
     * The total amount of expenses for all days included in this heat level.
     * Helps calculate and display the spending range for the legend.
     */
    amount: number;
}
