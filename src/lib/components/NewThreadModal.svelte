<script lang="ts">
    import { enhance } from '$app/forms';
    import { browser } from '$app/environment';
    import ErrorMessage from './ErrorMessage.svelte';
    
    let { 
        isOpen = $bindable(),
        categorySlug,
        categoryName,
        user,
        form 
    } = $props<{
        isOpen: boolean;
        categorySlug: string;
        categoryName: string;
        user: any;
        form?: any;
    }>();
    
    let dialog: HTMLDialogElement;
    let isSubmitting = $state(false);
    
    // Watch isOpen changes to control dialog
    $effect(() => {
        if (browser && dialog) {
            if (isOpen) {
                dialog.showModal();
                document.body.style.overflow = 'hidden';
            } else {
                dialog.close();
                document.body.style.overflow = '';
            }
        }
    });
    
    function closeModal() {
        isOpen = false;
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === dialog) {
            closeModal();
        }
    }
</script>

<dialog 
    bind:this={dialog}
    onkeydown={handleKeydown}
    onclick={handleBackdropClick}
    class="backdrop:bg-black/50 bg-transparent p-0 max-w-2xl w-full m-auto"
>
    <div class="bg-neutral-900 rounded-xl ring-1 ring-neutral-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-800">
            <div>
                <h2 class="text-xl font-bold text-amber-400">Create New Thread</h2>
                <p class="text-sm text-gray-400 mt-1">in {categoryName}</p>
            </div>
            
            <button
                onclick={closeModal}
                class="p-2 rounded-lg bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white transition"
                aria-label="Close modal"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Modal Content -->
        <form 
            method="POST"
            action="/{categorySlug}?/createThread"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ result, update }) => {
                    isSubmitting = false;
                    if (result.type === 'redirect') {
                        closeModal();
                    }
                    await update();
                };
            }}
            class="p-6 space-y-6"
        >
            <ErrorMessage error={form?.error} />
            
            <!-- Thread Title -->
            <div>
                <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
                    Thread Title <span class="text-red-400">*</span>
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    maxlength="200"
                    placeholder="Enter your thread title..."
                    value={form?.title ?? ''}
                    class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-gray-200 placeholder-gray-500"
                />
                <div class="text-xs text-gray-500 mt-1">
                    Be descriptive and specific to attract the right audience
                </div>
            </div>

            <!-- Thread Content -->
            <div>
                <label for="content" class="block text-sm font-medium text-gray-300 mb-2">
                    Initial Post <span class="text-red-400">*</span>
                </label>
                <textarea
                    id="content"
                    name="content"
                    rows="8"
                    required
                    placeholder="Start the conversation..."
                    class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-gray-200 placeholder-gray-500 resize-y"
                >{form?.content ?? ''}</textarea>
                <div class="text-xs text-gray-500 mt-1">
                    Provide context and details to encourage meaningful discussion
                </div>
            </div>



            <!-- Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-neutral-800">
                <div class="text-sm text-gray-400">
                    Posting as <span class="text-amber-400">{user?.username}</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <button
                        type="button"
                        onclick={closeModal}
                        class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition flex items-center gap-2"
                    >
                        {#if isSubmitting}
                            <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        {/if}
                        {isSubmitting ? 'Creating...' : 'Create Thread'}
                    </button>
                </div>
            </div>
        </form>
    </div>
</dialog>