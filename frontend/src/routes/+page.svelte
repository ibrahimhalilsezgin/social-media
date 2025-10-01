<script lang="ts">
	import Leftbar from "$lib/components/Leftbar.svelte";
	import axios from "axios";
	import { onMount } from "svelte";
	import { getCookie } from "../utils/cookies.util.js";
	import type { Post } from "$lib/stores/post.store.js";
	import { fade, fly, scale } from "svelte/transition";
	import { goto } from "$app/navigation";
  export let data 
  let loading:boolean = false;
  let posts:any = []
  let a:any = []
  let toast = '';
  let comment = '';
  let selectedPost: any = null;
  let showPostModal = false;
  let showLikesModal = false;
  onMount(async () => {
    
    try {
      const response = await axios({
        url:'http://localhost:3000/posts/',
        method:'GET',
        headers:{
          Authorization:'Bearer ' + getCookie('token')
        }
      });

      posts = response.data

      for(const post of posts) {
        const image = await axios({
                method:'get',
                url:`http://localhost:3000/posts/get/${post.user.username}/${post.post.filename}`,
                responseType:'blob',
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });
            const info:Post = (await axios({
                method:'GET',
                url: `http://localhost:3000/posts/getInfo/${post.user.username}/${post.post.filename}`,
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            })).data
            const blob = new Blob([image.data], { type: image.data.type });
            const f = URL.createObjectURL(blob);
            a = [...a, {
                post:{
                    id: info.id,
                    account_id: info.account_id,
                    description: info.description,
                    filename: info.filename,
                    blob: f,
                    likes:info.likes,
                    comments: info.comments,
                    created: info.created,
                    liked: info.likes.includes(data.user.username)
                },
                user:post.user
            }]
      }
    } catch (error) {
      
    }
  });


    function openPost(post: any, user:any) {
        console.log(post)
        selectedPost = {
          post:post,
          user:user
        };
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
                url:`http://localhost:3000/posts/getLikes`,
                method:'post',
                data:{
                    filename: post.post.filename
                },
                headers:{
                    Authorization: 'Bearer ' + getCookie('token')
                }
            });

            postLikes = response.data
        } catch (error) {
            // if(error) return console.error(error);
        }
    };
    const getPostComments = async (post:any) => {
        try {
            const response = await axios({
                url:`http://localhost:3000/posts/getComments`,
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
                url:`http://localhost:3000/posts/like`,
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
                url:`http://localhost:3000/posts/createComment`,
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

  // function toggleLike(index:any) {
  //   posts[index].isLiked = !posts[index].isLiked;
  //   posts[index].likes += posts[index].isLiked ? 1 : -1;
  // }
</script>

<Leftbar user={data.user} />

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center py-4 lg:py-8 px-2 lg:px-4 lg:ml-[20%] ml-0">
  <div class="w-full max-w-2xl space-y-4 lg:space-y-6">
    <!-- Create Post Card -->
    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-3 lg:p-4">
      <div class="p-[2px] rounded-full w-fit bg-gradient-to-r from-purple-500 via-70% to-pink-500">
          <img 
          src="http://localhost:3000/getUserProfilePhoto/{data.user.username}"
          alt={data.user.username} 
          class="w-14 h-10 lg:w-18 lg:h-18 rounded-full object-cover border-2 cursor-pointer hover:ring-purple-500 transition-all"
        />
      </div>
    </div>

    <!-- Posts Feed -->
    {#each a as p, i}
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300">
        <!-- Post Header -->
        <div class="flex items-center justify-between p-3 lg:p-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img 
                src="http://localhost:3000/getUserProfilePhoto/{p.user.username}"
                alt={p.user.username} 
                class="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-purple-500/50 cursor-pointer hover:ring-purple-500 transition-all"
              />
              <div class="absolute bottom-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <p class="text-white font-semibold hover:text-purple-300 cursor-pointer transition-colors text-sm lg:text-base">
                {p.user.username}
              </p>
              <p class="text-slate-400 text-xs lg:text-sm">{p.post.created}</p>
            </div>
          </div>
          <button class="text-slate-400 hover:text-white transition-colors p-2">
            <i class="fa-solid fa-ellipsis text-lg lg:text-xl"></i>
          </button>
        </div>
        
        <!-- Post Image -->
        <div class="relative group" >
          <img 
            
            src={p.post.blob} 
            alt="Post" 
            class="w-full aspect-square object-cover"
          />
          <!-- Double tap like animation area -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" on:click={() => openPost(p.post, p.user)}></div>
        </div>
        
        <!-- Post Actions -->
        <div class="p-3 lg:p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 lg:gap-4">
              <button 
                on:click={() => likePost(p.post)}
                class="text-xl lg:text-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Beğen"
              >
                {#if p.post.liked }
                  <i class="fa-solid fa-heart text-red-500" on:click={() => p.post.liked = false}></i>
                {:else}
                  <i class="fa-regular fa-heart text-white hover:text-red-400" on:click={() => p.post.liked = true}></i>
                {/if}
              </button>
              <button class="text-xl lg:text-2xl text-white hover:text-purple-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Yorum yap">
                <i class="fa-regular fa-comment"></i>
              </button>
              <button class="text-xl lg:text-2xl text-white hover:text-purple-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Paylaş">
                <i class="fa-regular fa-paper-plane"></i>
              </button>
            </div>
            <button class="text-xl lg:text-2xl text-white hover:text-yellow-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Kaydet">
              <i class="fa-regular fa-bookmark"></i>
            </button>
          </div>
          
          <!-- Likes Count -->
          <div class="text-white font-semibold text-sm lg:text-base">
            {p.post.likes.length} beğeni
          </div>
          
          <!-- Caption -->
          <div class="text-white text-sm lg:text-base">
            <span class="font-semibold hover:text-purple-300 cursor-pointer transition-colors">
              {p.user.username}
            </span>
            <span class="ml-2 text-slate-200">{p.post.description}</span>
          </div>
          
          <!-- Comments Link -->
          <button class="text-slate-400 hover:text-slate-300 transition-colors text-xs lg:text-sm" on:click={() => openPost(p.post)}>
            {p.post.comments.length} yorumun tümünü gör
          </button>
          

        </div>
      </div>
    {/each}

    <!-- End of Feed -->
    <div class="text-center py-8">
      <div class="inline-flex items-center gap-2 text-slate-500">
        <div class="w-16 h-px bg-slate-700"></div>
        <span class="text-sm">Hepsini gördün</span>
        <div class="w-16 h-px bg-slate-700"></div>
      </div>
    </div>
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

    {#if showLikesModal && selectedPost}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-170 flex items-center justify-center p-5" transition:fade on:click={() => showLikesModal = false} >
            <div class="bg-slate-900 h-fit w-1/4 pl-4 rounded-lg min-h-28">
                <div class="pt-4 text-2xl">Beğeniler</div>
                {#each postLikes as like}
                    <div>
                        <div class="flex items-center gap-4 p-5">
                            <img src="http://localhost:3000/getUserProfilePhoto/{like}" alt="{like}" class="w-12 rounded-full">
                            <div class="text-2xl font-bold">{like}</div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
  {/if}

      {#if showPostModal && selectedPost.post}

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="fixed inset-0 bg-black/80 backdrop-blur-sm z-150 flex items-center justify-center p-4"
            on:click={() => showPostModal = false}
            transition:fade
        >
            <div 
                class="relative max-w-6xl w-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
                on:click|stopPropagation
                transition:scale
            >
                <button 
                    on:click={() => showPostModal = false}
                    class="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                >
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>

                <!-- Left Side - Image -->
                <div class="flex-1 bg-black flex items-center justify-center lg:max-h-[90vh] max-h-[50vh]">
                    <img src="{selectedPost.post.blob}" class="max-w-full max-h-full object-contain" alt="Post">
                </div>

                <!-- Right Side - Comments Section -->
                <div class="w-full lg:w-[400px] flex flex-col bg-slate-900 lg:max-h-[90vh] max-h-[40vh]">
                    <!-- User Header -->
                    <div class="flex items-center gap-3 p-4  border-slate-800">
                        <img 
                            src="http://localhost:3000/getUserProfilePhoto/{selectedPost.user.username}" 
                            class="w-10 h-10 rounded-full ring-2 ring-purple-500/30 cursor-pointer" 
                            alt="{selectedPost.user.username}"
                            on:click={() => goto('/' + selectedPost.user.username)}
                        >
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold cursor-pointer" on:click={() => goto('/' + selectedPost.user.username)}>{selectedPost.user.username}</span>
                                {#if data.user.verified}
                                    <i class="fa-solid fa-certificate text-sky-500 text-xs"></i>
                                {/if}
                            </div>
                        </div>
                        <button class="text-slate-400 hover:text-white">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                    </div>
                    <hr class="text-black/80">
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
                                        src="http://localhost:3000/getUserProfilePhoto/{comment.username}" 
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

                            {#if selectedPost.liked}
                                <button class="hover:text-red-500 transition-colors" on:click={() => likePost(selectedPost)}>
                                    <i class="fa-solid fa-heart text-2xl text-red-500"></i>
                                </button>
                                {:else}
                                <button class="hover:text-red-500 transition-colors" on:click={() => likePost(selectedPost)}>
                                    <i class="fa-regular fa-heart text-2xl"></i>
                                </button>
                                
                            {/if}
                            <button class="hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-comment text-2xl"></i>
                            </button>
                            <button class="hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-paper-plane text-2xl"></i>
                            </button>
                            <button class="ml-auto hover:text-purple-400 transition-colors">
                                <i class="fa-regular fa-bookmark text-2xl"></i>
                            </button>
                        </div>

                        <!-- Likes Count -->
                        <div class="font-semibold text-sm cursor-pointer" >
                            <div class="flex justify-start" on:click={() => openLikesModal(selectedPost)}>
                                {selectedPost.post.likes.length} beğenme
                            </div>
                            <div class="flex justify-end text-white/80">
                                {selectedPost.post.created}
                            </div>
                        </div>

                        <!-- Comment Input -->
                        <div class="flex items-center gap-3 pt-2 border-t border-slate-800">
                            <input 
                                type="text" 
                                placeholder="Yorum ekle..." 
                                class="flex-1 bg-transparent outline-none text-sm placeholder-slate-500"
                                bind:value={comment}
                            >
                            <button class="text-purple-500 font-semibold text-sm hover:text-purple-400 disabled:text-slate-600 disabled:cursor-not-allowed" on:click={() => sendComment(selectedPost)}>
                                Paylaş
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
