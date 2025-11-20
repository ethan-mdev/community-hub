<script lang="ts">
    import { enhance } from '$app/forms';
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
                        ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-b-2 border-amber-500' 
                        : 'text-gray-400 hover:text-gray-300'}"
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onclick={toggleMode}
                    class="flex-1 px-6 py-4 text-sm font-semibold transition {!isLogin 
                        ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-b-2 border-amber-500' 
                        : 'text-gray-400 hover:text-gray-300'}"
                >
                    Register
                </button>
            </div>

            <!-- Form Content -->
            <div class="p-6">
                {#if form?.error}
                    <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p class="text-red-400 text-sm">{form.error}</p>
                    </div>
                {/if}

                <form
                    method="POST"
                    action="?/{isLogin ? 'login' : 'register'}"
                    use:enhance={() => {
                        isLoading = true;
                        return async ({ update }) => {
                            isLoading = false;
                            await update();
                        };
                    }}
                    class="space-y-4"
                >
                    <!-- Login: Username, Register: Email -->
                    <div>
                        <label for={isLogin ? "username" : "email"} class="block text-sm font-medium text-gray-300 mb-2">
                            {isLogin ? "Username" : "Email Address"}
                        </label>
                        <input
                            id={isLogin ? "username" : "email"}
                            name={isLogin ? "username" : "email"}
                            type={isLogin ? "text" : "email"}
                            required
                            value={form?.[isLogin ? "username" : "email"] ?? ''}
                            class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            placeholder={isLogin ? "Enter your username" : "Enter your email"}
                        />
                    </div>

                    <!-- Username Field (Register only) -->
                    {#if !isLogin}
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={form?.username ?? ''}
                                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Choose a username"
                            />
                        </div>
                    {/if}

                    <!-- Password Field -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            placeholder="Enter your password"
                        />
                    </div>

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


