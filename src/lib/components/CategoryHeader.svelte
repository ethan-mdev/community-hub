<script lang="ts">
    import type { DbCategory } from '$lib/server/db';
    import type { AuthenticatedUser } from "$lib/server/auth";
    import NewThreadModal from './NewThreadModal.svelte';
    
    let { category, user, form }: { 
        category: DbCategory & { threads: any[] }, 
        user: AuthenticatedUser | null,
        form?: any 
    } = $props();
    
    let showNewThreadModal = $state(false);
</script>

<!-- Category header card -->
<section class="mb-6 overflow-hidden rounded-xl bg-neutral-900/80 ring-1 ring-neutral-800">
    <div class="border-b border-neutral-800 bg-linear-to-r from-amber-500/10 to-transparent p-6">
        <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
                <h1 class="mb-2 text-3xl font-bold text-amber-400">
                    {category.name}
                </h1>
                <p class="text-gray-400">
                    {category.description || 'Discussion threads for ' + category.name}
                </p>
            </div>

            <!-- New thread button -->
            {#if user}
                <button
                    onclick={() => category.is_locked ? null : showNewThreadModal = true}
                    disabled={category.is_locked}
                    class="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition {category.is_locked 
                        ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                        : 'bg-amber-500 text-neutral-900 hover:bg-amber-600'}"
                    type="button"
                    title={category.is_locked ? 'This category is locked' : 'Create a new thread'}
                >
                    {#if category.is_locked}
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                        Category Locked
                    {:else}
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        New Thread
                    {/if}
                </button>
            {/if}
        </div>
    </div>
    <!-- Sort / count bar -->
    <div class="flex items-center justify-between gap-4 bg-neutral-800/30 p-4">
        <div class="flex items-center gap-3">
            <label class="text-sm text-gray-400" for="sort">Sort:</label>
            <select
                id="sort"
                class="rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
                <option value="recent">Most Recent</option>
                <option value="replies" disabled>Most Replies</option>
                <option value="popular" disabled>Most Popular</option>
            </select>
        </div>
        <div class="text-sm text-gray-400">
            <span>{category.threads.length}</span> threads
        </div>
    </div>
</section>

<!-- New Thread Modal -->
{#if user}
    <NewThreadModal
        bind:isOpen={showNewThreadModal}
        categorySlug={category.slug}
        categoryName={category.name}
        {user}
        {form}
    />
{/if}