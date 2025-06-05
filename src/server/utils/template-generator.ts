import { ProblemRecord } from '../../types/problem-record';
import { ValueCriteria } from '../../types/value-criteria';
import { ObsidianConfig } from '../../types/obsidian-config';
import { readFileSync } from 'fs';
import { join } from 'path';

export function generateProblemRecordTemplate(record: ProblemRecord): string {
    return `
## Problem Record

### 🕒 Timestamp
${record.timestamp}

### 📝 Description
${record.description}

### 🔍 Resolution
${record.finalSolution}

### 📊 Value Assessment
${record.valueExplanation}
`;
}

export function generateDailyLogTemplate(date: string, logs: string[]): string {
    return `
# Daily Log - ${date}

## 🗒️ Logs
${logs.join('\n')}
`;
}

export function generateValueAssessmentTemplate(criteria: ValueCriteria): string {
    return `
## Value Assessment

### 📋 Criteria
- ${criteria.description}

### ✅ Assessment Result
${criteria.description}
`;
}

export function loadTemplate(templateName: string): string {
    const templatePath = join(__dirname, '../../templates', `${templateName}.md`);
    return readFileSync(templatePath, 'utf-8');
}