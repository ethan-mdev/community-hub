<script lang="ts">
    import { enhance } from '$app/forms';
    import ErrorMessage from './ErrorMessage.svelte';
    
    let { user, threadId, thread, form } = $props<{ 
        user: any; 
        threadId: number;
        thread: any;
        form?: any; 
    }>();
    
    let isSubmitting = $state(false);
</script>

{#if user}
    {#if thread.is_locked}
        <div class="mt-10 rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800">
            <div class="flex items-center gap-3 text-amber-500">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                <div>
                    <h3 class="font-semibold">Thread Locked</h3>
                    <p class="text-sm text-gray-400">This thread has been locked and is no longer accepting new replies.</p>
                </div>
            </div>
        </div>
    {:else}
    <form 
        method="POST" 
        use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
                isSubmitting = false;
                await update();
            };
        }} 
        class="mt-10"
    >
        <div class="space-y-4 rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800">
            <h2 class="text-xl font-bold text-amber-400">Post a Reply</h2>
            
            <ErrorMessage error={form?.error} />

            <div>
                <textarea
                    name="content"
                    rows="6"
                    required
                    placeholder="Write your reply..."
                    class="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-gray-200 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                ></textarea>
            </div>

            <div class="flex justify-between items-center">
                <div class="text-sm text-gray-400">
                    Posting as <span class="text-amber-400">{user.username}</span>
                </div>
                
                <button
                    type="submit"
                    formaction="?/reply"
                    disabled={isSubmitting}
                    class="rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    {#if isSubmitting}
                        <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    {/if}
                    {isSubmitting ? 'Posting...' : 'Submit Reply'}
                </button>
            </div>
        </div>
    </form>
    {/if}
{:else}
    <div class="mt-10 rounded-xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800 text-center">
        <p class="text-gray-400 mb-4">You need to be logged in to post a reply</p>
        <a 
            href="/login" 
            class="inline-block rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400 transition"
        >
            Log In
        </a>
    </div>
{/if}