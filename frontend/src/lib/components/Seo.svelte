<script lang="ts">
    export let title:string = '';
    export let description:string = '';
    export let image:string = '';
</script>

<svelte:head>
  <title>{title}</title>
  
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content={description} />

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />


  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>