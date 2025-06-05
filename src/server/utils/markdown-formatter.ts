import { ProblemRecord } from '../../types/problem-record';

export function formatMarkdown(record: ProblemRecord): string {
    const { timestamp, description, finalSolution, attempts } = record;

    const formattedAttempts = attempts.map(attempt => `- ${attempt}`).join('\n');

    return `# Problem Record - ${timestamp}

## Description
${description}

## Attempts
${formattedAttempts}

## Resolution
${finalSolution}
`;
}

export function formatDailyLog(date: string, entries: string[]): string {
    const formattedEntries = entries.map(entry => `- ${entry}`).join('\n');

    return `# Daily Log - ${date}

## Entries
${formattedEntries}
`;
}

export function formatValueAssessment(value: string, criteria: string[]): string {
    const formattedCriteria = criteria.map(criterion => `- ${criterion}`).join('\n');

    return `# Value Assessment

## Value
${value}

## Criteria
${formattedCriteria}
`;
}