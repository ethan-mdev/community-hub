<script lang="ts">
    import type { DbThread } from '$lib/server/db';
    import { timeAgo } from '$lib/utils/time';
    
    let { threads, categorySlug }: { threads: DbThread[], categorySlug: string } = $props();
</script>

<!-- Thread list -->
{#if threads.length === 0}
    <div class="rounded-xl bg-neutral-900/80 p-8 text-center text-gray-400 ring-1 ring-neutral-800">
        <p>No threads in this category yet. Be the first to post!</p>
    </div>
{:else}
    <section class="space-y-3" aria-label="Threads">
        {#each threads as thread}
            <a
                href="/{categorySlug}/{thread.id}"
                class="group block rounded-lg bg-neutral-800/50 p-4 ring-1 ring-neutral-700/50 transition hover:bg-neutral-800"
            >
                <div class="flex items-start justify-between gap-4">
                    <div class="flex gap-3 flex-1">
                        <!-- Author Avatar -->
                        <div class="shrink-0">
                            {#if thread.author_profile_image}
                                <img src="/avatars/{thread.author_profile_image}" alt={thread.author_username} class="w-10 h-10 rounded-full object-cover" />
                            {:else}
                                <img src="/avatars/avatar-1.png" alt="Default Avatar" class="w-10 h-10 rounded-full object-cover" />
                            {/if}
                        </div>
                        
                        <div class="flex-1">
                            <h3 class="font-semibold text-white transition group-hover:text-amber-400">
                                {#if thread.is_sticky}
                                    <span class="text-amber-500 mr-1">📌</span>
                                {/if}
                                {#if thread.is_locked}
                                    <span class="text-gray-500 mr-1">🔒</span>
                                {/if}
                                {thread.title}
                            </h3>
                            <div class="mt-1 text-xs text-gray-500">
                                By {thread.author_username || 'Unknown'} • {timeAgo(thread.created_at)}
                                {#if thread.view_count}
                                    • {thread.view_count} {thread.view_count === 1 ? 'view' : 'views'}
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="text-right text-xs text-gray-400 shrink-0">
                        <div class="font-medium text-amber-400">{thread.reply_count || 0} {thread.reply_count === 1 ? 'reply' : 'replies'}</div>
                        {#if thread.last_reply_at}
                            <div class="mt-1 text-gray-500">Last by {thread.last_reply_username || 'Unknown'}</div>
                            <div class="text-gray-600">{timeAgo(thread.last_reply_at)}</div>
                        {/if}
                    </div>
                </div>
            </a>
        {/each}
    </section>
{/if}