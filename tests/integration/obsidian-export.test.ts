import { describe, it, expect } from 'jest';
import { exportToObsidian } from '../../src/server/tools/obsidian-exporter';
import { ProblemRecord } from '../../src/types/problem-record';

describe('Obsidian Export Functionality', () => {
    it('should export a problem record to the correct markdown format', () => {
        const record: ProblemRecord = {
            timestamp: '2025-06-04T14:23:00',
            description: 'Button component click issue',
            resolution: 'Updated handleClick to setClicked(true)',
            context: 'React application with state management',
            attempts: [
                'Tried changing event handler',
                'Consulted Copilot for suggestions'
            ],
            valueAssessment: 'High value due to common occurrence in state management'
        };

        const expectedMarkdown = `## Button component click issue

### 🕒 时间
2025-06-04T14:23:00

### 📝 描述
Button component click issue

### ✅ 解决方案
Updated handleClick to setClicked(true)

### 📚 背景
React application with state management

### 🔍 尝试过程
- Tried changing event handler
- Consulted Copilot for suggestions

### 💡 价值说明
High value due to common occurrence in state management
`;

        const result = exportToObsidian(record);
        expect(result).toEqual(expectedMarkdown);
    });

    it('should handle empty problem records gracefully', () => {
        const emptyRecord: ProblemRecord = {
            timestamp: '',
            description: '',
            resolution: '',
            context: '',
            attempts: [],
            valueAssessment: ''
        };

        const expectedMarkdown = `## 

### 🕒 时间


### 📝 描述


### ✅ 解决方案


### 📚 背景


### 🔍 尝试过程


### 💡 价值说明

`;

        const result = exportToObsidian(emptyRecord);
        expect(result).toEqual(expectedMarkdown);
    });
});