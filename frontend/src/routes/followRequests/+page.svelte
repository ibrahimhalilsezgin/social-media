<script lang="ts">
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { getCookie } from '../../utils/cookies.util.js';

    export let data;
    let  error = {
        status:false,
        message: ''
    };
    const requests = data.followRequests

    const acceptRequest = async (username:string) => {
        console.log(username)
        try {
            const response = await axios({
                url:'http://localhost:3000/acceptFollowRequest',
                method:'post',
                data:{
                    username: username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                return goto('/followRequests');
            }
        } catch(err) {
            error = {
                status: true,
                message: err.response.data
            }

            setTimeout(() => {
                error.status = false
            }, 3400)
        }
    }

    const declineRequest = async (username:string) => {
        console.log(username)
        try {
            const response = await axios({
                url:'http://localhost:3000/declineFollowRequest',
                method:'post',
                data:{
                    username: username
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            if(response.status == 200) {
                return goto('/followRequests');
            }
        } catch(err) {
            error = {
                status: true,
                message: err.response.data
            }

            setTimeout(() => {
                error.status = false
            }, 3400)
        }
    }
</script>
{#if error.status}
    <div class="bg-red-500  fixed flex items-center justify-center w-screen">
        <div class="">{error.message}</div>
    </div>
{/if}

{#if requests.length <= 0}
        <div class="h-screen flex items-center justify-center">
            Takip isteğin bulunmuyor. 
        </div>
{:else}

    {#each requests as request}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="flex justify-center p-12 h-screen w-full">
            <div class=" flex items-center pl-4 border-[#2e2a35] border-4 w-full h-16 rounded-lg">
                <div class="  w-1/2 h-full flex items-center gap-4 cursor-pointer" onclick={() => goto('/' + request.username)}>
                    <img src="{request.profilePhoto}" class="w-12 rounded-full" alt="">
                    <div class="text-3xl" >
                        {request.username}
                    </div>
                </div>
                <div class="  w-1/2 h-full justify-end flex items-center pr-3 gap-4">
                    <button class=" w-2/12 h-2/3 bg-red-500 rounded-lg text-3xl flex items-center justify-center cursor-pointer hover:bg-red-800" aria-label="Reddet" onclick={() => declineRequest(request.username)}>
                        <i class="fa-solid fa-x"></i>
                    </button>
                    <button class=" w-2/12 h-2/3 bg-green-500 rounded-lg text-3xl flex items-center justify-center cursor-pointer hover:bg-green-700" aria-label="Kabul et" onclick={() => acceptRequest(request.username)}>
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            </div>
        </div>
    {/each}

{/if}