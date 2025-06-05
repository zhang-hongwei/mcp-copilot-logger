import { formatMarkdown } from '../../src/server/utils/markdown-formatter';

describe('Markdown Formatter', () => {
    it('should format a simple markdown string correctly', () => {
        const input = '# Title\n\nThis is a paragraph.';
        const expectedOutput = '<h1>Title</h1>\n<p>This is a paragraph.</p>';
        expect(formatMarkdown(input)).toBe(expectedOutput);
    });

    it('should handle lists correctly', () => {
        const input = '- Item 1\n- Item 2\n- Item 3';
        const expectedOutput = '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>';
        expect(formatMarkdown(input)).toBe(expectedOutput);
    });

    it('should format code blocks correctly', () => {
        const input = '```\nconst a = 1;\n```';
        const expectedOutput = '<pre><code>const a = 1;\n</code></pre>';
        expect(formatMarkdown(input)).toBe(expectedOutput);
    });

    it('should return empty string for empty input', () => {
        const input = '';
        const expectedOutput = '';
        expect(formatMarkdown(input)).toBe(expectedOutput);
    });
});