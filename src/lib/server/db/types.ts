export type DbCategory = {
    id: string;
    parent_id: string | null;
    name: string;
    description: string | null;
    image: string | null;
    is_locked: boolean;
    slug: string;
    thread_count?: number;
};

export type DbThread = {
    id: number;
    category_id: string;
    title: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    is_locked: boolean;
    is_sticky: boolean;
    is_deleted: boolean;
    author_username?: string;
    author_profile_image?: string;
    reply_count?: number;
    last_reply_at?: string;
    last_reply_username?: string;
    view_count?: number;
};

export type DbPost = {
    id: number;
    thread_id: number;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    author_username?: string;
};

export type ReactionType = 'like' | 'heart' | 'laugh' | 'sad' | 'wow' | 'angry' | 'celebrate';

export type PostReactions = {
    like: number;
    heart: number;
    laugh: number;
    sad: number;
    wow: number;
    angry: number;
    celebrate: number;
};

export type Badge = {
    id: number;
    name: string;
    bg_color: string;
    text_color: string;
};

export type SearchResult = {
    type: 'thread' | 'post';
    thread_id: number;
    thread_title: string;
    post_id?: number;
    content: string;
    author_username: string;
    category_name: string;
    category_slug: string;
    created_at: string;
    rank: number;
};
