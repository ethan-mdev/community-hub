<script lang="ts">
    import type { DbCategory } from '$lib/server/db';
    
    type CategoryWithChildren = DbCategory & { children?: DbCategory[]; thread_count?: number };
    let { categories = [] }: { categories: CategoryWithChildren[] } = $props();
</script>

<div id="categoriesContainer" class="grid gap-6">
    {#if !categories || categories.length === 0}
        <div class="text-center py-8 text-gray-400">No categories found.</div>
    {:else}
        {#each categories as category}
            <div class="rounded-xl bg-neutral-900/80 ring-1 ring-neutral-800 overflow-hidden">
                <!-- Category Header -->
                <div class="bg-gradient-to-r from-amber-500/10 to-transparent p-4 border-b border-neutral-800">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full overflow-hidden">
                            {#if category.image}
                                <img src={category.image} alt={category.name} class="w-6 h-6 rounded-full object-cover" />
                            {:else}
                                <div class="w-6 h-6 bg-amber-500/20 rounded-full"></div>
                            {/if}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-xl font-bold text-amber-400">{category.name}</h2>
                            {#if category.description}
                                <p class="text-sm text-gray-400 mt-1">{category.description}</p>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Subcategories -->
                {#if category.children && category.children.length > 0}
                    <div class="p-4 space-y-3">
                        {#each category.children as sub}
                            <a href="/forum/category/{sub.slug}" class="block p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition group">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <h3 class="font-semibold text-gray-100 group-hover:text-amber-400 transition">{sub.name}</h3>
                                        </div>
                                        {#if sub.description}
                                            <p class="text-sm text-gray-400">{sub.description}</p>
                                        {/if}
                                    </div>
                                    <div class="text-right text-sm shrink-0">
                                        <div class="text-gray-400">Threads</div>
                                        <div class="font-semibold text-amber-400">{sub.thread_count || 0}</div>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    {/if}
</div>
