import { getPostsByThreadId, getThreadById, createPost, getTotalPostsInThread } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
    try {
        const threadId = Number(params.id);
        const thread = await getThreadById(threadId);
        
        if (!thread) {
            throw error(404, 'Thread not found');
        }
        
        // Pagination
        const page = Number(url.searchParams.get('page')) || 1;
        const postsPerPage = 10;
        const totalPosts = await getTotalPostsInThread(threadId);
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        const offset = (page - 1) * postsPerPage;
        
        const posts = await getPostsByThreadId(threadId, postsPerPage, offset);
        
        return { 
            thread,
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage
            }
        };
    } catch (err) {
        console.error('Error loading thread:', err);
        throw error(500, 'Failed to load thread');
    }
};

export const actions = {
    reply: async ({ request, params, locals}) => {
        const formData = await request.formData();
        const content = String(formData.get('content') || '').trim();
        const threadId = Number(params.id);
        const user = locals.user;

        if (!user) {
            throw error(401, 'You must be logged in to reply');
        }

        // Check if thread exists and is not locked
        const thread = await getThreadById(threadId);
        if (!thread) {
            throw error(404, 'Thread not found');
        }

        if (thread.is_locked) {
            return { success: false, error: 'This thread is locked and no longer accepting replies' };
        }

        if (!content) {
            return { success: false, error: 'Content cannot be empty' };
        }

        try {
            await createPost({
                thread_id: threadId,
                author_id: user.id,
                content
            });

            return { success: true };
        } catch (err) {
            console.error('Error creating post:', err);
            return { success: false, error: 'Failed to create post' };
        }


    }
};