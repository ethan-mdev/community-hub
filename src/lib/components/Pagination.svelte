<script lang="ts">
    let { currentPage, totalPages, baseUrl } = $props<{
        currentPage: number;
        totalPages: number;
        baseUrl: string;
    }>();
    
    function getPageUrl(page: number): string {
        return `${baseUrl}?page=${page}`;
    }
    
    // Generate page numbers to show
    function getVisiblePages(current: number, total: number): number[] {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        
        if (current <= 4) {
            return [1, 2, 3, 4, 5, -1, total];
        }
        
        if (current >= total - 3) {
            return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
        }
        
        return [1, -1, current - 1, current, current + 1, -1, total];
    }
    
    const visiblePages = $derived(getVisiblePages(currentPage, totalPages));
</script>

{#if totalPages > 1}
    <nav class="flex items-center justify-center gap-2 mt-8">
        <!-- Previous Button -->
        {#if currentPage > 1}
            <a
                href={getPageUrl(currentPage - 1)}
                class="px-3 py-2 text-sm rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white transition"
            >
                ← Previous
            </a>
        {:else}
            <span class="px-3 py-2 text-sm rounded-lg bg-neutral-900 text-gray-500 cursor-not-allowed">
                ← Previous
            </span>
        {/if}
        
        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
            {#each visiblePages as page}
                {#if page === -1}
                    <span class="px-3 py-2 text-gray-500">...</span>
                {:else if page === currentPage}
                    <span class="px-3 py-2 text-sm rounded-lg bg-amber-500 text-black font-semibold">
                        {page}
                    </span>
                {:else}
                    <a
                        href={getPageUrl(page)}
                        class="px-3 py-2 text-sm rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white transition"
                    >
                        {page}
                    </a>
                {/if}
            {/each}
        </div>
        
        <!-- Next Button -->
        {#if currentPage < totalPages}
            <a
                href={getPageUrl(currentPage + 1)}
                class="px-3 py-2 text-sm rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white transition"
            >
                Next →
            </a>
        {:else}
            <span class="px-3 py-2 text-sm rounded-lg bg-neutral-900 text-gray-500 cursor-not-allowed">
                Next →
            </span>
        {/if}
    </nav>
    
    <!-- Page Info -->
    <div class="text-center text-sm text-gray-500 mt-4">
        Page {currentPage} of {totalPages}
    </div>
{/if}