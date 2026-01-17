/**
 * Simple BBCode parser for forum posts
 */

const bbcodeTags: { [key: string]: (content: string, param?: string) => string } = {
    b: (content) => `<strong>${content}</strong>`,
    i: (content) => `<em>${content}</em>`,
    u: (content) => `<u>${content}</u>`,
    s: (content) => `<s>${content}</s>`,
    code: (content) => `<code>${escapeHtml(content)}</code>`,
    url: (content, param) => {
        const href = param || content;
        return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
    },
    img: (content) => `<img src="${escapeHtml(content)}" alt="Image" style="max-width: 100%;" />`,
    quote: (content, param) => {
        const author = param ? `<strong>${escapeHtml(param)} wrote:</strong><br>` : '';
        return `<blockquote>${author}${content}</blockquote>`;
    },
    color: (content, param) => `<span style="color: ${escapeHtml(param || 'inherit')}">${content}</span>`,
    size: (content, param) => `<span style="font-size: ${escapeHtml(param || '1')}em">${content}</span>`,
};

function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function parseBBCode(text: string): string {
    if (!text) return '';
    
    let result = escapeHtml(text);
    
    // Parse BBCode tags
    for (const [tag, handler] of Object.entries(bbcodeTags)) {
        // With parameter: [tag=param]content[/tag]
        const paramRegex = new RegExp(`\\[${tag}=([^\\]]+)\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'gi');
        result = result.replace(paramRegex, (_, param, content) => {
            // Unescape content for nested parsing
            const unescaped = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            return handler(unescaped, param);
        });
        
        // Without parameter: [tag]content[/tag]
        const simpleRegex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'gi');
        result = result.replace(simpleRegex, (_, content) => {
            const unescaped = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            return handler(unescaped);
        });
    }
    
    // Convert line breaks to <br>
    result = result.replace(/\n/g, '<br>');
    
    return result;
}

