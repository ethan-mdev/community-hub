import { getCategoriesWithChildren, getTotalThreadCount } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const categories = getCategoriesWithChildren();
        const totalThreads = getTotalThreadCount();
        const totalPosts = 0; // Placeholder for total posts, implement when post tracking is added
        
        return {
            categories,
            totalThreads,
            totalPosts
        };
    } catch (error) {
        console.error('Error loading categories:', error);
        return {
            categories: [],
            totalThreads: 0,
            totalPosts: 0
        };
    }
};
