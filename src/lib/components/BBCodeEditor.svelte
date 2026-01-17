<script lang="ts">
	import { parseBBCode } from '$lib/utils/bbcode';

	let {
		value = $bindable(''),
		placeholder = 'Write your post...',
		minHeight = '200px'
	}: {
		value?: string;
		placeholder?: string;
		minHeight?: string;
	} = $props();

	let showPreview = $state(false);
	let previewHtml = $state('');

	function insertBBCode(before: string, after: string = '') {
		const textarea = document.getElementById('bbcode-editor') as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

		value = newText;

		setTimeout(() => {
			textarea.focus();
			const newCursorPos = start + before.length + selectedText.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	}

	function togglePreview() {
		if (!showPreview) {
			previewHtml = parseBBCode(value);
		}
		showPreview = !showPreview;
	}

	const buttons = [
		{ label: 'B', title: 'Bold', action: () => insertBBCode('[b]', '[/b]') },
		{ label: 'I', title: 'Italic', action: () => insertBBCode('[i]', '[/i]') },
		{ label: 'U', title: 'Underline', action: () => insertBBCode('[u]', '[/u]') },
		{ label: 'S', title: 'Strikethrough', action: () => insertBBCode('[s]', '[/s]') },
		{ label: 'Code', title: 'Code', action: () => insertBBCode('[code]', '[/code]') },
		{ label: 'Link', title: 'Link', action: () => insertBBCode('[url=]', '[/url]') },
		{ label: 'Image', title: 'Image', action: () => insertBBCode('[img]', '[/img]') }
	];
</script>

<div class="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 border-b border-neutral-700 bg-neutral-800/50 p-2">
		{#each buttons as btn}
			<button
				type="button"
				onclick={btn.action}
				title={btn.title}
				class="rounded bg-neutral-700 px-2 py-1 text-xs font-semibold text-gray-300 transition hover:bg-neutral-600 hover:text-white"
			>
				{btn.label}
			</button>
		{/each}

		<div class="ml-auto">
			<button
				type="button"
				onclick={togglePreview}
				class="rounded bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/30"
			>
				{showPreview ? 'Edit' : 'Preview'}
			</button>
		</div>
	</div>

	<!-- Editor / Preview -->
	{#if showPreview}
		<div class="min-h-[{minHeight}] bg-neutral-900 p-4 text-gray-200" style="min-height: {minHeight}">
			<div class="prose-invert space-y-3">
				{@html previewHtml}
			</div>
		</div>
	{:else}
		<textarea
			id="bbcode-editor"
			bind:value
			{placeholder}
			style="min-height: {minHeight}"
			class="w-full resize-y bg-neutral-900 p-4 font-mono text-gray-200 placeholder-gray-500 focus:outline-none"
		></textarea>
	{/if}
</div>
