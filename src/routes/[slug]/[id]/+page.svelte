<script lang="ts">
    import type { PageData } from './$types';
    import Breadcrumb from '$lib/components/Breadcrumb.svelte';
    
    let { data }: { data: PageData } = $props();
</script>

<main class="container mx-auto max-w-6xl px-4 py-8">
    <Breadcrumb items={[
        { label: 'Forums', href: '/' },
        { label: data.thread.category_name, href: `/${data.thread.category_slug}` },
        { label: data.thread.title }
    ]} />
</main>
