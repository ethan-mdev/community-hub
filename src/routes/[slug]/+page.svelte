<script lang="ts">
    import type { DbThread, DbCategory } from '$lib/server/db';
    import Breadcrumb from '$lib/components/Breadcrumb.svelte';
    import CategoryHeader from '$lib/components/CategoryHeader.svelte';
    import ThreadList from '$lib/components/ThreadList.svelte';

    let { data }: { data: { category: DbCategory & { threads: DbThread[] } } } = $props();
</script>

<main class="container mx-auto max-w-6xl px-4 py-8">
    <Breadcrumb categoryName={data.category.name} />
    <CategoryHeader category={data.category} />
    <ThreadList threads={data.category.threads} categorySlug={data.category.slug} />
</main>
