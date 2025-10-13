<script lang="ts">
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import { getCookie } from '$lib/utils/cookies.util.js';
	import axios from 'axios';
	import { fade } from 'svelte/transition';

    export let data;
    
    let success = {
        status: false,
        message:''
    }

    let error = {
        status: false,
        message:''
    }
    async function deleteUser(username:string)
    {
        try {
            const response = await axios({
                method:'delete',
                url:`${PUBLIC_BACKEND_URL}/admin/user`,
                data:{
                    username: username,
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            })

            if(response.status == 200) {
                success.status = true;
                success.message = response.data
                setTimeout(function(){ success.status = false}, 5000)

            }
        } catch(err:any) {

            error.status = true;
            error.message = err.response.data

            setTimeout(function(){ error.status = false}, 5000)
        }
    }

</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <!-- Header -->
    <div class="mb-12">
        <div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h1 class="text-4xl font-bold text-white">Admin Panel</h1>
        </div>
        <p class="text-slate-400 ml-5">Sistem yönetimi ve istatistikler</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-6 mb-12">
        <!-- Users Card -->
        <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-slate-300 text-lg font-semibold">Kullanıcı Sayısı</h2>
                <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-blue-400 text-xl">👥</span>
                </div>
            </div>
            <div class="text-5xl font-bold text-blue-400">{data.info.users.length}</div>
            <p class="text-slate-400 text-sm mt-2">Toplam aktif kullanıcı</p>
        </div>

        <!-- Posts Card -->
        <div class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-slate-300 text-lg font-semibold">Post Sayısı</h2>
                <div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-emerald-400 text-xl">📝</span>
                </div>
            </div>
            <div class="text-5xl font-bold text-emerald-400">{data.info.posts.length}</div>
            <p class="text-slate-400 text-sm mt-2">Yayınlanan toplam içerik</p>
        </div>
    </div>
    <div class="w-full flex flex-col gap-2 mb-3 items-center justify-center">
        {#if error.status}
            <div class="bg-red-500 rounded-lg w-3/4 text-center h-12 content-center text-2xl text-bold" transition:fade>
                {error.message}
            </div>
        {/if}
        {#if success.status}
            <div class="bg-green-500 rounded-lg w-3/4 text-center h-12 content-center text-2xl text-bold" transition:fade>
                {success.message}
            </div>
        {/if}
    </div>

    <!-- Users List -->
    <div class="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-slate-800 to-slate-700/50 px-6 py-4 border-b border-slate-700/50">
            <h3 class="text-xl font-bold text-white flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                Kullanıcı Listesi
            </h3>
        </div>
        
        <div class="overflow-y-auto max-h-96">
            {#if data.info.users.length === 0}
                <div class="p-8 text-center text-slate-400">
                    <p>Henüz kullanıcı bulunmamaktadır</p>
                </div>
            {:else}
            {#each data.info.users as user, index}

                    <div class="px-6 py-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-200 {index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/80'}">
                        <div class="flex items-center gap-4">
                            <div class="w-10 aspect-square">
                                <img src="{user.profilePhoto}" class="rounded-full aspect-square" alt="">
                            </div>
                            <div>
                                <p class="text-white font-medium">{user.username}</p>
                                <p class="text-slate-400 text-sm">Kullanıcı ID: {user.id}</p>
                                <p class="text-slate-400 text-sm">Post Sayısı: {user.posts.length}</p>
                            </div>
                            <div class="w-full">
                                <button class="bg-red-500 float-end w-32 h-12 rounded-lg shadow-red-500 shadow-md/70 cursor-pointer" on:click={() => deleteUser(user.username)}>
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>    