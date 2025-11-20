<script lang="ts">
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    onMount(() => {
        // Auto-submit the form when the page loads
        const form = document.querySelector('form');
        if (form) {
            setTimeout(() => form.submit(), 100);
        }
    });
</script>

<main class="min-h-screen bg-neutral-900 text-gray-100 flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-2xl font-bold text-amber-400 mb-4">Logging out...</h1>
        <form method="POST" use:enhance>
            <button type="submit" class="hidden">Logout</button>
        </form>
    </div>
</main>