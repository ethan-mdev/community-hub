import { searchForum, getSearchResultCount } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const query = url.searchParams.get('q') || '';
    const page = Number(url.searchParams.get('page')) || 1;
    const resultsPerPage = 15;
    const offset = (page - 1) * resultsPerPage;
    
    if (!query.trim()) {
        return {
            query: '',
            results: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalResults: 0,
                resultsPerPage
            }
        };
    }
    
    try {
        const [results, totalResults] = await Promise.all([
            searchForum(query, resultsPerPage, offset),
            getSearchResultCount(query)
        ]);
        
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        
        return {
            query,
            results,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                resultsPerPage
            }
        };
    } catch (err) {
        console.error('Search error:', err);
        return {
            query,
            results: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalResults: 0,
                resultsPerPage
            },
            error: 'Failed to perform search'
        };
    }
};
