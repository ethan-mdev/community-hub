<script lang="ts">
    import Breadcrumb from '$lib/components/Breadcrumb.svelte';
    import CategoryHeader from '$lib/components/CategoryHeader.svelte';
    import ThreadList from '$lib/components/ThreadList.svelte';
    import type { PageData } from './$types';

    let { data, form }: { data: PageData, form: any } = $props();
</script>

<main class="container mx-auto max-w-6xl px-4 py-8">
    <Breadcrumb items={[
        { label: 'Forums', href: '/' },
        { label: data.category.name }
    ]} />
    <CategoryHeader category={data.category } user={data.user} {form} />
    <ThreadList threads={data.category.threads} categorySlug={data.category.slug} />
</main>
