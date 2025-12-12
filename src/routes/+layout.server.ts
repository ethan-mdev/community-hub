import { getUserProfile } from '$lib/server/auth';

export const load = async ({ locals }) => {
    if (!locals.user) {
        return { user: null };
    }
    
    // Fetch profile from auth service
    const profile = await getUserProfile(locals.user.id);
    
    return {
        user: {
            ...locals.user,
            profile_image: profile?.profile_image || null
        }
    };
};