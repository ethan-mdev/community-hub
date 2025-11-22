<script lang="ts">
  export let post;
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
        <h3 class="font-semibold text-amber-400 mb-1">{post.author_username}</h3>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <div class="text-sm text-gray-400 mb-4">
        Posted {new Date(post.created_at).toLocaleString()}
      </div>

      <div class="prose prose-invert max-w-none text-gray-200 whitespace-pre-line">
        {post.content}
      </div>
    </div>

  </div>
</div>
