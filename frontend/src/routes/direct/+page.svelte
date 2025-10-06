<script lang="ts">
	import { goto } from "$app/navigation";

    export let data;

	import { PUBLIC_BACKEND_URL } from "$env/static/public";
    import { socket } from "$lib/socket";
	import { getCookie } from "$lib/utils/cookies.util.js";
	import axios from "axios";
	import { onMount } from "svelte";
    let onlineUsers:any; 
    onMount(() => {
        socket?.on('onlineUsers', (response:any) => {
          onlineUsers = response
        })
    })

    console.log(data.conversations)


    const createConversation = async (username:string) => {
        const response = await axios({
            url:PUBLIC_BACKEND_URL + '/conversations/createConversation',
            method:'post',
            headers:{
                Authorization:'Bearer ' + getCookie('token') 
            },
            data:{
                username: username
            }
        })
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
    <div class="max-w-4xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Sohbetlerin</h1>
        <!-- <p class="text-slate-600">Takip ettiğiniz {data.user.following.length} kişi</p> -->
    </div>
 <div class="grid gap-4">
            {#each data.conversations as conversation}
                <div class="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300">
                    <div class="flex items-center gap-6">
                        <!-- Profil Fotoğrafı -->
                        <div class="relative">
                            <img 
                                src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{conversation.with}" 
                                alt="{conversation.with}" 
                                class="w-20 h-20 rounded-full object-cover ring-4 {onlineUsers?.includes(conversation.with) ? 'ring-green-400' : 'ring-slate-300'} transition-all duration-300"
                            >
                            {#if onlineUsers?.includes(conversation.with)}
                                <div class="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg">
                                    <div class="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                            {/if}
                        </div>

                        <!-- Kullanıcı Bilgisi -->
                        <div class="flex-1">
                            <h3 class="text-2xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {conversation.with}
                            </h3>
                            <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                {#if onlineUsers?.includes(conversation.with)}
                                    <span class="inline-flex items-center gap-1.5 text-green-600 font-medium">
                                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Çevrimiçi
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center gap-1.5 text-slate-400">
                                        <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                                        Çevrimdışı
                                    </span>
                                {/if}
                            </p>
                        </div>

                        <!-- Aksiyon Butonları -->
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" on:click={() => goto(`/direct/${conversation.with}/${conversation.id}`)}>
                                Mesaj Gönder
                            </button>
                            <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors" on:click={() => goto('/u/' + conversation.with)}>
                                Profil
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
     {#if data.conversations.length === 0}
            <div class="text-center py-16">
                <div class="w-24 h-24 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-700 mb-2">Henüz kimseyle sohbet etmiyorsunuz</h3>
                <p class="text-slate-500">Yeni insanları keşfedin ve sohbet etmeye başlayın!</p>
            </div>
        {/if}
    </div>
    <div class="max-w-4xl mx-auto">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 mb-2">Takip Ettiklerim</h1>
            <p class="text-slate-600">Takip ettiğiniz {data.user.following.length} kişi</p>
        </div>

        <div class="grid gap-4">
            {#each data.user.following as user}
                <div class="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300">
                    <div class="flex items-center gap-6">
                        <!-- Profil Fotoğrafı -->
                        <div class="relative">
                            <img 
                                src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{user}" 
                                alt="{user}" 
                                class="w-20 h-20 rounded-full object-cover ring-4 {onlineUsers?.includes(user) ? 'ring-green-400' : 'ring-slate-300'} transition-all duration-300"
                            >
                            {#if onlineUsers?.includes(user)}
                                <div class="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg">
                                    <div class="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                            {/if}
                        </div>

                        <!-- Kullanıcı Bilgisi -->
                        <div class="flex-1">
                            <h3 class="text-2xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {user}
                            </h3>
                            <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                {#if onlineUsers?.includes(user)}
                                    <span class="inline-flex items-center gap-1.5 text-green-600 font-medium">
                                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Çevrimiçi
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center gap-1.5 text-slate-400">
                                        <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                                        Çevrimdışı
                                    </span>
                                {/if}
                            </p>
                        </div>

                        <!-- Aksiyon Butonları -->
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" on:click={() => createConversation(user)}>
                                Mesaj Gönder
                            </button>
                            <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors" on:click={() => goto('/u/' + user)}>
                                Profil
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        {#if data.user.following.length === 0}
            <div class="text-center py-16">
                <div class="w-24 h-24 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-700 mb-2">Henüz kimseyi takip etmiyorsunuz</h3>
                <p class="text-slate-500">Yeni insanları keşfedin ve takip etmeye başlayın!</p>
            </div>
        {/if}
    </div>
</div>