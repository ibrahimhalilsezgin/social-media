<script lang="ts">
	import Leftbar from "$lib/components/Leftbar.svelte";
  export let data
  
  let posts = [
    {
      user: "messi",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Gol atmak gibisi yok!",
      likes: 1245,
      comments: 89,
      timeAgo: "2 saat önce",
      isLiked: false
    },
    {
      user: "ronaldo",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Antrenman zamanı 💪",
      likes: 987,
      comments: 54,
      timeAgo: "5 saat önce",
      isLiked: false
    },
    {
      user: "neymar",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Sahada eğlence devam ediyor ⚡",
      likes: 1520,
      comments: 102,
      timeAgo: "1 gün önce",
      isLiked: false
    }
  ];

  function toggleLike(index:any) {
    posts[index].isLiked = !posts[index].isLiked;
    posts[index].likes += posts[index].isLiked ? 1 : -1;
  }
</script>

<Leftbar user={data.user} />

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center py-8 px-4 ml-[20%]">
  <div class="w-full max-w-2xl space-y-6">
    <!-- Create Post Card -->
    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-4">
      <div class="flex items-center gap-3">
        <img src={data.user.profilePhoto} alt="Your profile" class="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/50"/>
        <input 
          type="text" 
          placeholder="Aklından ne geçiyor?" 
          class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105">
          Paylaş
        </button>
      </div>
    </div>

    <!-- Posts Feed -->
    {#each posts as post, i}
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300">
        <!-- Post Header -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img 
                src={post.userImg} 
                alt={post.user} 
                class="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/50 cursor-pointer hover:ring-purple-500 transition-all"
              />
              <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <p class="text-white font-semibold hover:text-purple-300 cursor-pointer transition-colors">
                {post.user}
              </p>
              <p class="text-slate-400 text-sm">{post.timeAgo}</p>
            </div>
          </div>
          <button class="text-slate-400 hover:text-white transition-colors p-2">
            <i class="fa-solid fa-ellipsis text-xl"></i>
          </button>
        </div>
        
        <!-- Post Image -->
        <div class="relative group">
          <img 
            src={post.img} 
            alt="Post" 
            class="w-full aspect-square object-cover"
          />
          <!-- Double tap like animation area -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
        </div>
        
        <!-- Post Actions -->
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button 
                on:click={() => toggleLike(i)}
                class="text-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Beğen"
              >
                {#if post.isLiked}
                  <i class="fa-solid fa-heart text-red-500 animate-pulse"></i>
                {:else}
                  <i class="fa-regular fa-heart text-white hover:text-red-400"></i>
                {/if}
              </button>
              <button class="text-2xl text-white hover:text-purple-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Yorum yap">
                <i class="fa-regular fa-comment"></i>
              </button>
              <button class="text-2xl text-white hover:text-purple-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Paylaş">
                <i class="fa-regular fa-paper-plane"></i>
              </button>
            </div>
            <button class="text-2xl text-white hover:text-yellow-400 transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Kaydet">
              <i class="fa-regular fa-bookmark"></i>
            </button>
          </div>
          
          <!-- Likes Count -->
          <div class="text-white font-semibold">
            {post.likes.toLocaleString('tr-TR')} beğeni
          </div>
          
          <!-- Caption -->
          <div class="text-white">
            <span class="font-semibold hover:text-purple-300 cursor-pointer transition-colors">
              {post.user}
            </span>
            <span class="ml-2 text-slate-200">{post.caption}</span>
          </div>
          
          <!-- Comments Link -->
          <button class="text-slate-400 hover:text-slate-300 transition-colors text-sm">
            {post.comments} yorumun tümünü gör
          </button>
          
          <!-- Add Comment -->
          <div class="flex items-center gap-3 pt-2 border-t border-slate-700/50">
            <input 
              type="text" 
              placeholder="Yorum ekle..." 
              class="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
            <button class="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
              Gönder
            </button>
          </div>
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