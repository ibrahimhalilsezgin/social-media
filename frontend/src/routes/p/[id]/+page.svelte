<script lang="ts">
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import Seo from '$lib/components/Seo.svelte';
	import type { Post } from '$lib/stores/post.store.js';
	import { getCookie } from '$lib/utils/cookies.util.js';
	import axios from 'axios';
	import { onMount } from 'svelte';

    export let data;
    console.log(data)

    let posts:any = {};
    let loading = false;
    onMount(async () => {

        const image = await axios({
            method:'get',
            url:`${PUBLIC_BACKEND_URL}/posts/get/${data.post.filename[0]}.jpeg`,
            responseType:'blob',
            headers:{
                Authorization: 'Bearer ' + getCookie('token')
            }
        });
        console.log(image)
        const info:Post = (await axios({
            method:'GET',
            url: `${PUBLIC_BACKEND_URL}/posts/getInfo/${data.post.filename[0]}.jpeg`,
            headers:{
                Authorization: 'Bearer ' + getCookie('token')
            }
        })).data
        const blob = new Blob([image.data], { type: image.data.type });
        const f = URL.createObjectURL(blob);
        posts = {
            id: info.id,
            account_id: info.account_id,
            description: info.description,
            filename: info.filename,
            blob: f,
            likes:info.likes,
            comments: info.comments,
            created: info.created
        }
    });
loading = true
</script>


<Seo title={data.post.description} description={data.post.created} image="{posts.blob}" />

{#if loading}
    <img src="{posts.blob}" alt="">
{/if}


    {#if showPostModal && selectedPost}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div 
            class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            on:click={() => showPostModal = false}
            transition:fade
        >
            <div 
                class="relative max-w-6xl w-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
                on:click|stopPropagation
                transition:scale
            >
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button 
                    on:click={() => showPostModal = false}
                    class="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                >
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>

                <!-- Left Side - Image -->
                <div class="flex-1 bg-black flex items-center justify-center lg:max-h-[90vh] max-h-[50vh]">
                    <img src="{selectedPost.blob}" class="max-w-full max-h-full object-contain" alt="Post">
                </div>

                <!-- Right Side - Comments Section -->
                <div class="w-full lg:w-[400px] flex flex-col bg-slate-900 lg:max-h-[90vh] max-h-[40vh]">
                    <!-- User Header -->
                    <div class="flex items-center gap-3 p-4  border-slate-800">
                        <img 
                            src="{data.user.profilePhoto}" 
                            class="w-10 h-10 rounded-full ring-2 ring-purple-500/30" 
                            alt="{data.user.username}"
                        >
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">{data.user.username}</span>
                                {#if data.user.verified}
                                    <i class="fa-solid fa-certificate text-sky-500 text-xs"></i>
                                {/if}
                            </div>
                        </div>
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button class="text-slate-400 hover:text-white">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4 space-y-4">
                        {#if selectedPost.description}
                            <div class="flex gap-3 border-b border-gray-600 pb-2">
                                <div class="flex-1">
                                    <span class="text-slate-300">{selectedPost.description}</span>
                                </div>
                            </div>
                        {/if}

                        {#if postComments && postComments.length > 0}
                            {#each postComments as comment}
                                <div class="flex gap-3">
                                    <img 
                                        src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{comment.username}" 
                                        class="w-8 h-8 rounded-full ring-2 ring-slate-700 flex-shrink-0" 
                                        alt="{comment.username}"
                                    >
                                    <div class="flex-1">
                                        <div>
                                            <span class="font-semibold mr-2">{comment.username}</span>
                                            <span class="text-slate-300">{comment.content}</span>
                                        </div>
                                        <div class="flex gap-4 mt-1 text-xs text-slate-500">
                                            <button class="hover:text-slate-300">Yanıtla</button>
                                            <span>{comment.time || '1s'}</span>
                                        </div>
                                    </div>
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button class="text-slate-500 hover:text-red-500">
                                        <i class="fa-regular fa-heart text-xs"></i>
                                    </button>
                                </div>
                            {/each}
                        {:else}
                            <div class="flex flex-col items-center justify-center py-12 text-slate-500">
                                <i class="fa-regular fa-comment text-4xl mb-3"></i>
                                <p class="text-sm">Henüz yorum yapılmamış</p>
                                <p class="text-xs">İlk yorumu sen yap</p>
                            </div>
                        {/if}
                    </div>

                    <!-- Actions Bar -->
                    <div class="border-t border-slate-800 p-4 space-y-3">
                        <!-- Like, Comment, Share Buttons -->
                        <div class="flex items-center gap-4">
                            {#if !data.usr}
                                <!-- Giriş yapmamış kullanıcılar için -->
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="hover:text-red-500 transition-colors" on:click={() => window.location.href = '/auth'}>
                                    <i class="fa-regular fa-heart text-2xl"></i>
                                </button>
                            {:else if postLikes.includes(data.usr.username)}
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="hover:text-red-500 transition-colors" on:click={() => likePost(selectedPost)}>
                                    <i class="fa-solid fa-heart text-2xl text-red-500"></i>
                                </button>
                            {:else}
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="hover:text-red-500 transition-colors" on:click={() => likePost(selectedPost)}>
                                    <i class="fa-regular fa-heart text-2xl"></i>
                                </button>
                            {/if}
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button class="hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-comment text-2xl"></i>
                            </button>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button class="hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-paper-plane text-2xl"></i>
                            </button>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button class="ml-auto hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-bookmark text-2xl"></i>
                            </button>
                        </div>

                        <!-- Likes Count -->
                        <div class="font-semibold text-sm cursor-pointer" >
                            <div class="flex justify-start" on:click={() => openLikesModal(selectedPost)}>
                                {selectedPost.likes.length} beğenme
                            </div>
                            <div class="flex justify-end text-white/80">
                                {selectedPost.created}
                            </div>
                        </div>

                        <!-- Comment Input -->
                        <div class="flex items-center gap-3 pt-2 border-t border-slate-800">
                            {#if !data.usr}
                                <!-- Giriş yapmamış kullanıcılar için -->
                                <input 
                                    type="text" 
                                    placeholder="Yorum yapmak için giriş yapın..." 
                                    class="flex-1 bg-transparent outline-none text-sm placeholder-slate-500"
                                    disabled
                                    on:click={() => window.location.href = '/auth'}
                                >
                                <button class="text-purple-500 font-semibold text-sm hover:text-purple-400" on:click={() => window.location.href = '/auth'}>
                                    Giriş Yap
                                </button>
                            {:else}
                                <input 
                                    type="text" 
                                    placeholder="Yorum ekle..." 
                                    class="flex-1 bg-transparent outline-none text-sm placeholder-slate-500"
                                    bind:value={comment}
                                >
                                <button class="text-purple-500 font-semibold text-sm hover:text-purple-400 disabled:text-slate-600 disabled:cursor-not-allowed" on:click={() => sendComment(selectedPost)}>
                                    Paylaş
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}