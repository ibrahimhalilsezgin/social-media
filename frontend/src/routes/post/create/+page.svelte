<script lang="ts">
  import axios from "axios";
  import { getCookie } from "../../../utils/cookies.util";

  let input: HTMLInputElement;
  let image: HTMLImageElement;
  let description: string = "";
  let file: File | null = null;

  function onChange() {
    file = input.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        image.src = reader.result as string; // önizleme
      };
      reader.readAsDataURL(file);
    }
  }

  async function shareButton() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await axios.post("http://localhost:3000/posts/create", formData, {
        headers: {
          Authorization: "Bearer " + getCookie("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Cevap:", res.data);
    } catch (err) {
      console.error("Hata:", err);
    }
  }
</script>

<div class="flex h-screen items-center justify-center flex-col gap-4">
  <div class="border-2 flex border-[#2e2a35] rounded-lg h-2/3 w-4/6 justify-center items-center">
    <div class="flex flex-col items-center gap-4 w-full border-4 border-[#2e2a35] h-full">
      <label
        for="file"
        class="border-blue-500 border w-1/4 text-center rounded-lg bg-blue-500 cursor-pointer"
        >Dosya Seç</label
      >
      <input
        type="file"
        id="file"
        name="file"
        class="hidden"
        accept="image/*"
        bind:this={input}
        on:change={onChange}
      />
      <img src="" alt="" bind:this={image} />
    </div>

    <!-- Burayı değiştirdim: artık flex-row -->
    <div class="flex flex-col h-full w-full">
      <div class="flex w-full h-full flex-row items-start gap-2">
        <!-- Açıklama -->
        <div class="flex flex-col  h-full w-full">
          <span>Açıklama:</span>
          <textarea
            class="h-2/3 border-[#2e2a35] border rounded-lg resize-none"
            bind:value={description}
          ></textarea>
        </div>

        <!-- Paylaş butonu -->
        <div class="flex  w-1/3 justify-end items-start">
          <button
            on:click={shareButton}
            class="bg-blue-500 rounded-lg w-full h-10 cursor-pointer"
          >
            Paylaş
          </button>
        </div>
      </div>

      <div class="flex w-full h-full "></div>
    </div>
  </div>
</div>

