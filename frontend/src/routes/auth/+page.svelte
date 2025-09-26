<script lang="ts">
    import axios from "axios";
    import { setCookie } from "../../utils/cookies.util";
    import { goto } from "$app/navigation";
    let signin = true;
    let success = {
        status: false,
        message: ''
    };
    let error = {
        status: true,
        message: ''
    };
    let form = {
        input: '',
        email:'', // signin true ise önemseme
        password: ''
    }


    $: console.log(isValidEmail(form.email))
    async function signUp() {
        try {
            const response = await axios({
                url:'http://localhost:3000/signup',
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
                console.log(response.data)
            } 

        } catch(e) {
                signin = false;
                error = {
                    status: true,
                    message: e
                };
                success.status = false;

                console.log(e)
        }
    };
    async function signIn() {
        try {
            const response = await axios({
                url:'http://localhost:3000/signin',
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
        } catch(e) {
            error = {
                status: true,
                message: e.response.data
            }
            console.log(e)
        }
    }
    function isValidEmail(email:string) {
        if(!email) return true  ;
        const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return re.test(email);
    }
</script>



{#if signin}
<div class="flex h-screen items-center justify-center flex-col gap-4">
    {#if success.status}
        <div class="bg-green-500 rounded-lg h-18 flex items-center w-fit text-center justify-center text-3xl text-white">
            {success.message}
        </div>
    {/if}

    <div class="border-2 border-[#2e2a35] rounded-lg h-1/2 w-1/5 flex flex-col gap-4 justify-center items-center">
        
        <img src="https://www.pngkey.com/png/full/28-287308_instagram-logo-text-white.png" class="h-16 relative" alt="instagram">
        
        <input type="text" placeholder="Kullanıcı Adı veya E-Posta"  class="pl-4  h-12 border-2 border-[#2e2a50] hover:border-white hover:transition-colors hover:delay-75 rounded-lg w-3/4 text-white" bind:value={form.input}>
        <input type="password" placeholder="Şifre" class="pl-4  h-12 border-2 border-[#2e2a50] hover:border-white hover:transition-colors hover:delay-75 rounded-lg w-3/4 text-white" bind:value={form.password}>

    {#if (form.input.length < 3 || form.password.length <= 0)}
        <button class="bg-[#2e2a35] w-3/4 rounded-lg text-white h-8 cursor-not-allowed">Giriş Yap</button>
    {:else}
        <button class="bg-[#645566] w-3/4 rounded-lg text-white h-8 cursor-pointer" onclick={() => signIn()}>Giriş Yap</button>
    {/if}
    {#if error.status}
        <div class="text-red-500 rounded-lg h-18 flex items-center w-fit text-center justify-center ">
            {error.message}
        </div>
    {/if}
    </div>
    <div class="border-2 border-[#2e2a35] rounded-lg h-1/12 w-1/5 flex flex-col gap-4 justify-center items-center">
        <span class="text-white">Hesabınız Yok mu? <span class="text-blue-500 cursor-pointer" onclick={() => signin = false}>Kayıt Ol</span></span>
    </div>

</div>

{:else}

<div class="flex h-screen items-center justify-center flex-col gap-4">
    {#if error.status}
        <div class="bg-red-500 rounded-lg h-18 flex items-center w-fit text-center justify-center text-3xl text-white">
            {error.message}
        </div>
    {/if}
    <div class="border-2 border-[#2e2a35] rounded-lg h-1/2 w-1/5 flex flex-col gap-4 justify-center items-center">
        
        <img src="https://www.pngkey.com/png/full/28-287308_instagram-logo-text-white.png" class="h-16" alt="instagram">
        
        <input type="text" placeholder="Kullanıcı Adı" class="pl-4  h-12 border-2 border-[#2e2a50] hover:border-white hover:transition-colors hover:delay-75 rounded-lg w-3/4 text-white" bind:value={form.input}>
        <input type="email" placeholder="E-Posta Adresi" class=" pl-4 {isValidEmail(form.email) ? "hover:border-green-500" : "border-red-500 focus:border-red-500 hover:border-red-500"}  h-12 border-2 border-[#2e2a50]  hover:transition-colors hover:delay-75 rounded-lg w-3/4 text-white" bind:value={form.email}>
        <input type="password" placeholder="Şifre" class="pl-4  h-12 border-2 border-[#2e2a50] hover:border-white hover:transition-colors hover:delay-75 rounded-lg w-3/4 text-white" bind:value={form.password}>

    {#if (form.input.length < 3 || !isValidEmail(form.email) || form.password.length <= 0)}
        <button class="bg-[#2e2a35] w-3/4 rounded-lg text-white h-8 cursor-not-allowed">Kayıt Ol</button>
    {:else}
        <button class="bg-[#645566] w-3/4 rounded-lg text-white h-8 cursor-pointer" onclick={() => signUp()}>Kayıt Ol</button>
    {/if}

    </div>
    <div class="border-2 border-[#2e2a35] rounded-lg h-1/12 w-1/5 flex flex-col gap-4 justify-center items-center">
        <span class="text-white">Hesabınız Var mı? <span class="text-blue-500 cursor-pointer" onclick={() => signin = true}>Giriş Yap</span></span>
    </div>

</div>
{/if}