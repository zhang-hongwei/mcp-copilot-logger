export interface ValueCriteria {
    id: string;
    description: string;
    isCritical: boolean;
    timeThreshold: number; // in minutes
    complexityLevel: 'low' | 'medium' | 'high';
    notes?: string; // optional additional notes
}