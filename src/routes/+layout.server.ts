import { getOrCreateProfile } from '$lib/server/db';

export const load = async ({ locals }) => {
    if (!locals.user) {
        return { user: null };
    }
    
    // Fetch or create profile to get profile_image
    const profile = getOrCreateProfile(locals.user.id, locals.user.username);
    
    return {
        user: {
            ...locals.user,
            profile_image: profile.profile_image
        }
    };
};