<script lang="ts">
    export let data;
</script>
<div class="text-2xl text-white border-4 flex border-red-500 h-screen flex-col sm:text-lg">
    <div class="border-red-800 border-2 items-center flex h-3/12 w-full pl-100 ht-6 sm:h-2/12">
        <img src="{data.user.profilePhoto}" class="rounded-full h-30 w-30" alt="{data.user.username}">        
        <div class="border-orange-500 border-2 flex flex-col  w-full pr-100 sm:pr-50">
            <div class="flex pl-50 border-pink-500 border-2 items-center gap-4 sm:pl-25">
                <span class="text-3xl font-semibold sm:text-xl">{data.user.username}</span>
                <i class="fa-solid fa-certificate text-sky-500 text-3xl sm:text-xl"></i>
                <div class="bg-blue-500 rounded-lg w-42 text-center h-full cursor-pointer sm:w-21 sm:text-sm">Takip Et</div>
                <div class="bg-gray-700 rounded-lg w-42 text-center h-full cursor-pointer sm:w-21 sm:text-sm">Mesaj Gönder</div>
            </div>  
            {#if data.user.private}
            <div class="flex pl-50  gap-10 w-full border-green-500 border-2 items-center sm:pl-25 sm:gap-5">
                <div class="text-3xl sm:text-sm">{data.user.posts} Post</div>
                <div class="text-3xl sm:text-sm">{data.user.followers} Takipçi</div>
                <div class="text-3xl sm:text-sm">{data.user.following} Takip Edilen</div>
            </div>
            {:else}
            <div class="flex pl-50  gap-10 w-full border-green-500 border-2 items-center">
                <div class="text-3xl sm:text-sm">{data.user.posts.length} Post</div>
                <div class="text-3xl sm:text-sm">{data.user.followers.length} Takipçi</div>
                <div class="text-3xl sm:text-sm">{data.user.following.length} Takip Edilen</div>
            </div>  
            {/if}
        </div>
    </div>
    <div class="border-yellow-500 border-6 h-fit items-center flex justify-center">


        <div class="grid grid-cols-3 justify-between items-stretch gap-4 pt-20 sm:pt-10 sm:gap-2 sm:grid-cols-3s">
            <div class="border-white order-1 border-4 w-60 h-60  ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
            <div class="border-white order-1 border-4 w-60 h-60 ">
                1
            </div>
        </div>


    </div>
</div>  