<script lang="ts">
    import type { DbThread, DbPost } from '$lib/server/db';
    import Breadcrumb from '$lib/components/Breadcrumb.svelte';
</script>

<main class="container mx-auto max-w-6xl px-4 py-8">
    <!-- TODO: Expand functionality of breadcrumb later to do dynamic thread navigation -->
    <Breadcrumb categoryName="hello"/>

</main>
