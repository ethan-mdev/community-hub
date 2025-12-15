<script lang="ts">
	import type { AuthUser } from '$lib/server/auth';
	import ProfileModal from './ProfileModal.svelte';

	let {
		totalThreads = 0,
		totalPosts = 0,
		user
	}: {
		totalThreads: number;
		totalPosts: number;
		user: (AuthUser & { profile_image?: string | null }) | null;
	} = $props();

	let showProfileModal = $state(false);

	function openProfileModal() {
		if (user) {
			showProfileModal = true;
		}
	}

	function closeProfileModal() {
		showProfileModal = false;
	}
</script>

<header class="mb-8">
	<h1 class="mb-4 text-4xl font-bold text-amber-400">Game Forum</h1>
	<p class="text-lg text-gray-400">Welcome to our community discussion boards</p>
</header>

<div class="mb-6 rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex gap-6">
			<div>
				<div class="text-2xl font-bold text-amber-400">{totalThreads}</div>
				<div class="text-sm text-gray-400">Threads</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-sky-400">{totalPosts}</div>
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

			<div class="ml-3 flex items-center gap-3 border-l border-neutral-700 pl-3">
				{#if user}
					<button
						type="button"
						onclick={openProfileModal}
						class="flex items-center gap-3 transition-opacity hover:opacity-80"
					>
						<img
							src={user.profile_image ? `/avatars/${user.profile_image}` : '/avatars/avatar-1.png'}
							alt="User Avatar"
							class="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500/50"
						/>
						<div class="flex flex-col items-start">
							<span class="text-sm font-semibold text-gray-100">{user.username}</span>
							<div class="flex gap-1">
								{#if user.role === 'admin'}
									<span
										class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400"
									>
										ADMIN
									</span>
								{:else}
									<span
										class="rounded bg-slate-500/20 px-2 py-0.5 text-xs font-semibold text-slate-300"
									>
										MEMBER
									</span>
								{/if}
							</div>
						</div>
					</button>
				{:else}
					<img
						src="/avatars/avatar-1.png"
						alt="Default Avatar"
						class="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500/50"
					/>
					<div class="flex flex-col items-start">
						<span class="text-sm font-semibold text-gray-100">Guest</span>
						<div class="flex gap-1">
							<span
								class="rounded bg-slate-500/20 px-1.5 py-0.5 text-xs font-semibold text-slate-300"
								>GUEST</span
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if user && showProfileModal}
	<ProfileModal isOpen={showProfileModal} {user} onClose={closeProfileModal} />
{/if}
