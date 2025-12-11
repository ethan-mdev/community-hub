<script lang="ts">
	import { enhance } from '$app/forms';
	import type { AuthUser } from '$lib/server/auth';

	let {
		isOpen = false,
		user,
		onClose
	}: {
		isOpen: boolean;
		user: AuthUser & { profile_image?: string | null };
		onClose: () => void;
	} = $props();

	let selectedAvatar = $state<string | null>(null);
	let isSubmitting = $state(false);

	// List of available avatar images
	const avatarImages = [
		'avatar-1.png',
		'avatar-2.png',
		'avatar-3.png',
		'avatar-4.png',
		'avatar-5.png',
		'avatar-6.png',
		'avatar-7.png',
		'avatar-8.png',
		'avatar-9.png',
		'avatar-10.png',
		'avatar-11.png',
		'avatar-12.png',
        'avatar-13.png',
        'avatar-14.png',
        'avatar-15.png',
        'avatar-16.png',
        'avatar-17.png',
        'avatar-18.png',
        'avatar-19.png',
        'avatar-20.png'
	];

	function selectAvatar(avatar: string) {
		selectedAvatar = avatar;
	}

	function closeModal() {
		selectedAvatar = null;
		onClose();
	}

	// Close modal when clicking outside
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="button"
		tabindex="0"
	>
		<div class="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 p-6">
			<h3 class="mb-4 text-lg font-semibold text-gray-100">Choose Profile Image</h3>

			<div class="mb-6 grid max-h-80 grid-cols-4 gap-4 overflow-y-auto">
				{#each avatarImages as avatar}
					<button
						type="button"
						onclick={() => selectAvatar(avatar)}
						class="h-16 w-16 overflow-hidden rounded-full border-2 transition-colors {selectedAvatar ===
						avatar
							? 'border-amber-500'
							: 'border-neutral-700 hover:border-amber-500'}"
					>
						<img src="/avatars/{avatar}" alt="Avatar option" class="h-full w-full object-cover" />
					</button>
				{/each}
			</div>

			<form
				method="POST"
				action="/profile/update-avatar"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							closeModal();
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="avatar" value={selectedAvatar || ''} />

				<div class="flex gap-3">
					<button
						type="button"
						onclick={closeModal}
						class="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-gray-300 transition-colors hover:bg-neutral-800"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!selectedAvatar || isSubmitting}
						class="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-neutral-900 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-500/50"
					>
						{isSubmitting ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
