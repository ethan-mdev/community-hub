<script lang="ts">
    import { enhance } from '$app/forms';
    import FormField from '$lib/components/FormField.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import type { ActionData } from './$types';
    
    let { form }: { form: ActionData } = $props();
    
    let isLogin = $state(true);
    let isLoading = $state(false);
    
    function toggleMode() {
        isLogin = !isLogin;
    }
</script>

<svelte:head>
    <title>{isLogin ? 'Login' : 'Register'} - Game Forum</title>
</svelte:head>

<main class="min-h-screen bg-neutral-900 text-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-amber-400 mb-2">Game Forum</h1>
            <p class="text-gray-400">Welcome to our community discussion boards</p>
        </div>

        <!-- Main Form Card -->
        <div class="rounded-xl bg-neutral-900/80 ring-1 ring-neutral-800 overflow-hidden">
            <!-- Tab Headers -->
            <div class="flex border-b border-neutral-800">
                <button
                    type="button"
                    onclick={toggleMode}
                    class="flex-1 px-6 py-4 text-sm font-semibold transition {isLogin 
                        ? 'bg-linear-to-r from-amber-500/10 to-transparent text-amber-400 border-b-2 border-amber-500' 
                        : 'text-gray-400 hover:text-gray-300'}"
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onclick={toggleMode}
                    class="flex-1 px-6 py-4 text-sm font-semibold transition {!isLogin 
                        ? 'bg-linear-to-r from-amber-500/10 to-transparent text-amber-400 border-b-2 border-amber-500' 
                        : 'text-gray-400 hover:text-gray-300'}"
                >
                    Register
                </button>
            </div>

            <!-- Form Content -->
            <div class="p-6">
                {#if form?.error}
                    <ErrorMessage error={form.error} />
                {/if}

                <form
                    method="POST"
                    action="?/{isLogin ? 'login' : 'register'}"
                    use:enhance={() => {
                        isLoading = true;
                        return async ({ result, update }) => {
                            isLoading = false;
                            await update();
                        };
                    }}
                    class="space-y-4"
                >
                    <FormField
                        id={isLogin ? "username" : "email"}
                        name={isLogin ? "username" : "email"}
                        type={isLogin ? "text" : "email"}
                        label={isLogin ? "Username" : "Email Address"}
                        placeholder={isLogin ? "Enter your username" : "Enter your email"}
                        required={true}
                        value={form?.[isLogin ? "username" : "email"] ?? ''}
                    />

                    {#if !isLogin}
                        <FormField
                            id="username"
                            name="username"
                            type="text"
                            label="Username"
                            placeholder="Choose a username"
                            required={true}
                            value={form?.username ?? ''}
                        />
                    {/if}

                    <FormField
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        required={true}
                    />

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        disabled={isLoading}
                        class="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-neutral-900 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {#if isLoading}
                            <div class="w-4 h-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin"></div>
                        {/if}
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>

        <!-- Back to Forum Link -->
        <div class="mt-6 text-center">
            <a
                href="/"
                class="text-sm text-gray-400 hover:text-amber-400 transition flex items-center justify-center gap-2"
            >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
                </svg>
                Back to Forum
            </a>
        </div>
    </div>
</main>


