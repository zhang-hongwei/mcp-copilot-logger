import { assessValue } from '../../src/server/tools/value-assessor';
import { ValueCriteria } from '../../src/types/value-criteria';

describe('Value Assessor', () => {
    let criteria: ValueCriteria;

    beforeEach(() => {
        criteria = {
            complexity: 3,
            timeSpent: 20,
            relevance: 5,
            uniqueness: 4,
        };
    });

    test('should assess value correctly based on criteria', () => {
        const result = assessValue(criteria);
        expect(result).toBeGreaterThan(0);
    });

    test('should return low value for low complexity and time spent', () => {
        criteria.complexity = 1;
        criteria.timeSpent = 5;
        const result = assessValue(criteria);
        expect(result).toBeLessThan(10);
    });

    test('should return high value for high complexity and time spent', () => {
        criteria.complexity = 5;
        criteria.timeSpent = 60;
        const result = assessValue(criteria);
        expect(result).toBeGreaterThan(20);
    });

    test('should handle edge cases', () => {
        criteria.complexity = 0;
        criteria.timeSpent = 0;
        const result = assessValue(criteria);
        expect(result).toBe(0);
    });
});