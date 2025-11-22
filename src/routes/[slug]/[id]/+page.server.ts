import { getPostsByThreadId, getThreadById } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const threadId = Number(params.id);
        const thread = getThreadById(threadId);
        
        if (!thread) {
            throw error(404, 'Thread not found');
        }
        
        const posts = getPostsByThreadId(threadId);
        
        return { 
            thread,
            posts
        };
    } catch (err) {
        console.error('Error loading thread:', err);
        throw error(500, 'Failed to load thread');
    }
};