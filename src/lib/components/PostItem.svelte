<script lang="ts">
  import { parseBBCode } from '$lib/utils/bbcode';
  import { getRankByPostCount } from '$lib/utils/ranks';
  import { enhance } from '$app/forms';
  
  let { post, user } = $props<{ post: any; user: any }>();
  
  let contentHtml = $derived(parseBBCode(post.content || ''));
  let rank = $derived(getRankByPostCount(post.author_post_count || 0));
  let showReactionMenu = $state(false);
  
  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'heart', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'angry', emoji: '😡', label: 'Angry' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' }
  ];
  
  // Get reactions that have counts > 0
  let activeReactions = $derived(
    reactions.filter(r => post.reactions && post.reactions[r.type] > 0)
  );
</script>

<div class="rounded-xl bg-neutral-900/80 ring-1 ring-neutral-800 overflow-hidden">
  <div class="flex flex-col md:flex-row">
      
    <!-- Sidebar -->
    <div class="w-full md:w-48 bg-neutral-800/50 p-6 border-b md:border-b-0 md:border-r border-neutral-700">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-neutral-900 font-bold text-xl border-2 border-amber-400 overflow-hidden">
          {#if post.author_profile_image}
            <img src="/avatars/{post.author_profile_image}" alt={post.author_username} class="w-16 h-16 rounded-full object-cover" />
          {:else}
            <img src="/avatars/avatar-1.png" alt="Default Avatar" class="w-16 h-16 rounded-full object-cover" />
          {/if}
        </div>
        <h3 class="font-semibold text-amber-400 mb-2">{post.author_username}</h3>
        
        <div class="mb-2 space-y-1">
          {#if post.author_role === 'admin'}
            <span class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              ADMIN
            </span>
          {:else}
            <span class="rounded bg-slate-500/20 px-2 py-0.5 text-xs font-semibold text-slate-300">
              MEMBER
            </span>
          {/if}
          
          <!-- Rank Badge -->
          <div>
            <span class="rounded {rank.bgColor} px-2 py-0.5 text-xs font-semibold {rank.color}">
              {rank.name}
            </span>
          </div>
        </div>
        {#if post.author_post_count !== undefined}
          <div class="text-xs font-medium text-gray-400 mt-4 flex flex-col space-y-1">
            <span>Posts: {post.author_post_count}</span>
            <span>Joined: {new Date(post.author_joined_at).toLocaleDateString()}</span>
          </div>
        {/if}
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 p-6 flex flex-col">
      <div class="text-sm text-gray-400 mb-4">
        Posted {new Date(post.created_at).toLocaleString()}
      </div>

      <div class="prose prose-invert max-w-none text-gray-200 mb-4 flex-1">
        {@html contentHtml}
      </div>
      
      <!-- Reactions Area - Always at bottom -->
      <div class="flex items-center justify-between border-t border-neutral-800 pt-3">
        <!-- Active Reactions (left side) -->
        <div class="flex items-center gap-1">
          {#if activeReactions.length > 0}
            {#each activeReactions as reaction}
              <form method="POST" action="?/react" use:enhance class="inline">
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="reactionType" value={reaction.type} />
                <button
                  type="submit"
                  disabled={!user}
                  class="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition
                    {post.userReactions?.includes(reaction.type) 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-neutral-800/50 text-gray-400 hover:bg-neutral-800 hover:text-gray-300'}
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  title={user ? reaction.label : 'Login to react'}
                >
                  <span class="text-sm">{reaction.emoji}</span>
                  <span class="font-medium">{post.reactions[reaction.type]}</span>
                </button>
              </form>
            {/each}
          {/if}
        </div>
        
        <!-- Reaction Menu Button (right side) -->
        {#if user}
          <div class="relative">
            <button
              type="button"
              onclick={() => showReactionMenu = !showReactionMenu}
              class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-neutral-800 hover:text-gray-400 transition"
              title="React"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>React</span>
            </button>
            
            {#if showReactionMenu}
              <div class="absolute right-0 bottom-full mb-1 flex items-center gap-1 bg-neutral-900 rounded-lg border border-neutral-700 p-1 shadow-lg z-10">
                {#each reactions as reaction}
                  <form method="POST" action="?/react" use:enhance={() => {
                    return async ({ update }) => {
                      showReactionMenu = false;
                      await update();
                    };
                  }} class="inline">
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="reactionType" value={reaction.type} />
                    <button
                      type="submit"
                      class="flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-800 transition text-lg"
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </button>
                  </form>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a href="/login" class="text-xs text-gray-500 hover:text-gray-400">
            Login to react
          </a>
        {/if}
      </div>
    </div>

  </div>
</div>
