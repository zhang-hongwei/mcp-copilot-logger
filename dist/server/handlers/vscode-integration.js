"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssessValue = exports.handleGetProblems = exports.handleLogProblem = void 0;
const problem_tracker_1 = require("../tools/problem-tracker");
const value_assessor_1 = require("../tools/value-assessor");
const handleLogProblem = (req, res) => {
    const problemData = req.body;
    if (!problemData || !problemData.description) {
        return res.status(400).json({ message: 'Invalid problem data' });
    }
    const loggedProblem = (0, problem_tracker_1.logProblem)(problemData);
    return res.status(201).json(loggedProblem);
};
exports.handleLogProblem = handleLogProblem;
const handleGetProblems = (req, res) => {
    const problems = (0, problem_tracker_1.getProblems)();
    return res.status(200).json(problems);
};
exports.handleGetProblems = handleGetProblems;
const handleAssessValue = (req, res) => {
    const { problemId } = req.params;
    if (!problemId) {
        return res.status(400).json({ message: 'Problem ID is required' });
    }
    const assessment = (0, value_assessor_1.assessValue)(problemId);
    return res.status(200).json(assessment);
};
exports.handleAssessValue = handleAssessValue;
