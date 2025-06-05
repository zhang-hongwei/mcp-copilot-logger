"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.logCopilotInteraction = exports.getProblems = exports.logProblem = void 0;
var ProblemTracker = /** @class */ (function () {
    function ProblemTracker() {
        this.records = [];
    }
    // Method to add a new problem record
    ProblemTracker.prototype.addRecord = function (record) {
        var recordWithId = __assign(__assign({}, record), { id: "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)) });
        this.records.push(recordWithId);
        return recordWithId;
    };
    // Method to get all problem records
    ProblemTracker.prototype.getRecords = function () {
        return this.records;
    };
    // Method to find records by a specific criterion
    ProblemTracker.prototype.findRecordsByCriterion = function (criterion) {
        return this.records.filter(criterion);
    };
    // Method to find record by ID
    ProblemTracker.prototype.findRecordById = function (id) {
        return this.records.find(function (record) { return record.id === id; });
    };
    // Method to clear all records
    ProblemTracker.prototype.clearRecords = function () {
        this.records = [];
    };
    return ProblemTracker;
}());
// Export functions for backward compatibility
var logProblem = function (problemData) {
    var _a;
    var record = {
        timestamp: new Date().toISOString(),
        title: problemData.title || ((_a = problemData.description) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) || '未命名问题',
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
var getProblems = function (filterOptions) {
    var records = problemTracker.getRecords();
    if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.worthExporting) !== undefined) {
        records = records.filter(function (r) { return r.isWorthExporting === filterOptions.worthExporting; });
    }
    if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.minValueScore) !== undefined) {
        records = records.filter(function (r) { return r.valueScore >= filterOptions.minValueScore; });
    }
    if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.tags) && filterOptions.tags.length > 0) {
        records = records.filter(function (r) {
            return filterOptions.tags.some(function (tag) { return r.tags.includes(tag); });
        });
    }
    if (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.category) {
        records = records.filter(function (r) { return r.category === filterOptions.category; });
    }
    return records;
};
exports.getProblems = getProblems;
var logCopilotInteraction = function (interactionData) {
    var _a;
    var record = {
        timestamp: interactionData.timestamp || new Date().toISOString(),
        title: "Copilot\u5EFA\u8BAE: ".concat(((_a = interactionData.suggestion) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) || '未知建议'),
        description: "Copilot interaction: ".concat(interactionData.suggestion),
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
var problemTracker = new ProblemTracker();
exports["default"] = problemTracker;
