<script lang="ts">
  import ThreadModMenu from './ThreadModMenu.svelte';
  
  export let thread;
  export let user;
</script>

<div class="rounded-xl bg-neutral-900/80 ring-1 ring-neutral-800 mb-6">
    <div class="bg-linear-to-r from-amber-500/10 to-transparent p-6">
        <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
                <h1 class="text-3xl font-bold text-amber-400">{thread.title}</h1>

                <div class="text-gray-400 text-sm flex items-center gap-3 mt-2">
                    <span>Started by <span class="text-amber-400">{thread.author_username}</span></span>
                    <span>•</span>
                    <span>{new Date(thread.created_at).toLocaleString()}</span>
                </div>
            </div>
            
            <ThreadModMenu {thread} {user} />
        </div>
    </div>
</div>
