<script lang="ts">
    let { error } = $props<{ error?: string }>();
</script>

{#if error}
    <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p class="text-red-400 text-sm">{error}</p>
    </div>
{/if}