<script lang="ts">
    import axios from 'axios';
    import { getCookie } from '$lib/utils/cookies.util.js';
    import { fade, fly, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Leftbar from '$lib/components/Leftbar.svelte';
    import { type Post } from '$lib/stores/post.store.js';
	import Seo from '$lib/components/Seo.svelte';
    import { PUBLIC_BACKEND_URL } from '$env/static/public';
    export let data;

    let toast = '';
    let comment = '';
    let isFollowing: boolean = false;
    let isFollowRequestSended: boolean = false;
    let selectedPost: any = null;
    let showPostModal = false;
    let showLikesModal = false;
    let showEditModal = false;
    let a:any = [];
    isFollowRequestSended = data.extUser?.sendedFollowRequets?.includes(data.user.username) ?? false;

    // Edit modal fields
    let editBio = data.user.bio || '';
    let editPrivate = data.user.private || false;
    let oldPassword = '';
    let editPassword = '';
    let editPasswordConfirm = '';
    let selectedProfilePhoto: File | null = null;
    let previewProfilePhoto = '';
    let activeEditTab: 'general' | 'privacy' | 'password' = 'general';

    onMount(() => {
        isFollowing = data.extUser?.following?.includes(data.user?.username) ?? false;
        if(data.user.username == data.usr?.username)
        {
            isFollowRequestSended = false;
            isFollowing = true
        }
        const posts = data.user.posts
        if(!posts) return;
        posts.forEach(async (post:any) => {
            const image = await axios({
                method:'get',
                url:`${PUBLIC_BACKEND_URL}/posts/get/${post}`,
                responseType:'blob',
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });
            const info:Post = (await axios({
                method:'GET',
                url: `${PUBLIC_BACKEND_URL}/posts/getInfo/${post}`,
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            })).data
            const blob = new Blob([image.data], { type: image.data.type });
            const f = URL.createObjectURL(blob);
            a = [...a, {
                id: info.id,
                account_id: info.account_id,
                description: info.description,
                filename: info.filename,
                blob: f,
                likes:info.likes,
                comments: info.comments,
                created: info.created
            }]
        });
    })

    const followUser = async () => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/followUser`,
                method:'post',
                data:{
                    username: data.user.username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                if(data.user.private) {
                    setTimeout(() => toast = '', 3000);
                    isFollowRequestSended = true
                    return toast = 'Takip İsteği Gönderildi'
                }
                toast = 'Takip Edildi';
                isFollowing = true;
                setTimeout(() => toast = '', 3000)
            }
        } catch(err:any) {
            toast = err.response.data;
            setTimeout(() => toast = '', 3000)
        }
    }

    const unFollowUser = async () => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/unFollowUser`,
                method:'post',
                data:{
                    username: data.user.username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                setTimeout(() => toast = '', 3000)
                isFollowing = false;
                return toast = response.data;
            }
        } catch(err:any) {
            toast = err.response.data;
            setTimeout(() => toast = '', 3000)
        }
    }

    const cancelFollowRequest = async () => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/cancelFollowRequest`,
                method:'post',
                data:{
                    username: data.user.username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                isFollowRequestSended = false;
                isFollowing = false;
                toast = response.data
                setTimeout(() => toast = '', 3000)
            }
        } catch (error:any) {
            toast = error.response.data
            setTimeout(() => toast = '', 3000)
        }
    }

    function openPost(post: any) {
        console.log(post)
        selectedPost = post;
        getPostLikes(post);
        getPostComments(post);
        showPostModal = true;
    }
    function openLikesModal(post: any) {
        getPostLikes(selectedPost);
        showLikesModal = true;
    }
    let postLikes:string[] = [];
    let postComments:any[] = [];

    const getPostLikes = async (post:any) => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/posts/getLikes`,
                method:'post',
                data:{
                    filename: post.filename
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            postLikes = response.data
        } catch (error) {
            if(error) return console.error(error);
        }
    };
    const getPostComments = async (post:any) => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/posts/getComments`,
                method:'post',
                data:{
                    filename: post.filename
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            postComments = response.data
        } catch (error) {
            if(error) return console.error(error);
        }
    };
    const likePost = async (post:any) => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/posts/like`,
                method:'post',
                data:{
                    filename: post.filename
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });
            getPostLikes(post)
            if(response.status == 200) return toast = response.data
        } catch (error) {
            if(error) return console.error(error);
        }
    };

    const sendComment = async (post:any) => {
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/posts/createComment`,
                method:'post',
                data:{
                    filename: post.filename,
                    content: comment
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            getPostComments(post)
            if(response.status == 200) return toast = response.data
        } catch (error) {
            if(error) return console.error(error);
        }
    };

    function openEditModal() {
        editBio = data.user.bio || '';
        editPrivate = data.user.private || false;
        editPassword = '';
        editPasswordConfirm = '';
        selectedProfilePhoto = null;
        previewProfilePhoto = '';
        activeEditTab = 'general';
        showEditModal = true;
    }

    function handleProfilePhotoChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            selectedProfilePhoto = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewProfilePhoto = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async function updateProfile() {
        try {
            const response = await axios({
                url: `${PUBLIC_BACKEND_URL}/updateProfile`,
                method: 'post',
                data: {
                    bio: editBio
                },
                headers: {
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if (response.status === 200) {
                data.user.bio = editBio;
                toast = 'Profil güncellendi';
                setTimeout(() => toast = '', 3000);
            }
        } catch (error: any) {
            toast = error.response?.data || 'Güncelleme başarısız';
            setTimeout(() => toast = '', 3000);
        }
    }

    async function updatePrivacy() {
        try {
            const response = await axios({
                url: `${PUBLIC_BACKEND_URL}/updatePrivacy`,
                method: 'post',
                data: {
                    priv: editPrivate
                },
                headers: {
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if (response.status === 200) {
                data.user.private = editPrivate;
                toast = 'Gizlilik ayarları güncellendi';
                setTimeout(() => toast = '', 3000);
            }
        } catch (error: any) {
            toast = error.response?.data || 'Güncelleme başarısız';
            setTimeout(() => toast = '', 3000);
        }
    }

    async function updatePassword() {
        if (editPassword !== editPasswordConfirm) {
            toast = 'Şifreler eşleşmiyor';
            setTimeout(() => toast = '', 3000);
            return;
        }

        if (editPassword.length < 6) {
            toast = 'Şifre en az 6 karakter olmalı';
            setTimeout(() => toast = '', 3000);
            return;
        }

        try {
            const response = await axios({
                url: `${PUBLIC_BACKEND_URL}/updatePassword`,
                method: 'post',
                data: {
                    oldPassword:oldPassword,
                    password: editPassword
                },
                headers: {
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if (response.status === 200) {
                editPassword = '';
                editPasswordConfirm = '';
                toast = 'Şifre güncellendi';
                setTimeout(() => toast = '', 3000);
            }
        } catch (error: any) {
            toast = error.response?.data || 'Güncelleme başarısız';
            setTimeout(() => toast = '', 3000);
        }
    }

    async function updateProfilePhoto() {
        if (!selectedProfilePhoto) {
            toast = 'Lütfen bir fotoğraf seçin';
            setTimeout(() => toast = '', 3000);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedProfilePhoto);

        try {
            const response = await axios({
                url: `${PUBLIC_BACKEND_URL}/updateProfilePhoto`,
                method: 'post',
                data: formData,
                headers: {
                    Authorization: 'Bearer ' + getCookie('token'),
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                data.user.profilePhoto = response.data.photoUrl;
                toast = 'Profil fotoğrafı güncellendi';
                selectedProfilePhoto = null;
                previewProfilePhoto = '';
                setTimeout(() => toast = '', 3000);
            }
        } catch (error: any) {
            toast = error.response?.data || 'Güncelleme başarısız';
            setTimeout(() => toast = '', 3000);
        }
    }

    async function saveAllChanges() {
        await updateProfile();
        await updatePrivacy();
        
        if (editPassword && editPasswordConfirm) {
            await updatePassword();
        }
        
        if (selectedProfilePhoto) {
            await updateProfilePhoto();
        }

        showEditModal = false;
    }

</script>

<Leftbar user={data.extUser} />
<Seo title={data.user.username} description={data.user.username} image={data.user.profilePhoto} />
{#if data.user}
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white lg:ml-[20%] ml-0">
        <!-- Profile Header -->
        <div class="max-w-5xl mx-auto px-4 lg:px-8 pt-12 pb-8">
            <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 mb-12">
                <!-- Profile Picture -->
                <div class="relative group">
                    <div class="w-32 h-32 lg:w-40 lg:h-40 rounded-full ring-4 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all duration-300 overflow-hidden">
                        <img 
                            src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{data.user.username}" 
                            class="w-full h-full object-cover" 
                            alt="{data.user.username}"
                        >
                    </div>
                    {#if data.user.username == data.usr?.username}
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button 
                            on:click={openEditModal}
                            class="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                            <i class="fa-solid fa-camera text-white"></i>
                        </button>
                    {/if}
                </div>

                <!-- Profile Info -->
                <div class="flex-1 space-y-6 text-center lg:text-left">
                    <!-- Username and Actions -->
                    <div class="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 flex-wrap">
                        <div class="flex items-center gap-3 justify-center lg:justify-start">
                            <h1 class="text-2xl lg:text-3xl font-bold">{data.user.username}</h1>
                            {#if data.user.verified}
                                <i class="fa-solid fa-certificate text-sky-500 text-2xl"></i>
                            {/if}
                        </div>

                        {#if data.user.username == data.usr?.username}
                            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <button 
                                    on:click={openEditModal}
                                    class="px-4 lg:px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all hover:scale-105 text-sm lg:text-base"
                                >
                                    <i class="fa-solid fa-gear mr-2"></i>
                                    <span class="hidden sm:inline">Profili Düzenle</span>
                                    <span class="sm:hidden">Düzenle</span>
                                </button>
                                <button class="px-4 lg:px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all hover:scale-105 text-sm lg:text-base">
                                    <i class="fa-solid fa-box-archive mr-2"></i>
                                    Arşiv
                                </button>
                            </div>
                        {:else}
                            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                {#if !data.usr}
                                    <!-- Giriş yapmamış kullanıcılar için -->
                                    <button 
                                        class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all hover:scale-105"
                                        on:click={() => window.location.href = '/auth'}
                                    >
                                        <i class="fa-solid fa-sign-in-alt mr-2"></i>
                                        Takip Etmek İçin Giriş Yap
                                    </button>
                                {:else if isFollowRequestSended}
                                    <button 
                                        on:click={cancelFollowRequest}
                                        class="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <i class="fa-solid fa-clock"></i>
                                        İstek Gönderildi
                                        <i class="fa-solid fa-xmark ml-2"></i>
                                    </button>
                                {:else if isFollowing}
                                    <button 
                                        on:click={unFollowUser}
                                        class="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all hover:scale-105"
                                    >
                                        <i class="fa-solid fa-user-check mr-2"></i>
                                        Takip Ediliyor
                                    </button>
                                {:else}
                                    <button 
                                        on:click={followUser}
                                        class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all hover:scale-105"
                                    >
                                        <i class="fa-solid fa-user-plus mr-2"></i>
                                        Takip Et
                                    </button>
                                {/if}
                                {#if data.usr}
                                    <button class="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all hover:scale-105">
                                        <i class="fa-solid fa-envelope mr-2"></i>
                                        Mesaj Gönder
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <!-- Stats -->
                    <div class="flex gap-4 lg:gap-8 justify-center lg:justify-start">
                        <button class="group text-center hover:scale-105 transition-transform">
                            <div class="text-xl lg:text-2xl font-bold group-hover:text-purple-400 transition-colors">
                                {data.user.posts.length}
                            </div>
                            <div class="text-slate-400 text-xs lg:text-sm">Gönderi</div>
                        </button>
                        <button class="group text-center hover:scale-105 transition-transform">
                            <div class="text-xl lg:text-2xl font-bold group-hover:text-purple-400 transition-colors">
                                {data.user.followers.length}
                            </div>
                            <div class="text-slate-400 text-xs lg:text-sm">Takipçi</div>
                        </button>
                        <button class="group text-center hover:scale-105 transition-transform">
                            <div class="text-xl lg:text-2xl font-bold group-hover:text-purple-400 transition-colors">
                                {data.user.following.length}
                            </div>
                            <div class="text-slate-400 text-xs lg:text-sm">Takip</div>
                        </button>
                    </div>

                    <!-- Bio -->
                    {#if data.user.bio}
                        <div class="text-slate-300">
                            <p>{data.user.bio}</p>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-800 mb-8"></div>

            <!-- Tabs -->
            <div class="flex justify-center gap-12 mb-8">
                <button class="flex items-center gap-2 text-white border-t-2 border-white pt-4 pb-2 font-semibold">
                        <span>GÖNDERİLER</span>
                </button>
            </div>
        </div>

        <!-- Posts Grid -->
        <div class="max-w-5xl mx-auto px-4 lg:px-8 pb-12">
            {#if data.user.private && (!data.usr || !isFollowing)}
                <!-- Private Account Message -->
                <div class="flex flex-col items-center justify-center py-20 space-y-6">
                    <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-slate-700">
                        <i class="fa-solid fa-lock text-4xl text-slate-400"></i>
                    </div>
                    <div class="text-center space-y-2">
                        <h3 class="text-2xl font-bold">Bu Hesap Gizli</h3>
                        <p class="text-slate-400">Fotoğrafları ve videoları görmek için takip et</p>
                    </div>
                    {#if !data.usr}
                        <!-- Giriş yapmamış kullanıcılar için -->
                        <button 
                            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all hover:scale-105"
                            on:click={() => window.location.href = '/auth'}
                        >
                            <i class="fa-solid fa-sign-in-alt mr-2"></i>
                            Giriş Yapın
                        </button>
                    {:else if isFollowRequestSended}
                        <button 
                            on:click={cancelFollowRequest}
                            class="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <i class="fa-solid fa-clock"></i>
                            Takip İsteği Gönderildi
                            <i class="fa-solid fa-xmark ml-2"></i>
                        </button>
                    {:else}
                        <button 
                            on:click={followUser}
                            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all hover:scale-105"
                        >
                            <i class="fa-solid fa-user-plus mr-2"></i>
                            Takip Et
                        </button>
                    {/if}
                </div>
            {:else if a.length === 0}
                <!-- No Posts Message -->
                <div class="flex flex-col items-center justify-center py-20 space-y-6">
                    <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-slate-700">
                        <i class="fa-solid fa-camera text-4xl text-slate-400"></i>
                    </div>
                    <div class="text-center space-y-2">
                        <h3 class="text-2xl font-bold">Henüz Gönderi Yok</h3>
                        <p class="text-slate-400">Paylaşımlar burada görünecek</p>
                    </div>
                </div>
            {:else}
                <!-- Posts Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {#each a as post, i}
                        <button 
                            on:click={() => openPost(post)}
                            class="relative aspect-square group overflow-hidden bg-slate-800 hover:opacity-90 transition-opacity"
                            in:scale={{ delay: i * 50, duration: 300 }}
                        >
                            <img 
                                src="{post.blob}" 
                                class="w-full h-full object-cover" 
                                alt="Post"
                            >
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div class="flex items-center gap-6 text-white">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-heart text-2xl"></i>
                                        <span class="font-bold">{post.likes.length}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-comment text-2xl"></i>
                                        <span class="font-bold">{post.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <!-- Toast Notification -->
    {#if toast}
        <div 
            class="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
            in:fly={{ y: 100, duration: 300 }}
            out:fade={{ duration: 200 }}
        >
            <i class="fa-solid fa-circle-check text-green-400 text-xl"></i>
            <span class="font-semibold">{toast}</span>
        </div>
    {/if}

    <!-- Edit Profile Modal -->
    {#if showEditModal}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div 
            class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            on:click={() => showEditModal = false}
            transition:fade
        >
            <div 
                class="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden"
                on:click|stopPropagation
                transition:scale
            >
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 class="text-2xl font-bold">Profili Düzenle</h2>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button 
                        on:click={() => showEditModal = false}
                        class="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                    >
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-slate-800">
                    <button 
                        class="flex-1 px-6 py-4 font-semibold transition-all {activeEditTab === 'general' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}"
                        on:click={() => activeEditTab = 'general'}
                    >
                        <i class="fa-solid fa-user mr-2"></i>
                        Genel
                    </button>
                    <button 
                        class="flex-1 px-6 py-4 font-semibold transition-all {activeEditTab === 'privacy' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}"
                        on:click={() => activeEditTab = 'privacy'}
                    >
                        <i class="fa-solid fa-lock mr-2"></i>
                        Gizlilik
                    </button>
                    <button 
                        class="flex-1 px-6 py-4 font-semibold transition-all {activeEditTab === 'password' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}"
                        on:click={() => activeEditTab = 'password'}
                    >
                        <i class="fa-solid fa-key mr-2"></i>
                        Şifre
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6 max-h-[60vh] overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    {#if activeEditTab === 'general'}
                        <div class="space-y-6">
                            <!-- Profile Photo -->
                            <div class="flex flex-col items-center gap-4">
                                <div class="relative">
                                    <img 
                                        src="{previewProfilePhoto || data.user.profilePhoto}" 
                                        class="w-32 h-32 rounded-full ring-4 ring-purple-500/30 object-cover" 
                                        alt="Profile"
                                    >
                                    <label 
                                        for="profilePhotoInput"
                                        class="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110"
                                    >
                                        <i class="fa-solid fa-camera text-white"></i>
                                    </label>
                                    <input 
                                        id="profilePhotoInput"
                                        type="file" 
                                        accept="image/*"
                                        class="hidden"
                                        on:change={handleProfilePhotoChange}
                                    >
                                </div>
                                {#if selectedProfilePhoto}
                                    <button 
                                        on:click={updateProfilePhoto}
                                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all"
                                    >
                                        Fotoğrafı Kaydet
                                    </button>
                                {/if}
                            </div>

                            <!-- Bio -->
                            <div>
                                <!-- svelte-ignore a11y_label_has_associated_control -->
                                <label class="block text-sm font-semibold mb-2 text-slate-300">
                                    <i class="fa-solid fa-align-left mr-2"></i>
                                    Biyografi
                                </label>
                                <textarea 
                                    bind:value={editBio}
                                    placeholder="Kendinden bahset..."
                                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors resize-none h-32"
                                    maxlength="150"
                                ></textarea>
                                <div class="text-xs text-slate-500 mt-1 text-right">
                                    {editBio.length}/150
                                </div>
                            </div>
                        </div>
                    {:else if activeEditTab === 'privacy'}
                        <div class="space-y-6">
                            <!-- Private Account Toggle -->
                            <div class="bg-slate-800 rounded-xl p-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-2">
                                            <i class="fa-solid fa-lock text-purple-500"></i>
                                            <h3 class="font-semibold text-lg">Gizli Hesap</h3>
                                        </div>
                                        <p class="text-sm text-slate-400">
                                            Hesabın gizli olduğunda, sadece onayladığın kişiler gönderilerini, takipçilerini ve takip ettiklerini görebilir.
                                        </p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer ml-4">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={editPrivate}
                                            class="sr-only peer"
                                        >
                                        <div class="w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>

                            <!-- Privacy Info -->
                            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <div class="flex gap-3">
                                    <i class="fa-solid fa-info-circle text-purple-500 text-xl"></i>
                                    <div class="text-sm text-slate-300">
                                        <p class="font-semibold mb-1">Gizli hesap hakkında</p>
                                        <ul class="list-disc list-inside space-y-1 text-slate-400">
                                            <li>Yeni takipçi istekleri manuel olarak onaylanır</li>
                                            <li>Gönderilerin sadece takipçilerin tarafından görülür</li>
                                            <li>Profil fotoğrafın ve bilgilerin gizli kalır</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {:else if activeEditTab === 'password'}
                        <div class="space-y-6">
                            <div>
                                <!-- svelte-ignore a11y_label_has_associated_control -->
                                <label class="block text-sm font-semibold mb-2 text-slate-300">
                                    <i class="fa-solid fa-key mr-2"></i>
                                    Eski Şifre
                                </label>
                                <input 
                                    type="password"
                                    bind:value={oldPassword}
                                    placeholder="Eski Şifreniz"
                                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                                >
                            </div>
                            <!-- New Password -->
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <div>
                                <label class="block text-sm font-semibold mb-2 text-slate-300">
                                    <i class="fa-solid fa-key mr-2"></i>
                                    Yeni Şifre
                                </label>
                                <input 
                                    type="password"
                                    bind:value={editPassword}
                                    placeholder="En az 6 karakter"
                                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                                >
                            </div>

                            <!-- Confirm Password -->
                            <div>
                                <!-- svelte-ignore a11y_label_has_associated_control -->
                                <label class="block text-sm font-semibold mb-2 text-slate-300">
                                    <i class="fa-solid fa-check-circle mr-2"></i>
                                    Şifreyi Onayla
                                </label>
                                <input 
                                    type="password"
                                    bind:value={editPasswordConfirm}
                                    placeholder="Şifreni tekrar gir"
                                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                                >
                            </div>

                            <!-- Password Requirements -->
                            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <div class="flex gap-3">
                                    <i class="fa-solid fa-shield-halved text-purple-500 text-xl"></i>
                                    <div class="text-sm text-slate-300">
                                        <p class="font-semibold mb-1">Güçlü şifre oluştur</p>
                                        <ul class="list-disc list-inside space-y-1 text-slate-400">
                                            <li>En az 6 karakter uzunluğunda olmalı</li>
                                            <li>Büyük ve küçük harf içermeli</li>
                                            <li>Rakam ve özel karakter kullanmalı</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {#if editPassword && editPasswordConfirm}
                                <button 
                                    on:click={updatePassword}
                                    class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all hover:scale-105"
                                >
                                    <i class="fa-solid fa-lock mr-2"></i>
                                    Şifreyi Güncelle
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>

                <!-- Footer -->
                <div class="border-t border-slate-800 p-6 flex gap-3 justify-end bg-slate-900/50">
                    <button 
                        on:click={() => showEditModal = false}
                        class="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all"
                    >
                        İptal
                    </button>
                    <button 
                        on:click={saveAllChanges}
                        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <i class="fa-solid fa-save mr-2"></i>
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Likes Modal -->
    {#if showLikesModal && selectedPost}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-51 flex items-center justify-center p-5" transition:fade on:click={() => showLikesModal = false} >
            <div class="bg-slate-900 h-fit w-1/4 pl-4 rounded-lg min-h-28">
                <div class="pt-4 text-2xl">Beğeniler</div>
                {#each postLikes as like}
                    <div>
                        <div class="flex items-center gap-4 p-5">
                            <img src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{like}" alt="{like}" class="w-12 rounded-full">
                            <div class="text-2xl font-bold">{like}</div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Post Modal -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
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

                    <div class="flex-1 overflow-y-auto p-4 space-y-4 max-h-100 
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
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
{/if}   