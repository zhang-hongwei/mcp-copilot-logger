"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copilotListener = void 0;
const problem_tracker_1 = require("../tools/problem-tracker");
const copilotListener = (req, res) => {
    const { suggestion, context } = req.body;
    if (!suggestion || !context) {
        return res.status(400).json({ error: 'Missing suggestion or context' });
    }
    const timestamp = new Date().toISOString();
    const problemRecord = {
        timestamp,
        suggestion,
        context,
    };
    (0, problem_tracker_1.logCopilotInteraction)(problemRecord);
    // assessValue expects a string ID, so we need to create a record first
    // For now, we'll just return a placeholder value assessment
    const valueAssessment = 'Copilot interaction logged for analysis';
    return res.status(200).json({ message: 'Interaction logged', valueAssessment });
};
exports.copilotListener = copilotListener;
