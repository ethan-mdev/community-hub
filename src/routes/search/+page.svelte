<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Search{data.query ? `: ${data.query}` : ''} - Forum</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Search Header -->
	<div class="mb-8">
		<h1 class="mb-4 text-4xl font-bold text-amber-400">Search Results</h1>
		{#if data.query}
			<p class="text-lg text-gray-400">
				Found <span class="font-semibold text-amber-400">{data.pagination.totalResults}</span>
				{data.pagination.totalResults === 1 ? 'result' : 'results'} for "{data.query}"
			</p>
		{:else}
			<p class="text-lg text-gray-400">Enter a search term to find threads and posts</p>
		{/if}
	</div>

	<!-- Error Message -->
	{#if data.error}
		<div class="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
			<p class="text-red-400">{data.error}</p>
		</div>
	{/if}

	<!-- Search Results -->
	{#if data.results.length > 0}
		<div class="space-y-4">
			{#each data.results as result}
				<div class="rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800 transition hover:ring-neutral-700">
					<div class="mb-2 flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-2">
								{#if result.type === 'thread'}
									<span class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
										THREAD
									</span>
								{:else}
									<span class="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-400">
										POST
									</span>
								{/if}
								<span class="text-xs text-gray-500">in</span>
								<a
									href="/{result.category_slug}"
									class="text-xs text-gray-400 hover:text-amber-400 transition"
								>
									{result.category_name}
								</a>
							</div>
							
							<a
								href={result.type === 'thread' 
									? `/${result.category_slug}/${result.thread_id}` 
									: `/${result.category_slug}/${result.thread_id}#post-${result.post_id}`}
								class="text-xl font-semibold text-gray-200 hover:text-amber-400 transition"
							>
								{result.thread_title}
							</a>
						</div>
					</div>

					<div class="mt-3 text-sm text-gray-400">
						<span class="font-medium text-amber-400">{result.author_username}</span>
						· {new Date(result.created_at).toLocaleString()}
					</div>

					{#if result.type === 'post'}
						<div class="mt-4 rounded bg-neutral-800/50 p-3 text-sm text-gray-300 line-clamp-3">
							{result.content.substring(0, 200)}...
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.pagination.totalPages > 1}
			<div class="mt-8">
				<Pagination
					currentPage={data.pagination.currentPage}
					totalPages={data.pagination.totalPages}
					baseUrl="/search?q={encodeURIComponent(data.query)}"
				/>
			</div>
		{/if}
	{:else if data.query}
		<div class="rounded-xl bg-neutral-900/80 p-12 text-center ring-1 ring-neutral-800">
			<svg class="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
			</svg>
			<h2 class="text-xl font-semibold text-gray-400 mb-2">No results found</h2>
			<p class="text-gray-500">Try different keywords or check your spelling</p>
		</div>
	{/if}
</div>
