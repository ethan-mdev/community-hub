/**
 * Forum rank system based on post count
 */

export type Rank = {
    name: string;
    minPosts: number;
    color: string; // Tailwind color classes
    bgColor: string;
};

export const ranks: Rank[] = [
    { name: 'Newbie', minPosts: 0, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    { name: 'Regular', minPosts: 10, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { name: 'Veteran', minPosts: 50, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { name: 'Elite', minPosts: 100, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    { name: 'Legend', minPosts: 200, color: 'text-red-400', bgColor: 'bg-red-500/20' }
];

/**
 * Get rank based on post count
 */
export function getRankByPostCount(postCount: number): Rank {
    // Find the highest rank the user qualifies for
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (postCount >= ranks[i].minPosts) {
            return ranks[i];
        }
    }
    return ranks[0]; // Default to first rank
}
