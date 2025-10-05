<script lang="ts">
	import { goto } from '$app/navigation';
	import axios from 'axios';
    import {declineRequest, acceptRequest, error} from "$lib/stores/follow.store.js";
    export let data;

    const requests = data.followRequests


</script>
{#if error.status}
    <div class="bg-red-500 fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg">
        <div class="text-white font-semibold">{error.message}</div>
    </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
    {#if requests.length <= 0}
        <div class="h-screen flex flex-col items-center justify-center text-center">
            <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <i class="fa-solid fa-user-plus text-4xl text-slate-400"></i>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Takip İsteği Bulunmuyor</h2>
            <p class="text-slate-400">Yeni istekler burada görünecek</p>
        </div>
    {:else}
        <div class="max-w-4xl mx-auto pt-8">
            <h1 class="text-3xl font-bold text-white mb-8 text-center">Takip İstekleri</h1>
            <div class="space-y-4">
                {#each requests as request}
                    <div class="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
                        <div class="flex items-center gap-4">
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div class="flex items-center gap-4 flex-1 cursor-pointer" on:click={() => goto('/' + request.username)}>
                                <img 
                                    src="{request.profilePhoto}" 
                                    class="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover ring-2 ring-slate-700 hover:ring-purple-500 transition-all" 
                                    alt="{request.username}"
                                >
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-lg lg:text-xl font-semibold text-white hover:text-purple-300 transition-colors truncate">
                                        @{request.username}
                                    </h3>
                                    <p class="text-slate-400 text-sm">Takip etmek istiyor</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-3">
                                <button 
                                    class="px-4 py-2 lg:px-6 lg:py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500 min-w-[80px] lg:min-w-[100px]" 
                                    aria-label="Reddet" 
                                    on:click={() => declineRequest(request.username)}
                                >
                                    <i class="fa-solid fa-x text-sm"></i>
                                    <span class="hidden sm:inline">Reddet</span>
                                </button>
                                <button 
                                    class="px-4 py-2 lg:px-6 lg:py-3 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-green-500/30 hover:border-green-500 min-w-[80px] lg:min-w-[100px]" 
                                    aria-label="Kabul et" 
                                    on:click={() => acceptRequest(request.username)}
                                >
                                    <i class="fa-solid fa-check text-sm"></i>
                                    <span class="hidden sm:inline">Kabul Et</span>
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>