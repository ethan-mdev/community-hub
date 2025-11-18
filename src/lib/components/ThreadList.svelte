<script lang="ts">
    import type { DbThread } from '$lib/server/db';
    
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
                    <div class="flex-1">
                        <h3 class="font-semibold text-white transition group-hover:text-amber-400">
                            {thread.title}
                        </h3>
                    </div>
                    <div class="text-right text-xs text-gray-500">
                        <div>By {thread.author_username || 'Unknown'}</div>
                        <div>{new Date(thread.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </a>
        {/each}
    </section>
{/if}