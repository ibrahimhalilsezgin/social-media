<script lang="ts">
  import axios from "axios";
  import { getCookie } from "$lib/utils/cookies.util";


  export let show: boolean;

  let input: HTMLInputElement;
  let image: HTMLImageElement;
  let description: string = "";
  let file: File | null = null;
  let isLoading: boolean = false;
  let error: string = "";

  function onChange() {
    file = input.files?.[0] ?? null;
    error = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        image.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    file = null;
    image.src = "";
    input.value = "";
  }

  async function shareButton() {
    if (!file) {
      error = "Lütfen bir görsel seçin";
      return;
    }

    if (!description.trim()) {
      error = "Lütfen bir açıklama girin";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    isLoading = true;
    error = "";

    try {
      const res = await axios.post(`http://localhost:3000/posts/create`, formData, {
        headers: {
          Authorization: "Bearer " + getCookie("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Paylaşım başarılı:", res.data);

      // Temizle
      description = "";
      removeImage();
      show = false;

    } catch (err: any) {
      console.error("Hata:", err);
      error = err.response?.data?.message || "Paylaşım sırasında bir hata oluştu";
    } finally {
      isLoading = false;
    }
  }
</script>

{#if show}
  <!-- Arka plan -->
  <div 
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    on:click={() => show = false}
  >
    <!-- Modal kutusu -->
    <div 
      class="w-full max-w-6xl"
      on:click|stopPropagation
    >
      <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
        
        <!-- Başlık -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <h2 class="text-2xl font-bold text-white">Yeni Gönderi Oluştur</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6 p-6">
          
          <!-- Sol - Görsel Önizleme -->
          <div class="space-y-4">
            <div class="bg-slate-900/50 rounded-xl border-2 border-dashed border-purple-500/30 aspect-square flex items-center justify-center overflow-hidden relative group">
              {#if file}
                <img 
                  src="" 
                  alt="Önizleme" 
                  bind:this={image}
                  class="w-full h-full object-cover"
                />
                <button
                  on:click={removeImage}
                  class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Görseli Kaldır"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              {:else}
                <div class="text-center p-8">
                  <svg class="mx-auto h-16 w-16 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="text-gray-400 mb-4">Görsel seçilmedi</p>
                  <label
                    for="file"
                    class="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105"
                  >
                    Dosya Seç
                  </label>
                </div>
              {/if}
            </div>

            <input
              type="file"
              id="file"
              name="file"
              class="hidden"
              accept="image/*"
              bind:this={input}
              on:change={onChange}
            />

            {#if file}
              <label
                for="file"
                class="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors duration-200"
              >
                Farklı Görsel Seç
              </label>
            {/if}
          </div>

          <!-- Sağ - Açıklama ve Paylaş -->
          <div class="flex flex-col space-y-4">
            <div class="flex-1 flex flex-col">
              <label class="text-gray-300 font-medium mb-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                </svg>
                Açıklama
              </label>
              <textarea
                class="flex-1 bg-slate-900/50 border-2 border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 resize-none outline-none transition-colors duration-200"
                placeholder="Paylaşımınız hakkında bir şeyler yazın..."
                bind:value={description}
                maxlength="500"
              ></textarea>
              <div class="text-right text-sm text-gray-500 mt-2">
                {description.length}/500
              </div>
            </div>

            {#if error}
              <div class="bg-red-500/20 border border-red-500 rounded-lg px-4 py-3 text-red-200 flex items-center gap-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {error}
              </div>
            {/if}

            <button
              on:click={shareButton}
              disabled={isLoading || !file}
              class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-2 shadow-lg"
            >
              {#if isLoading} 
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Paylaşılıyor...
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Paylaş
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
