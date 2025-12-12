import { getCategoriesWithChildren, getTotalThreadCount, getTotalPostCount } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const categories = await getCategoriesWithChildren();
        const totalThreads = await getTotalThreadCount();
        const totalPosts = await getTotalPostCount();
        
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
