<script lang="ts">
  import { enhance } from '$app/forms';
  
  let { thread, user } = $props<{ thread: any; user: any }>();
  let showMenu = $state(false);
</script>

{#if user?.role === 'admin'}
  <div class="relative inline-block">
    <button
      type="button"
      onclick={() => showMenu = !showMenu}
      class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-neutral-800 hover:text-amber-400 transition"
      title="Moderator Actions"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
      </svg>
    </button>
    
    {#if showMenu}
      <div class="absolute right-0 mt-2 w-48 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl z-50">
        <div class="p-1">
          <!-- Pin/Unpin -->
          <form method="POST" action="?/toggleSticky" use:enhance={() => {
            return async ({ update }) => {
              showMenu = false;
              await update();
            };
          }}>
            <button
              type="submit"
              class="w-full flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-amber-400 transition text-left"
            >
              {#if thread.is_sticky}
                <span>📌</span>
                <span>Unpin Thread</span>
              {:else}
                <span>📌</span>
                <span>Pin Thread</span>
              {/if}
            </button>
          </form>
          
          <!-- Lock/Unlock -->
          <form method="POST" action="?/toggleLock" use:enhance={() => {
            return async ({ update }) => {
              showMenu = false;
              await update();
            };
          }}>
            <button
              type="submit"
              class="w-full flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-amber-400 transition text-left"
            >
              {#if thread.is_locked}
                <span>🔓</span>
                <span>Unlock Thread</span>
              {:else}
                <span>🔒</span>
                <span>Lock Thread</span>
              {/if}
            </button>
          </form>
          
          <!-- Delete -->
          <div class="border-t border-neutral-800 my-1"></div>
          <form method="POST" action="?/deleteThread" onsubmit={(e) => {
            if (!confirm('Are you sure you want to delete this thread? This cannot be undone.')) {
              e.preventDefault();
            }
          }}>
            <button
              type="submit"
              class="w-full flex items-center gap-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
            >
              <span>🗑️</span>
              <span>Delete Thread</span>
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div>
{/if}
