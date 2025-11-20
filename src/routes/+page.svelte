<script>
    import Header from "$lib/components/Header.svelte";
    import Categories from "$lib/components/Categories.svelte";
    
    let { data } = $props();
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
    <Header totalThreads={data.totalThreads} totalPosts={data.totalPosts} user={data.user}/>
    <Categories categories={data.categories} />
</div>