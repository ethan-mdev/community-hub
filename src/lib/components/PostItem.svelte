<script lang="ts">
  import { parseBBCode } from '$lib/utils/bbcode';
  import { getRankByPostCount } from '$lib/utils/ranks';
  
  let { post } = $props();
  
  let contentHtml = $derived(parseBBCode(post.content || ''));
  let rank = $derived(getRankByPostCount(post.author_post_count || 0));
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
    <div class="flex-1 p-6">
      <div class="text-sm text-gray-400 mb-4">
        Posted {new Date(post.created_at).toLocaleString()}
      </div>

      <div class="prose prose-invert max-w-none text-gray-200">
        {@html contentHtml}
      </div>
    </div>

  </div>
</div>
