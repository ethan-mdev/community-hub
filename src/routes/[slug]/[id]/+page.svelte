<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import ThreadHeader from '$lib/components/ThreadHeader.svelte';
	import PostItem from '$lib/components/PostItem.svelte';
	import ReplyForm from '$lib/components/ReplyForm.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data, form } = $props();
</script>

<main class="container mx-auto max-w-6xl px-4 py-8">
	<Breadcrumb
		items={[
			{ label: 'Forums', href: '/' },
			{ label: data.thread.category_name, href: `/${data.thread.category_slug}` },
			{ label: data.thread.title }
		]}
	/>

	<!-- Thread header -->
	<ThreadHeader thread={data.thread} user={data.user} />

	<!-- Posts -->
	<div class="mt-6 space-y-6">
		{#each data.posts as post, i}
			<PostItem post={post} user={data.user} />
		{/each}
	</div>

	<!-- Pagination -->
	<Pagination
		currentPage={data.pagination.currentPage}
		totalPages={data.pagination.totalPages}
		baseUrl={`/${data.thread.category_slug}/${data.thread.id}`}
	/>

	<!-- Reply Form -->
	<ReplyForm 
		user={data.user} 
		threadId={data.thread.id}
		thread={data.thread}
		{form}
	/>
</main>
