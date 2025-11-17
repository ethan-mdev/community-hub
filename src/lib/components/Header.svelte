<header class="mb-8">
	<h1 class="mb-4 text-4xl font-bold text-amber-400">Game Forum</h1>
	<p class="text-lg text-gray-400">Welcome to our community discussion boards</p>
</header>

<div class="mb-6 rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex gap-6">
			<div>
				<div class="text-2xl font-bold text-amber-400" id="totalThreads">-</div>
				<div class="text-sm text-gray-400">Threads</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-sky-400" id="totalPosts">-</div>
				<div class="text-sm text-gray-400">Posts</div>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<input
				type="text"
				placeholder="Search forums..."
				class="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
				id="searchInput"
			/>
			<button
				id="searchBtn"
				class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-amber-600"
			>
				Search
			</button>
		</div>
	</div>
</div>
