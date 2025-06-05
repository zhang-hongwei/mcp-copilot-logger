# MCP Service Markdown Templates Guide

## Overview
This document provides guidance on how to effectively use the markdown templates included in the MCP service. These templates are designed to streamline the documentation process for problem records, daily logs, and value assessments.

## Templates

### 1. Problem Record Template
- **File Location**: `src/templates/problem-record.md`
- **Purpose**: To document specific problems encountered during development, including context, attempts, and solutions.
- **Usage**:
  - Fill in the relevant sections with details about the problem.
  - Use this template to ensure consistency in documenting issues.

#### Example Structure:
```markdown
## Problem Title

### 🧩 Background
Description of the context in which the problem occurred.

### 🐞 Error Phenomenon
Details of the error or unexpected behavior observed.

### 🧪 Attempts
List of attempts made to resolve the issue, including any interactions with Copilot or other tools.

### ✅ Solution
The effective solution to the problem, along with any explanations or insights gained.

💡 Value Explanation
Rationale for documenting this problem, highlighting its significance or common pitfalls.
```

### 2. Daily Log Template
- **File Location**: `src/templates/daily-log.md`
- **Purpose**: To record daily development activities, including tasks completed, challenges faced, and insights gained.
- **Usage**:
  - Use this template at the end of each day to summarize your work.
  - Helps in tracking progress and identifying recurring issues.

#### Example Structure:
```markdown
# Daily Log - YYYY-MM-DD

## Tasks Completed
- List of tasks or features worked on.

## Challenges Faced
- Description of any significant challenges or blockers encountered.

## Insights Gained
- Key takeaways or lessons learned from the day's work.
```

### 3. Value Assessment Template
- **File Location**: `src/templates/value-assessment.md`
- **Purpose**: To evaluate the value of recorded problems based on predefined criteria.
- **Usage**:
  - Assess each recorded problem against the value criteria to determine its significance.
  - Use this template to ensure a structured approach to value assessment.

#### Example Structure:
```markdown
## Value Assessment for Problem Title

### 🧩 Problem Background
Brief description of the problem being assessed.

### 📊 Value Criteria
- **Criterion 1**: Explanation of how the problem meets this criterion.
- **Criterion 2**: Explanation of how the problem meets this criterion.

### ✅ Overall Value
Summary of the overall value of the problem based on the assessment.
```

## Conclusion
Utilizing these templates will enhance the documentation process within the MCP service, ensuring that valuable insights and problem-solving experiences are captured effectively.