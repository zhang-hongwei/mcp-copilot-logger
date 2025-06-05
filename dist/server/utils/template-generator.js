"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTemplate = exports.generateValueAssessmentTemplate = exports.generateDailyLogTemplate = exports.generateProblemRecordTemplate = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function generateProblemRecordTemplate(record) {
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
exports.generateProblemRecordTemplate = generateProblemRecordTemplate;
function generateDailyLogTemplate(date, logs) {
    return `
# Daily Log - ${date}

## 🗒️ Logs
${logs.join('\n')}
`;
}
exports.generateDailyLogTemplate = generateDailyLogTemplate;
function generateValueAssessmentTemplate(criteria) {
    return `
## Value Assessment

### 📋 Criteria
- ${criteria.description}

### ✅ Assessment Result
${criteria.description}
`;
}
exports.generateValueAssessmentTemplate = generateValueAssessmentTemplate;
function loadTemplate(templateName) {
    const templatePath = (0, path_1.join)(__dirname, '../../templates', `${templateName}.md`);
    return (0, fs_1.readFileSync)(templatePath, 'utf-8');
}
exports.loadTemplate = loadTemplate;
