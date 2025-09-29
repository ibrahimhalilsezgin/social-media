<script lang="ts">
    import axios from 'axios';
    import { getCookie } from '../../utils/cookies.util.js';
    import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Leftbar from '$lib/components/Leftbar.svelte';

    export let data;

    let toast = '';
    let isFollowing: boolean = false;
    let isFollowRequestSended: boolean = false;

    let a:any = [];
    isFollowRequestSended = data.extUser.sendedFollowRequets.includes(data.user.username) ?? false;

    onMount(() => {

        console.log(data.extUser.sendedFollowRequets.includes(data.user.username))
        isFollowing = data.extUser.following?.includes(data.user?.username) ?? false;
        if(data.user.username == data.usr?.username)
        {
            isFollowRequestSended = false;
            isFollowing = true

        }
        const posts = data.user.posts
        if(!posts) return;
        posts.forEach(async (post:any) => {
            const response = await axios({
                method:'get',
                url:`http://localhost:3000/posts/get/${data.user.username}/${post}`,
                responseType:'blob',
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            })
            const blob = new Blob([response.data], { type: response.data.type });

            const f = URL.createObjectURL(blob);
            a = [...a, f]
            console.log(f)
        });
    })
    const followUser = async () => {
        try {
            const response = await axios({
                url:'http://localhost:3000/followUser',
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
                    setTimeout(() =>  {
                        toast = '';    
                    }, 2000);
                    isFollowRequestSended = true
                    return toast = 'Takip İsteği Yollandı.'

                }
                toast = 'Takip Edildi';
                isFollowing = true;
                setTimeout(() =>  {
                    toast = '';    
                }, 2000)
            }
        } catch(err:any) {
            toast = err.response.data;
            setTimeout(() =>  {
                toast = '';    
            }, 2000)
        }
    }
    const unFollowUser = async () => {
        try {
            const response = await axios({
                url:'http://localhost:3000/unFollowUser',
                method:'post',
                data:{
                    username: data.user.username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                setTimeout(() =>  {
                    toast = '';    
                }, 2000)
                isFollowing = false;
                return toast = response.data;
            }
        } catch(err:any) {
            toast = err.response.data;
            setTimeout(() =>  {
                toast = '';    
            }, 2000)
        }
    }
    const cancelFollowRequest = async () => {
        try {
            const response = await axios({
                url:'http://localhost:3000/cancelFollowRequest',
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
                setTimeout(() =>  {
                    toast = '';    
                }, 2000)
            }
        } catch (error:any) {
            toast = error.response.data
            setTimeout(() =>  {
                toast = '';    
            }, 2000)
        }
    }
    

    // console.log(data.usr)
    // console.log(data.extUser)
    // console.log(data.user)

</script>
<Leftbar user={data.extUser} />
{#if data.user}
        
    <div class="text-2xl text-white flex h-screen flex-col ">
        <div class="items-center flex h-3/12 w-full pl-100 ht-6 sm:h-2/12 ">
            <img src="{data.user.profilePhoto}" class="rounded-full h-30 w-30" alt="{data.user.username}">        
            <div class="flex flex-col  w-full pr-100 sm:pr-50 justify-center items-center">
                {#if data.user.username == data.usr?.username}
                <div class="flex pl-50 items-center gap-4 sm:pl-25">
                    <span class="text-3xl font-semibold ">{data.user.username}</span>
                    <i class="fa-solid fa-certificate text-sky-500 text-3xl "></i>
                    <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer">Arşiv</div>
                    <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer w">Düzenle</div>
                </div>
                {:else}
                    {#if isFollowRequestSended}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="flex pl-50 items-center gap-4 sm:pl-25">
                            <span class="text-3xl font-semibold ">{data.user.username}</span>
                            <i class="fa-solid fa-certificate text-sky-500 text-3xl "></i>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div class="bg-gray-500 rounded-lg w-fit text-center h-full cursor-pointer" on:click={() => cancelFollowRequest()}>Takip isteği yollandı X</div>
                            <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer w">Mesaj Gönder</div>
                        </div>  
                    {:else}
                        {#if isFollowing}
                            <div class="flex pl-50 items-center gap-4 sm:pl-25">
                                <span class="text-3xl font-semibold ">{data.user.username}</span>
                                <i class="fa-solid fa-certificate text-sky-500 text-3xl "></i>
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="bg-gray-500 rounded-lg w-42 text-center h-full cursor-pointer" on:click={() => unFollowUser()}>Takip ediliyor</div>
                                <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer w">Mesaj Gönder</div>
                            </div> 
                            {:else}
                            <div class="flex pl-50 items-center gap-4 sm:pl-25">
                                <span class="text-3xl font-semibold ">{data.user.username}</span>
                                <i class="fa-solid fa-certificate text-sky-500 text-3xl "></i>
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="bg-blue-500 rounded-lg w-42 text-center h-full cursor-pointer" on:click={() => followUser()}>Takip Et</div>
                                <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer w">Mesaj Gönder</div>
                            </div>  
                        {/if}

                        {/if}
                {/if}
                {#if data.user.private}
                <div class="flex pl-10 gap-10 w-full items-center sm:pl-25 sm:gap-5 justify-center">
                    <div class="text-xl ">{data.user.posts.length} Post</div>
                    <div class="text-xl ">{data.user.followers.length} Takipçi</div>
                    <div class="text-xl ">{data.user.following.length} Takip Edilen</div>
                </div>
                {:else}
                <div class="flex pl-10  gap-10 w-full items-center justify-center">
                    <div class="text-xl ">{data.user.posts.length} Post</div>
                    <div class="text-xl ">{data.user.followers.length} Takipçi</div>
                    <div class="text-xl  font-medium tracking-wide">{data.user.following.length} Takip Edilen</div>
                </div>  
                {/if}
            </div>
        </div>
        <div class="flex justify-center">
            <hr class="w-4/6 text-gray-700">
        </div>
        <div class="h-fit items-center flex justify-center">
            {#if !isFollowing}
                
            
            {#if data.user.private}
                <div class="flex justify-center pt-10 items-center">
                    <div class="flex items-center gap-2">
                        <div class="flex justify-center border rounded-full h-12 w-12 items-center">
                            <i class="fa-solid fa-lock"></i> 
                        </div>
                    <span>Bu hesap gizli</span>
                    </div>
                    <div>
                        {#if isFollowRequestSended}
                        <div class="flex items-center gap-4 pl-10">
                            <!-- on:click={() => cancelFollowRequest()} -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div class="bg-gray-500 rounded-lg w-fit text-center h-full cursor-pointer" on:click={() => cancelFollowRequest()}>Takip isteği yollandı X</div>
                        </div>  
                    {:else}
                        {#if isFollowing}
                            <div class="flex items-center gap-4 pl-10">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="bg-gray-500 rounded-lg w-42 text-center h-full cursor-pointer" on:click={() => unFollowUser()}>Takip ediliyor</div>
                            </div> 
                            {:else}
                            <div class="flex items-center gap-4 pl-10">

                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="bg-blue-500 rounded-lg w-42 text-center h-full cursor-pointer" on:click={() => followUser()}>Takip Et</div>
                            </div>  
                        {/if}

                        {/if}
                    </div>
                </div>
            {:else}
                <div class="grid grid-cols-3 justify-between items-stretch gap-4 pt-20 sm:pt-10 sm:gap-2 sm:grid-cols-3s">

                    {#each a as  post}
                        
                            
                        <div class="border-[#2e2a35] order-1 border-4 w-60 h-60 rounded-lg  ">
                            <img src="{post}" class="aspect-square h-full rounded-sm" alt="">
                        </div>
                    {/each}

                </div>
            {/if}
            {:else}
            <div class="grid grid-cols-3 justify-between items-stretch gap-4 pt-20 sm:pt-10 sm:gap-2 sm:grid-cols-3s">

                {#each a as  post}
                    <div class="border-[#2e2a35] order-1 border-4 w-60 h-60 rounded-lg  ">
                        <img src="{post}" class="aspect-square h-full rounded-sm" alt="">
                    </div>
                {/each}
            </div>
            {/if}

        </div>
    </div>  

    {#if toast}
        <div class="fixed h-12 flex justify-center items-center right-0 left-0 bottom-0 bg-slate-800" in:fly={{x:200}} out:fade>
            {toast}
        </div>
    {/if}
{/if}