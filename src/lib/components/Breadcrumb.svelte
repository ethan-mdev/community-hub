<script lang="ts">
    interface BreadcrumbItem {
        label: string;
        href?: string;
    }
    
    let { items }: { items: BreadcrumbItem[] } = $props();
</script>

<!-- Breadcrumb -->
<div class="mb-6">
    <div class="flex items-center gap-2 text-sm">
        {#each items as item, index}
            {#if item.href}
                <a href={item.href} class="text-amber-400 hover:text-amber-300">
                    {item.label}
                </a>
            {:else}
                <span class="text-gray-400">{item.label}</span>
            {/if}
            
            {#if index < items.length - 1}
                <span class="text-gray-600">/</span>
            {/if}
        {/each}
    </div>
</div>