<script lang="ts">
import { browser } from '$app/environment';
import axios from "axios";
import { getCookie } from "../../utils/cookies.util";
import { goto } from "$app/navigation";
import { declineRequest, acceptRequest } from "$lib/stores/follow.store";
import { socket } from '$lib/socket';
export let user;
let search = '';
let mode = 0;
let requests: any = [];
let isOpen = false;

// Sidebar'ı toggle etmek için
function toggleSidebar() {
    isOpen = !isOpen;
}

// Dışarı tıklandığında sidebar'ı kapatmak için
function handleOutsideClick(event: MouseEvent) {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger-btn');
    
    if (sidebar && hamburger && !sidebar.contains(event.target as Node) && !hamburger.contains(event.target as Node)) {
        isOpen = false;
    }
}

// sadece browser'da çalıştır
if (browser) {
    if(socket) 
     socket.on("followRequest", (data) => {
        axios({
            url: 'http://localhost:3000/getFollowRequests',
            method: 'get',
            headers: {
                Authorization: 'Bearer ' + getCookie('token')
            }
        }).then((response) => {
            requests = response.data
        })
    });
}

$: if (browser && mode == 3) {
    axios({
        url: 'http://localhost:3000/getFollowRequests',
        method: 'get',
        headers: {
            Authorization: 'Bearer ' + getCookie('token')
        }
    }).then((response) => {
        requests = response.data
    })
}
</script>

<!-- Hamburger Button - Mobile Only -->
<button 
    id="hamburger-btn"
    class="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-600 transition-all duration-300"
    on:click={toggleSidebar}
    aria-label="Menu"
>
    <i class="fa-solid fa-bars text-purple-400 text-xl"></i>
</button>

