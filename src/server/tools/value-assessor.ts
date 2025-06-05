import { ValueCriteria } from '../../types/value-criteria';
import { ProblemRecord } from '../../types/problem-record';
import problemTracker from './problem-tracker';

export class ValueAssessor {
    private criteria: ValueCriteria[];

    constructor(criteria: ValueCriteria[]) {
        this.criteria = criteria;
    }

    assess(record: ProblemRecord): string {
        let valueAssessment = 'Value Assessment:\n';
        let totalScore = 0;

        this.criteria.forEach(criterion => {
            const score = this.evaluateCriterion(record, criterion);
            totalScore += score;
            valueAssessment += `- ${criterion.description}: ${score}\n`;
        });

        valueAssessment += `Total Score: ${totalScore}/${this.criteria.length * 5}\n`;
        return valueAssessment;
    }

    private evaluateCriterion(record: ProblemRecord, criterion: ValueCriteria): number {
        // Implement logic to evaluate the criterion against the problem record
        // For now, return a random score between 0 and 5 for demonstration purposes
        return Math.floor(Math.random() * 6);
    }
}

// Export function for backward compatibility
export const assessValue = (problemId: string, options?: {
    timeSpent?: number;
    impact?: string;
    learning?: string;
}): { success: boolean; data?: any; message?: string } => {
    const record = problemTracker.findRecordById(problemId);
    if (!record) {
        return {
            success: false,
            message: 'Problem not found'
        };
    }

    const defaultCriteria: ValueCriteria[] = [
        {
            id: '1',
            description: 'Complexity of the problem',
            isCritical: false,
            timeThreshold: 15,
            complexityLevel: 'medium'
        },
        {
            id: '2',
            description: 'Frequency of occurrence',
            isCritical: true,
            timeThreshold: 5,
            complexityLevel: 'high'
        }
    ];

    const assessor = new ValueAssessor(defaultCriteria);
    const assessment = assessor.assess(record);

    // Add custom assessment data if provided
    const customAssessment = {
        assessment,
        timeSpent: options?.timeSpent || 0,
        impact: options?.impact || 'unknown',
        learning: options?.learning || 'unknown',
        timestamp: new Date().toISOString()
    };

    return {
        success: true,
        data: customAssessment,
        message: 'Value assessment completed successfully'
    };
};