<script lang="ts">
    export let data;
    import { PUBLIC_BACKEND_URL } from "$env/static/public";
    import Leftbar from "$lib/components/Leftbar.svelte";
    import { socket } from "$lib/socket.js";
    import { onMount } from 'svelte';

    let messageInput = '';
    let messages = data.conversations.messages;
    let messagesContainer;
    let onlineUsers: any[] = [];

    // Konuşma ortağı
    const chatPartner = data.conversations.username === data.user.username 
        ? data.conversations.with 
        : data.conversations.username;

    // Online kullanıcıları dinle
    socket?.on('onlineUsers', (response: any) => {
        console.log('Online users received:', response);
        onlineUsers = response;
    });

    // Odaya katıl
    socket?.emit("joinRoom", data.conversations.id);

    // Mesajları dinle
    socket?.on("createdMessage", (data) => {
        console.log("Yeni mesaj:", data);
        messages = [...messages, data];
    });

    // Otomatik scroll fonksiyonu
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Yeni mesaj geldiğinde scroll
    $: if (messages) {
        setTimeout(scrollToBottom, 100);
    }

    // Kullanıcı online mı kontrolü
    $: isOnline = onlineUsers.some(user => {
        if (typeof user === 'object' && user !== null) {
            return user.username === chatPartner || user.name === chatPartner || user.id === chatPartner;
        }
        return user === chatPartner;
    });

    // Mesaj gönder
    function sendMessage() {
        if (messageInput.trim()) {
            socket?.emit('messageCreate', {
                conversation: data.conversations,
                message: messageInput,
                sendedFrom: data.user
            });
            console.log('Mesaj gönderildi:', messageInput);
            messageInput = '';
        }
    }
    
    // Enter tuşu ile gönder
    function handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
    
    // Mesaj zamanını formatla
    function formatMessageTime(date) {
        if (!date) return '';
        const messageDate = new Date(date);
        return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    onMount(() => {
        scrollToBottom();
    });
</script>

<div class="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-40">
  <!-- Sol sidebar -->
  <aside class="w-64 border-r border-slate-700 overflow-y-auto z-50 ">
    <Leftbar user={data.user} />
  </aside>

  <!-- Sağ sohbet alanı -->
  <main class="flex-1 flex flex-col">
    <!-- Header -->
    <div class="bg-slate-800/90 border-b border-slate-700 shadow-lg backdrop-blur-sm">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a href="/direct" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <img 
              src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{chatPartner}" 
              alt="{chatPartner}"
              class="w-12 h-12 rounded-full object-cover ring-2 {isOnline ? 'ring-green-500' : 'ring-slate-500'}"
            >
            
            <div>
              <h2 class="text-lg font-semibold text-slate-100">{chatPartner}</h2>
              {#if isOnline}
                <p class="text-sm text-green-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Çevrimiçi
                </p>
              {:else}
                <p class="text-sm text-slate-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-slate-500 rounded-full"></span>
                  Çevrimdışı
                </p>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </button>
            <button class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div bind:this={messagesContainer} class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 max-h-100
                                                                                                                                                  [&::-webkit-scrollbar]:w-2
                                                                                                                                                  [&::-webkit-scrollbar-track]:rounded-full
                                                                                                                                                  [&::-webkit-scrollbar-track]:bg-gray-100
                                                                                                                                                  [&::-webkit-scrollbar-thumb]:rounded-full
                                                                                                                                                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                                                                                                                                                  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                                                                                                                                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      <div class="max-w-5xl mx-auto px-6 py-6">
        {#if messages && messages.length > 0}
          <div class="space-y-4">
            {#each messages as message}
              {#if message.username === data.user.username}
                <!-- Gönderilen Mesaj (Sağ) -->
                <div class="flex justify-end items-end gap-2">
                  <span class="text-xs text-slate-500">
                    {formatMessageTime(message.createdAt || new Date())}
                  </span>
                  <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-md px-5 py-3 max-w-md shadow-lg">
                    <p class="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              {:else}
                <!-- Alınan Mesaj (Sol) -->
                <div class="flex justify-start items-end gap-2">
                  <img 
                    src="{PUBLIC_BACKEND_URL}/getUserProfilePhoto/{chatPartner}" 
                    alt="{chatPartner}"
                    class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  >
                  <div class="bg-slate-700/70 backdrop-blur-sm border border-slate-600 rounded-2xl rounded-bl-md px-5 py-3 max-w-md shadow-lg">
                    <p class="text-sm text-slate-100 leading-relaxed">{message.content}</p>
                  </div>
                  <span class="text-xs text-slate-500">
                    {formatMessageTime(message.createdAt || new Date())}
                  </span>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <!-- Boş Durum -->
          <div class="flex flex-col items-center justify-center h-full py-20">
            <div class="w-24 h-24 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-indigo-700">
              <svg class="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-200 mb-2">Henüz mesaj yok</h3>
            <p class="text-slate-400 text-center max-w-sm">
              {chatPartner} ile sohbete başlamak için ilk mesajı gönderin
            </p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Input Area -->
    <div class="bg-slate-800/90 border-t border-slate-700 shadow-lg backdrop-blur-sm">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-end gap-3">
          <button class="p-3 hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0">
            <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>

          <div class="flex-1 relative">
            <textarea
              bind:value={messageInput}
              on:keypress={handleKeyPress}
              placeholder="{chatPartner} kişisine mesaj gönder..."
              rows="1"
              class="w-full px-5 py-3 bg-slate-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-600 transition-all text-slate-100 placeholder-slate-400"
            ></textarea>
          </div>

          <button class="p-3 hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0">
            <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
          </button>

          <button 
            on:click={sendMessage}
            disabled={!messageInput.trim()}
            class="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl transition-all shadow-lg disabled:shadow-none flex-shrink-0 disabled:cursor-not-allowed"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  /* Özel scrollbar stilleri */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #1e293b;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
</style>

