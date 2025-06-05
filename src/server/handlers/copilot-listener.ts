import { Request, Response } from 'express';
import { logCopilotInteraction } from '../tools/problem-tracker';
import { assessValue } from '../tools/value-assessor';

export const copilotListener = (req: Request, res: Response) => {
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

    logCopilotInteraction(problemRecord);

    // assessValue expects a string ID, so we need to create a record first
    // For now, we'll just return a placeholder value assessment
    const valueAssessment = 'Copilot interaction logged for analysis';

    return res.status(200).json({ message: 'Interaction logged', valueAssessment });
};