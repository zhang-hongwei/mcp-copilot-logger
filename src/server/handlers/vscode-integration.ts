import { Request, Response } from 'express';
import { logProblem, getProblems } from '../tools/problem-tracker';
import { assessValue } from '../tools/value-assessor';

export const handleLogProblem = (req: Request, res: Response) => {
    const problemData = req.body;

    if (!problemData || !problemData.description) {
        return res.status(400).json({ message: 'Invalid problem data' });
    }

    const loggedProblem = logProblem(problemData);
    return res.status(201).json(loggedProblem);
};

export const handleGetProblems = (req: Request, res: Response) => {
    const problems = getProblems();
    return res.status(200).json(problems);
};

export const handleAssessValue = (req: Request, res: Response) => {
    const { problemId } = req.params;

    if (!problemId) {
        return res.status(400).json({ message: 'Problem ID is required' });
    }

    const assessment = assessValue(problemId);
    return res.status(200).json(assessment);
};