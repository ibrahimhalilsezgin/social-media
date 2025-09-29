<script>
	import Leftbar from "$lib/components/Leftbar.svelte";
  export let data
  let posts = [
    {
      user: "messi",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Gol atmak gibisi yok!"
    },
    {
      user: "ronaldo",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Antrenman zamanı 💪"
    },
    {
      user: "neymar",
      userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgVfHORQFLyUf_rNove-xUmxIskDeMJ63REz_YIMQ6S0vCyQdkBvJos4igKspvCgpqnpy8h0xM--1uckzZIxDgyoHy37-MowkF-YzvVx8",
      caption: "Sahada eğlence devam ediyor ⚡"
    }
  ];

</script>

<Leftbar user={data.user} />

<div class="min-h-screen flex flex-col items-center p-4 space-y-6">
  {#each posts as post}
    <div class="bg-gray-800 rounded-lg shadow-md w-full max-w-md overflow-hidden">
      <!-- Post Header -->
      <div class="flex items-center p-3 space-x-3">
        <img src={post.userImg} alt={post.user} class="w-10 h-10 rounded-full border-2 border-gray-700"/>
        <span class="text-white font-semibold">{post.user}</span>
      </div>  
      <!-- Post Image -->
      <img src={post.img} alt="Post Image" class="w-full"/>
      <!-- Post Actions -->
      <div class="flex items-center space-x-4 p-3 text-white text-xl">
        <button>❤️</button>
        <button>💬</button>
        <button>📤</button>
      </div>
      <!-- Caption -->
      <div class="px-3 pb-3 text-white">
        <span class="font-semibold">{post.user}</span> {post.caption}
      </div>
    </div>
  {/each}
</div>
