import { getCategoryBySlug } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const category = getCategoryBySlug(params.slug);
        
        if (!category) {
        }
        
        return { 
            category
        };
    } catch (err) {
        console.error('Error loading category:', err);
        return {
            category: null
        };
    }
};