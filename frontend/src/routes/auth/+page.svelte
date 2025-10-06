    <script lang="ts">
    import axios from "axios";
    import { setCookie } from "$lib/utils/cookies.util";
    import { goto } from "$app/navigation";
	import Seo from "$lib/components/Seo.svelte";
    import { PUBLIC_BACKEND_URL } from '$env/static/public';
    
    let signin = true;
    let isLoading = false;
    let success = {
        status: false,
        message: ''
    };
    let error = {
        status: false,
        message: ''
    };
    let form = {
        input: '',
        email:'',
        password: ''
    }

    async function signUp() {
        isLoading = true;
        error.status = false;
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/signup`,
                method:'post',
                data:{
                    username: form.input,
                    email: form.email,
                    password: form.password
                }
            });

            if(response.status == 200) {
                signin = true;
                success = {
                    status: true,
                    message: response.data.status
                };
                error.status = false;
                setTimeout(() => {
                    success.status = false;
                }, 3000);
            } 
        } catch(e:any) {
            error = {
                status: true,
                message: e.response?.data || 'Kayıt işlemi başarısız oldu'
            };
            success.status = false;
        } finally {
            isLoading = false;
        }
    }
    
    async function signIn() {
        isLoading = true;
        error.status = false;
        try {
            const response = await axios({
                url:`${PUBLIC_BACKEND_URL}/signin`,
                method:'post',
                data:{
                    input: form.input,
                    password: form.password
                }
            });
            if(response.status == 200) {
                setCookie('token', response.data.token);
                location.assign('/');
            }
        } catch(e:any) {
            error = {
                status: true,
                message: e.response?.data || 'Giriş başarısız oldu'
            }
        } finally {
            isLoading = false;
        }
    }
    
    function isValidEmail(email:string) {
        if(!email) return true;
        const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return re.test(email);
    }

    function clearError() {
        error.status = false;
    }

    $: if(form.input || form.email || form.password) {
        clearError();
    }
</script>
<Seo title="Giriş Yap" description="Giriş yap veya kayıt ol" image=''/>

<div class="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 via-75% to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 w-full max-w-md space-y-4">
        <!-- Success Message -->
        {#if success.status}
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-slideDown border border-green-400/50">
                <i class="fa-solid fa-circle-check text-2xl text-white"></i>
                <span class="text-white font-semibold">{success.message}</span>
            </div>
        {/if}

        <!-- Error Message -->
        {#if error.status}
            <div class="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-slideDown border border-red-400/50">
                <i class="fa-solid fa-circle-exclamation text-2xl text-white"></i>
                <span class="text-white font-semibold">{error.message}</span>
            </div>
        {/if}

        <!-- Main Auth Card -->
        <div class="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div class="p-8 space-y-6">
                <!-- Logo -->
                <div class="text-center space-y-2">
                    <div class="flex justify-center mb-4">
                        <div class="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
                            <i class="fa-brands fa-instagram text-5xl text-white"></i>
                        </div>
                    </div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {signin ? 'Hoş Geldin' : 'Kayıt Ol'}
                    </h1>
                    <p class="text-slate-400">
                        {signin ? 'Hesabına giriş yap' : 'Yeni bir hesap oluştur'}
                    </p>
                </div>

                <!-- Form -->
                <div class="space-y-4">
                    <!-- Username/Email Input -->
                    <div class="relative group">
                        <i class="fa-solid {signin ? 'fa-user' : 'fa-at'} absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors"></i>
                        <input 
                            type="text" 
                            placeholder={signin ? "Kullanıcı adı veya e-posta" : "Kullanıcı adı"}
                            class="w-full h-14 pl-12 pr-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-slate-800 transition-all"
                            bind:value={form.input}
                        >
                    </div>

                    <!-- Email Input (only for signup) -->
                    {#if !signin}
                        <div class="relative group">
                            <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors"></i>
                            <input 
                                type="email" 
                                placeholder="E-posta adresi"
                                class="w-full h-14 pl-12 pr-12 bg-slate-800/50 border-2 {isValidEmail(form.email) ? 'border-slate-700 focus:border-purple-500' : 'border-red-500 focus:border-red-500'} rounded-xl text-white placeholder-slate-400 focus:outline-none focus:bg-slate-800 transition-all"
                                bind:value={form.email}
                            >
                            {#if form.email && !isValidEmail(form.email)}
                                <i class="fa-solid fa-circle-exclamation absolute right-4 top-1/2 -translate-y-1/2 text-red-500"></i>
                            {:else if form.email && isValidEmail(form.email)}
                                <i class="fa-solid fa-circle-check absolute right-4 top-1/2 -translate-y-1/2 text-green-500"></i>
                            {/if}
                        </div>
                    {/if}

                    <!-- Password Input -->
                    <div class="relative group">
                        <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors"></i>
                        <input 
                            type="password" 
                            placeholder="Şifre"
                            class="w-full h-14 pl-12 pr-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-slate-800 transition-all"
                            bind:value={form.password}
                        >
                    </div>

                    <!-- Submit Button -->
                    {#if signin}
                        {#if (form.input.length < 3 || form.password.length <= 0)}
                            <button 
                                disabled
                                class="w-full h-14 bg-slate-800 text-slate-500 rounded-xl font-semibold cursor-not-allowed opacity-50"
                            >
                                Giriş Yap
                            </button>
                        {:else}
                            <button 
                                on:click={signIn}
                                disabled={isLoading}
                                class="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {#if isLoading}
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                    <span>Giriş yapılıyor...</span>
                                {:else}
                                    <span>Giriş Yap</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                {/if}
                            </button>
                        {/if}
                    {:else}
                        {#if (form.input.length < 3 || !isValidEmail(form.email) || form.password.length <= 0)}
                            <button 
                                disabled
                                class="w-full h-14 bg-slate-800 text-slate-500 rounded-xl font-semibold cursor-not-allowed opacity-50"
                            >
                                Kayıt Ol
                            </button>
                        {:else}
                            <button 
                                on:click={signUp}
                                disabled={isLoading}
                                class="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {#if isLoading}
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                    <span>Kayıt yapılıyor...</span>
                                {:else}
                                    <span>Kayıt Ol</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                {/if}
                            </button>
                        {/if}
                    {/if}

                    <!-- Forgot Password (only for signin) -->
                    {#if signin}
                        <div class="text-center">
                            <button class="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                                Şifreni mi unuttun?
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Divider -->
            <div class="relative px-8">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-700"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-4 bg-slate-900/80 text-slate-400">veya</span>
                </div>
            </div>

            <!-- Social Login -->
            <div class="p-8 pt-6">
                <button class="w-full h-12 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-3">
                    <i class="fa-brands fa-google text-xl"></i>
                    <span>Google ile devam et</span>
                </button>
            </div>
        </div>

        <!-- Switch Auth Mode Card -->
        <div class="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 text-center shadow-lg">
            <span class="text-slate-300">
                {signin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
            </span>
            <button 
                on:click={() => { signin = !signin; error.status = false; success.status = false; }}
                class="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
                {signin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
        </div>

        <!-- Footer -->
        <div class="text-center text-slate-400 text-sm space-y-2">
            <p>© 2025 Instagram Clone. Tüm hakları saklıdır.</p>
            <div class="flex justify-center gap-4">
                <button class="hover:text-purple-400 transition-colors">Gizlilik</button>
                <button class="hover:text-purple-400 transition-colors">Şartlar</button>
                <button class="hover:text-purple-400 transition-colors">Yardım</button>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .animate-slideDown {
        animation: slideDown 0.3s ease-out;
    }
</style>