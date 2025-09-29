<script lang="ts">
import { browser } from '$app/environment';
import axios from "axios";
import { getCookie } from "../../utils/cookies.util";
import { goto } from "$app/navigation";
import { declineRequest, acceptRequest } from "$lib/stores/follow.store";

export let user;
let search = '';
let mode = 0;
let requests: any = [];

// sadece browser'da çalıştır
if (browser) {
    setInterval(function () {
        axios({
            url: 'http://localhost:3000/getFollowRequests',
            method: 'get',
            headers: {
                Authorization: 'Bearer ' + getCookie('token')
            }
        }).then((response) => {
            requests = response.data
        })
    }, 10000)
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

{#if mode == 0}
    <div class=" flex flex-col  left-0 h-screen fixed w-1/5 z-[0]">
        <div class="h-1/3 pl-4">
            <input type="text" placeholder="@kullaniciadi" class="border-[#2e2a35] border-4 h-12 rounded-lg" bind:value={search}> 
            <button on:click={() => window.location.assign('/' + search)} class="pl-4 cursor-pointer">Ara</button>
        </div>
        <div class="h-1/3 gap-10 flex flex-col">
            <div class="w-full hover:bg-slate-900 h-12 text-2xl items-center flex cursor-pointer gap-4 rounded-lg pl-8" on:click={() => window.location.assign('/')}><i class="fa-solid fa-house"></i>Anasayfa</div>
            <div class="w-full hover:bg-slate-900 h-12 text-2xl items-center flex cursor-pointer gap-4 rounded-lg pl-8"><i class="fa-solid fa-comment"></i>Mesajlar</div>
            <div class="w-full hover:bg-slate-900 h-12 text-2xl items-center flex cursor-pointer gap-4 rounded-lg pl-8"><i class="fa-solid fa-bell"></i>Bildirimler</div>
            <button class="w-full hover:bg-slate-900 h-12 text-2xl items-center flex cursor-pointer gap-4 rounded-lg pl-8" aria-label="Takip İstekleri" on:click={() => mode = 3}><i class="fa-solid fa-question"></i>Takip İstekleri <span class='bg-red-500 rounded-full h-fit w-12'>{requests.length > 0 ? requests.length : ''}</span></button>
        </div>
        <div class="flex items-end h-1/3 gap-4 pb-10 pl-10">
            <div class="items-center flex gap-4">
                <img src="{user.profilePhoto}" alt="" class="rounded-full w-12">
                <span class="text-2xl">{user.username}</span>
            </div>
        </div>
    </div>
    {:else if mode == 3}
        <div class=" flex flex-col  left-0 h-screen fixed w-1/5 z-[0]">
        <div class="h-1/3">
            <button class="pl-5 text-3xl cursor-pointer" on:click={() => mode = 0} aria-label="geri">
                Geri
            </button>
        </div>
        <div class="h-1/3 gap-10 flex flex-col items-center">
           <span class="text-2xl"> {requests.length <= 0 ? 'Şuanda bir isteğiniz bulunmuyor': ''}</span>
            {#each requests as request}
                <div class="w-full hover:bg-slate-900 h-12 text-2xl items-center flex cursor-pointer gap-4 rounded-lg pl-8">
                    <img src="{request.profilePhoto}" alt="" class="w-12 rounded-full" on:click={() => window.location.assign('/'+request.username)}>
                    <span class="text-2xl" on:click={() => window.location.assign('/'+request.username)}>{request.username}</span>
                    <button class=" w-2/12 h-2/3 bg-red-500 rounded-lg text-3xl flex items-center justify-center cursor-pointer hover:bg-red-800" aria-label="Reddet" on:click={() => declineRequest(request.username)}>
                        <i class="fa-solid fa-x"></i>
                    </button>
                    <button class=" w-2/12 h-2/3 bg-green-500 rounded-lg text-3xl flex items-center justify-center cursor-pointer hover:bg-green-700" aria-label="Kabul et" on:click={() => acceptRequest(request.username)}>
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            {/each}
        </div>
        <div class="flex items-end h-1/3 gap-4 pb-10 pl-10">
            <div class="items-center flex gap-4">
                <img src="{user.profilePhoto}" alt="" class="rounded-full w-12">
                <span class="text-2xl">{user.username}</span>
            </div>
        </div>
    </div>
{/if}