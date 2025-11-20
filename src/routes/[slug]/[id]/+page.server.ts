import { getPostsByThreadId} from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const posts = getPostsByThreadId(Number(params.id));
        
        if (!posts) {
        }
        
        return { 
            posts
        };
    } catch (err) {
        console.error('Error loading posts:', err);
        return {
            posts: null
        };
    }
};