<!-- Overlay for mobile -->
{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="lg:hidden fixed inset-0 bg-black/50 z-40" 
        on:click={handleOutsideClick}
    ></div>
{/if}

{#if mode == 0}
    <div 
        id="sidebar"
        class="flex flex-col h-screen fixed z-50 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out
               lg:w-1/5 lg:left-0 lg:translate-x-0 lg:z-0
               w-80 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <!-- Close Button - Mobile Only -->
        <div class="lg:hidden flex justify-end p-4 border-b border-slate-800">
            <button 
                class="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-slate-800 transition-all"
                on:click={toggleSidebar}
                aria-label="Kapat"
            >
                <i class="fa-solid fa-x text-xl"></i>
            </button>
        </div>

        <!-- Arama Bölümü -->
        <div class="p-6 lg:pt-8 pt-4">
            <div class="relative">
                <input 
                    type="text" 
                    placeholder="Kullanıcı ara..." 
                    class="w-full bg-slate-800 border-2 border-slate-700 focus:border-purple-500 h-12 rounded-xl px-4 pr-12 text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                    bind:value={search}
                > 
                <button 
                    on:click={() => {goto('/' + search); isOpen = false;}} 
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                    aria-label="Ara"
                >
                    <i class="fa-solid fa-search text-xl"></i>
                </button>
            </div>
        </div>

        <!-- Menü Bölümü -->
        <nav class="flex-1 px-4 py-6">
            <div class="space-y-2">
                <button 
                    class="w-full group hover:bg-slate-800 h-14 text-lg items-center flex cursor-pointer gap-4 rounded-xl pl-6 transition-all duration-300 hover:translate-x-1" 
                    on:click={() => {goto('/'); isOpen = false;}}
                >
                    <i class="fa-solid fa-house text-purple-400 group-hover:text-purple-300 transition-colors w-6"></i>
                    <span class="group-hover:text-white transition-colors">Anasayfa</span>
                </button>

                <button 
                    class="w-full group hover:bg-slate-800 h-14 text-lg items-center flex cursor-pointer gap-4 rounded-xl pl-6 transition-all duration-300 hover:translate-x-1"
                    on:click={() => isOpen = false}
                >
                    <i class="fa-solid fa-comment text-purple-400 group-hover:text-purple-300 transition-colors w-6"></i>
                    <span class="group-hover:text-white transition-colors">Mesajlar</span>
                </button>

                <button 
                    class="w-full group hover:bg-slate-800 h-14 text-lg items-center flex cursor-pointer gap-4 rounded-xl pl-6 transition-all duration-300 hover:translate-x-1"
                    on:click={() => {mode = 2; isOpen = false;}}
                    >
                    <i class="fa-solid fa-bell text-purple-400 group-hover:text-purple-300 transition-colors w-6"></i>
                    <span class="group-hover:text-white transition-colors">Bildirimler</span>
                </button>

                <button 
                    class="w-full group hover:bg-slate-800 h-14 text-lg items-center flex cursor-pointer gap-4 rounded-xl pl-6 transition-all duration-300 hover:translate-x-1 relative" 
                    aria-label="Takip İstekleri" 
                    on:click={() => {mode = 3; isOpen = false;}}
                >
                    <i class="fa-solid fa-user-plus text-purple-400 group-hover:text-purple-300 transition-colors w-6"></i>
                    <span class="group-hover:text-white transition-colors">Takip İstekleri</span>
                    {#if requests.length > 0}
                        <span class='absolute right-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold animate-pulse'>
                            {requests.length}
                        </span>
                    {/if}
                </button>
            </div>
        </nav>

        <!-- Kullanıcı Profili -->
        <div class="p-6 border-t border-slate-800">
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300 cursor-pointer group">
                <div class="relative">
                    <img src="{user.profilePhoto}" alt="" class="rounded-full w-12 h-12 object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div class="flex-1 min-w-0" on:click={() => goto('/'+user.username)}>
                    <p class="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">{user.username}</p>
                    <p class="text-slate-400 text-sm">@{user.username}</p>
                </div>
            </div>
        </div>
    </div>
    {:else if mode == 2}
     <div 
        id="sidebar"
        class="flex flex-col h-screen fixed z-50 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out
               lg:w-1/5 lg:left-0 lg:translate-x-0 lg:z-0
               w-80 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <!-- Geri Butonu ve Close Button -->
        <div class="p-6 pt-8 border-b border-slate-800 flex justify-between items-center">
            <button 
                class="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors group" 
                on:click={() => mode = 0} 
                aria-label="geri"
            >
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span class="text-xl font-semibold">Bildirimler</span>
            </button>
            <!-- Close Button - Mobile Only -->
            <button 
                class="lg:hidden text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-slate-800 transition-all"
                on:click={toggleSidebar}
                aria-label="Kapat"
            >
                <i class="fa-solid fa-x text-lg"></i>
            </button>
        </div>

        <!-- İstekler Listesi -->
        <div class="flex-1 gap-10 overflow-y-auto px-4 py-6">
            {#each user.notifications as notification }

                <div class="flex gap-4 flex-col">
                    <div class="bg-slate-800 flex-col gap-2 flex">
                        <div class="font-semibold">{notification.title}</div>
                        <div class="pl-10">{notification.content}</div>
                        <div class="flex justify-end">
                            {notification.created}
                        </div>
                    </div>
                    <div></div>
                </div>

            {/each}
        </div>
        </div>

    {:else if mode == 3}
    <div 
        id="sidebar"
        class="flex flex-col h-screen fixed z-50 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out
               lg:w-1/5 lg:left-0 lg:translate-x-0 lg:z-0
               w-80 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <!-- Geri Butonu ve Close Button -->
        <div class="p-6 pt-8 border-b border-slate-800 flex justify-between items-center">
            <button 
                class="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors group" 
                on:click={() => mode = 0} 
                aria-label="geri"
            >
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span class="text-xl font-semibold">Takip İstekleri</span>
            </button>
            <!-- Close Button - Mobile Only -->
            <button 
                class="lg:hidden text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-slate-800 transition-all"
                on:click={toggleSidebar}
                aria-label="Kapat"
            >
                <i class="fa-solid fa-x text-lg"></i>
            </button>
        </div>

        <!-- İstekler Listesi -->
        <div class="flex-1 overflow-y-auto px-4 py-6">
            {#if requests.length <= 0}
                <div class="flex flex-col items-center justify-center h-full text-center px-4">
                    <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-solid fa-user-plus text-3xl text-slate-600"></i>
                    </div>
                    <p class="text-slate-400 text-lg">Şu anda bekleyen istek yok</p>
                    <p class="text-slate-500 text-sm mt-2">Yeni istekler burada görünecek</p>
                </div>
            {:else}
                <div class="space-y-3">
                    {#each requests as request}
                        <div class="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 transition-all duration-300 border border-slate-700/50 hover:border-slate-600">
                            <div class="flex items-center gap-3 mb-3">
                                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                <img 
                                    src="{request.profilePhoto}" 
                                    alt="" 
                                    class="w-12 h-12 rounded-full object-cover cursor-pointer ring-2 ring-slate-700 hover:ring-purple-500 transition-all" 
                                    on:click={() => {goto('/'+request.username); isOpen = false;}}
                                >
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <span 
                                    class="text-white font-semibold cursor-pointer hover:text-purple-300 transition-colors flex-1" 
                                    on:click={() => {goto('/'+request.username); isOpen = false;}}
                                >
                                    @{request.username}
                                </span>
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    class="flex-1 h-10 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500" 
                                    aria-label="Reddet" 
                                    on:click={() => declineRequest(request.username)}
                                >
                                    <i class="fa-solid fa-x text-sm"></i>
                                    <span class="text-sm">Reddet</span>
                                </button>
                                <button 
                                    class="flex-1 h-10 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-green-500/30 hover:border-green-500" 
                                    aria-label="Kabul et" 
                                    on:click={() => acceptRequest(request.username)}
                                >
                                    <i class="fa-solid fa-check text-sm"></i>
                                    <span class="text-sm">Kabul Et</span>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Kullanıcı Profili -->
        <div class="p-6 border-t border-slate-800">
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300 cursor-pointer group">
                <div class="relative">
                    <img src="{user.profilePhoto}" alt="" class="rounded-full w-12 h-12 object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">{user.username}</p>
                    <p class="text-slate-400 text-sm">@{user.username}</p>
                </div>
            </div>
        </div>
    </div>
{/if}