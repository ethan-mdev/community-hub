<script lang="ts">
    let { categoryName }: { categoryName: string } = $props();
</script>

<!-- Breadcrumb -->
<div class="mb-6">
    <div class="flex items-center gap-2 text-sm">
        <a href="/" class="text-amber-400 hover:text-amber-300">Forums</a>
        <span class="text-gray-600">/</span>
        <span class="text-gray-400">{categoryName}</span>
    </div>
</div>