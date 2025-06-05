"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCopilotInteraction = exports.getProblems = exports.logProblem = void 0;
class ProblemTracker {
    constructor() {
        this.records = [];
    }
    // Method to add a new problem record
    addRecord(record) {
        const recordWithId = {
            ...record,
            id: Date.now().toString()
        };
        this.records.push(recordWithId);
        return recordWithId;
    }
    // Method to get all problem records
    getRecords() {
        return this.records;
    }
    // Method to find records by a specific criterion
    findRecordsByCriterion(criterion) {
        return this.records.filter(criterion);
    }
    // Method to find record by ID
    findRecordById(id) {
        return this.records.find(record => record.id === id);
    }
    // Method to clear all records
    clearRecords() {
        this.records = [];
    }
}
// Export functions for backward compatibility
const logProblem = (problemData) => {
    const record = {
        timestamp: new Date().toISOString(),
        title: problemData.title || problemData.description?.substring(0, 50) || '未命名问题',
        description: problemData.description || '',
        tags: problemData.tags || [],
        category: problemData.category || 'general',
        priority: problemData.priority || 'medium',
        context: problemData.context || '',
        codeBeforeChange: problemData.codeBeforeChange,
        codeAfterChange: problemData.codeAfterChange,
        codeLanguage: problemData.codeLanguage,
        errorPhenomenon: problemData.errorPhenomenon || '',
        attempts: problemData.attempts || [],
        finalSolution: problemData.finalSolution || '',
        solutionType: problemData.solutionType || 'other',
        valueScore: problemData.valueScore || 5,
        valueExplanation: problemData.valueExplanation || '',
        learningOutcome: problemData.learningOutcome || '',
        preventionStrategy: problemData.preventionStrategy,
        isWorthExporting: problemData.isWorthExporting !== false,
        exportNotes: problemData.exportNotes,
        relatedIssues: problemData.relatedIssues,
        references: problemData.references
    };
    return problemTracker.addRecord(record);
};
exports.logProblem = logProblem;
const getProblems = (filterOptions) => {
    let records = problemTracker.getRecords();
    if (filterOptions?.worthExporting !== undefined) {
        records = records.filter(r => r.isWorthExporting === filterOptions.worthExporting);
    }
    if (filterOptions?.minValueScore !== undefined) {
        records = records.filter(r => r.valueScore >= filterOptions.minValueScore);
    }
    if (filterOptions?.tags && filterOptions.tags.length > 0) {
        records = records.filter(r => filterOptions.tags.some(tag => r.tags.includes(tag)));
    }
    if (filterOptions?.category) {
        records = records.filter(r => r.category === filterOptions.category);
    }
    return records;
};
exports.getProblems = getProblems;
const logCopilotInteraction = (interactionData) => {
    const record = {
        timestamp: interactionData.timestamp || new Date().toISOString(),
        title: `Copilot建议: ${interactionData.suggestion?.substring(0, 50) || '未知建议'}`,
        description: `Copilot interaction: ${interactionData.suggestion}`,
        tags: ['copilot', 'interaction'],
        category: 'copilot',
        priority: 'low',
        context: interactionData.context || '',
        codeBeforeChange: undefined,
        codeAfterChange: undefined,
        codeLanguage: undefined,
        errorPhenomenon: interactionData.context || '',
        attempts: [],
        finalSolution: interactionData.suggestion || '',
        solutionType: 'learning',
        valueScore: 3,
        valueExplanation: 'Copilot interaction logged for analysis',
        learningOutcome: '',
        preventionStrategy: undefined,
        isWorthExporting: false,
        exportNotes: undefined,
        relatedIssues: undefined,
        references: undefined
    };
    problemTracker.addRecord(record);
};
exports.logCopilotInteraction = logCopilotInteraction;
const problemTracker = new ProblemTracker();
exports.default = problemTracker;
