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
    };

    let selectedUser: any = null;
    let showRestrictionModal = false;
    let selectedFeature = 'sendMessage';

    async function deleteUser(username: string) {
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
                success.message = response.data;
                setTimeout(function(){ 
                    success.status = false;
                    selectedUser = null;
                }, 5000);

                // Kullanıcı listesini güncelle
                data.info.users = data.info.users.filter((u: any) => u.username !== username);
            }
        } catch(err: any) {
            error.status = true;
            error.message = err.response?.data || 'Bir hata oluştu';
            setTimeout(function(){ error.status = false}, 5000);
        }
    }

    async function disableFeature() {
        try {
            const response = await axios({
                method: 'post',
                url: `${PUBLIC_BACKEND_URL}/admin/restrict`,
                data: {
                    username: selectedUser.username,
                    feature: selectedFeature
                },
                headers: {
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                success.status = true;
                success.message = 'Kısıtlama başarıyla uygulandı';
                showRestrictionModal = false;
                setTimeout(function(){ success.status = false}, 5000);
            }
        } catch(err: any) {
            error.status = true;
            error.message = err.response?.data || 'Kısıtlama uygulanırken hata oluştu';
            setTimeout(function(){ error.status = false}, 5000);
        }
    }

    async function removeRestriction() {
        try {
            const response = await axios({
                method: 'post',
                url: `${PUBLIC_BACKEND_URL}/admin/unrestrict`,
                data: {
                    username: selectedUser.username
                },
                headers: {
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                success.status = true;
                success.message = 'Kısıtlama başarıyla kaldırıldı';
                setTimeout(function(){ success.status = false}, 5000);
            }
        } catch(err: any) {
            error.status = true;
            error.message = err.response?.data || 'Kısıtlama kaldırılırken hata oluştu';
            setTimeout(function(){ error.status = false}, 5000);
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return 'Bilinmiyor';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    function closeModal(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            selectedUser = null;
        }
    }

    function closeRestrictionModal(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            showRestrictionModal = false;
        }
    }

    const featureNames: Record<string, string> = {
        sendMessage: 'Mesaj Gönderme',
        sendPost: 'Post Gönderme',
        sendComment: 'Yorum Gönderme',
        sendStory: 'Story Gönderme'
    };
</script>

<!-- Kısıtlama Modal -->
{#if showRestrictionModal}
    <div 
        class="h-screen w-screen bg-black/70 backdrop-blur-sm justify-center items-center flex fixed top-0 left-0 z-[60]"
        on:click={closeRestrictionModal}
        transition:fade={{ duration: 200 }}
    >
        <div 
            class="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            on:click|stopPropagation
        >
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                    🛡️ Kullanıcı Kısıtlama
                </h2>
                <button 
                    class="text-gray-400 hover:text-white transition-colors text-2xl"
                    on:click={() => showRestrictionModal = false}
                >
                    ✕
                </button>
            </div>

            <div class="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-300 text-sm">
                    <span class="font-semibold text-white">{selectedUser?.username}</span> kullanıcısı için kısıtlama uygulanacak.
                </p>
            </div>

            <div class="mb-6">
                <label class="block text-gray-300 font-medium mb-3">
                    Kısıtlanacak Özellik:
                </label>
                <select 
                    bind:value={selectedFeature}
                    class="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                    <option value="0">📨 Mesaj Gönderme</option>
                    <option value="1">📝 Post Gönderme</option>
                    <option value="2">💬 Yorum Gönderme</option>
                    <option value="3">📷 Story Gönderme</option>
                </select>
            </div>

            <div class="flex gap-3">
                <button 
                    class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                    on:click={() => showRestrictionModal = false}
                >
                    İptal
                </button>
                <button 
                    class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-600/30"
                    on:click={disableFeature}
                >
                    Kısıtla
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Kullanıcı Detay Modal -->
{#if selectedUser}
    <div 
        class="h-screen w-screen bg-black/60 backdrop-blur-sm justify-center items-center p-4 flex fixed top-0 left-0 z-50" 
        on:click={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <div class="bg-gray-900/95 backdrop-blur-sm border border-gray-700 h-full max-h-[600px] w-full max-w-5xl rounded-2xl shadow-2xl flex overflow-hidden" on:click|stopPropagation>
            <!-- Sol Panel - Kullanıcı Bilgileri -->
            <div class="w-1/2 flex flex-col border-r border-gray-700">
                <div class="flex-1 p-8 bg-gradient-to-b from-gray-800/50 to-gray-900/30 overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                            Kullanıcı Detayları
                        </h2>
                        <button 
                            class="text-gray-400 hover:text-white transition-colors"
                            on:click={() => selectedUser = null}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <!-- Profil Fotoğrafı -->
                        <div class="flex justify-center mb-6">
                            <img 
                                src={selectedUser.profilePhoto} 
                                alt={selectedUser.username}
                                class="w-24 h-24 rounded-full border-4 border-gray-700 object-cover"
                            />
                        </div>

                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <label class="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                Kullanıcı Adı
                            </label>
                            <p class="text-white font-medium">{selectedUser.username}</p>
                        </div>

                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <label class="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                Kullanıcı ID
                            </label>
                            <p class="text-white font-medium">{selectedUser.id}</p>
                        </div>

                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <label class="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                Biografi
                            </label>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                {selectedUser.bio || 'Biografi eklenmemiş'}
                            </p>
                        </div>

                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <label class="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                Post Sayısı
                            </label>
                            <p class="text-white font-medium">{selectedUser.posts?.length || 0}</p>
                        </div>

                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <label class="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                Oluşturulma Tarihi
                            </label>
                            <p class="text-white font-medium">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-gray-900/50 border-t border-gray-700">
                    <div class="flex flex-col gap-3">
                        <button 
                            class="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-600/30 hover:scale-[1.02]"
                            on:click={() => showRestrictionModal = true}
                        >
                            🛡️ Kısıtla
                        </button>
                        
                        <button 
                            class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-600/30 hover:scale-[1.02]"
                            on:click={() => {
                                if (confirm(`${selectedUser.username} kullanıcısının kısıtlamalarını kaldırmak istediğinizden emin misiniz?`)) {
                                    removeRestriction();
                                }
                            }}
                        >
                            ✅ Kısıtlama Kaldır
                        </button>
                        
                        <button 
                            class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-600/30 hover:scale-[1.02]"
                            on:click={() => {
                                if (confirm(`${selectedUser.username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
                                    deleteUser(selectedUser.username);
                                }
                            }}
                        >
                            🗑️ Hesap Sil
                        </button>
                    </div>
                </div>
            </div>

            <!-- Sağ Panel - Loglar -->
            <div class="w-1/2 flex flex-col bg-gray-900/30">
                <div class="p-6 border-b border-gray-700">
                    <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                        📋 Aktivite Logları
                    </h2>
                </div>
                
                <div class="flex-1 p-6 overflow-y-auto">
                    <div class="space-y-3">
                        {#if selectedUser.posts && selectedUser.posts.length > 0}
                            {#each selectedUser.posts.slice(0, 10) as post, index}
                                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors duration-200">
                                    <div class="flex items-start gap-3">
                                        <span class="w-2 h-2 rounded-full mt-2 bg-blue-400"></span>
                                        <div class="flex-1">
                                            <p class="text-gray-300 text-sm">Post #{index + 1} oluşturuldu</p>
                                            <span class="text-gray-500 text-xs">{formatDate(post.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="text-center text-gray-400 py-8">
                                Henüz aktivite bulunmamaktadır
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Ana Sayfa -->
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <!-- Users Card -->
        <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-slate-300 text-lg font-semibold">Kullanıcı Sayısı</h2>
                <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-blue-400 text-xl">👥</span>
                </div>
            </div>
            <div class="text-5xl font-bold text-blue-400">{data.info.users?.length || 0}</div>
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
            <div class="text-5xl font-bold text-emerald-400">{data.info.posts?.length || 0}</div>
            <p class="text-slate-400 text-sm mt-2">Yayınlanan toplam içerik</p>
        </div>
    </div>

    <!-- Bildirimler -->
    <div class="w-full flex flex-col gap-2 mb-3 items-center justify-center">
        {#if error.status}
            <div class="bg-red-500 rounded-lg w-full max-w-3xl text-center py-3 px-6 text-white font-semibold shadow-lg" transition:fade>
                {error.message}
            </div>
        {/if}
        {#if success.status}
            <div class="bg-green-500 rounded-lg w-full max-w-3xl text-center py-3 px-6 text-white font-semibold shadow-lg" transition:fade>
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
            {#if !data.info.users || data.info.users.length === 0}
                <div class="p-8 text-center text-slate-400">
                    <p>Henüz kullanıcı bulunmamaktadır</p>
                </div>
            {:else}
                {#each data.info.users as user, index}
                    <div class="px-6 py-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-200 {index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/80'}">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 flex-shrink-0">
                                <img 
                                    src={user.profilePhoto} 
                                    class="rounded-full w-full h-full object-cover border-2 border-slate-600" 
                                    alt={user.username}
                                />
                            </div>
                            <div class="flex-1">
                                <p class="text-white font-medium">{user.username}</p>
                                <p class="text-slate-400 text-sm">Kullanıcı ID: {user.id}</p>
                                <p class="text-slate-400 text-sm">Post Sayısı: {user.posts?.length || 0}</p>
                            </div>
                            <div>
                                <button 
                                    class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 cursor-pointer text-white font-medium transition-all duration-200 hover:scale-105" 
                                    on:click={() => selectedUser = user}
                                >
                                    Yönet
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