"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValueAssessment = exports.formatDailyLog = exports.formatMarkdown = void 0;
function formatMarkdown(record) {
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
exports.formatMarkdown = formatMarkdown;
function formatDailyLog(date, entries) {
    const formattedEntries = entries.map(entry => `- ${entry}`).join('\n');
    return `# Daily Log - ${date}

## Entries
${formattedEntries}
`;
}
exports.formatDailyLog = formatDailyLog;
function formatValueAssessment(value, criteria) {
    const formattedCriteria = criteria.map(criterion => `- ${criterion}`).join('\n');
    return `# Value Assessment

## Value
${value}

## Criteria
${formattedCriteria}
`;
}
exports.formatValueAssessment = formatValueAssessment;
