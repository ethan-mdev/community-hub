import { getCategoryBySlug, createThread } from '$lib/server/db.js';
import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const category = getCategoryBySlug(params.slug);
        
        if (!category) {
            throw error(404, 'Category not found');
        }
        
        return { 
            category
        };
    } catch (err) {
        console.error('Error loading category:', err);
        throw error(500, 'Failed to load category');
    }
};

export const actions: Actions = {
    createThread: async ({ request, params, locals }) => {
        const user = locals.user;
        
        if (!user) {
            throw error(401, 'You must be logged in to create a thread');
        }
        
        const formData = await request.formData();
        const title = String(formData.get('title') || '').trim();
        const content = String(formData.get('content') || '').trim();
        const isSticky = formData.get('is_sticky') === 'on';
        const isLocked = formData.get('is_locked') === 'on';
        
        // Validation
        if (!title) {
            return fail(400, { error: 'Thread title is required', title, content });
        }
        
        if (title.length > 200) {
            return fail(400, { error: 'Thread title must be 200 characters or less', title, content });
        }
        
        if (!content) {
            return fail(400, { error: 'Initial post content is required', title, content });
        }
        
        // Get category to verify it exists
        const category = getCategoryBySlug(params.slug);
        if (!category) {
            throw error(404, 'Category not found');
        }
        
        // Only admins can create sticky/locked threads (remove for now)
        const finalIsSticky = false;
        const finalIsLocked = false;
        
        let thread;
        try {
            thread = createThread({
                categoryId: category.id,
                title,
                authorId: user.id,
                isSticky: finalIsSticky,
                isLocked: finalIsLocked,
                initialContent: content
            });
        } catch (err) {
            console.error('Error creating thread:', err);
            return fail(500, { error: 'Failed to create thread', title, content });
        }
        
        throw redirect(303, `/${params.slug}/${thread.id}`);
    }
};