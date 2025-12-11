<script lang="ts">
    import type { AuthUser } from "$lib/server/auth";
    let { user }: { user: (AuthUser & { profile_image?: string | null }) | null } = $props();
</script>

<nav class="px-6 py-4 flex justify-end">
  <div class="space-x-6">
    {#if user}
        <a href="/logout" class="hover:text-amber-300">Logout</a>
    {:else}
        <a href="/login" class="hover:text-amber-300">Login</a>
    {/if}
  </div>
</nav>
