<script>
  import { onMount, onDestroy } from 'svelte';
  let mapContainer;

  // Verilerinizi buraya taşıdım:
  const dataSet = {
    TUR: {
      active: { value: '10000', percent: '100', isGrown: true },
      new: { value: '1,000', percent: '100', isGrown: true },
      fillKey: 'MAJOR',
      short: 'us',
      customName: 'Türkiye'
    }
  };

  let dataMap;

  onMount(() => {
    dataMap = new Datamap({
      element: mapContainer,
      projection: 'mercator',
      responsive: true,
      fills: {
        defaultFill: '#d1d5db',
        MAJOR: '#9ca3af'
      },
      data: dataSet,
      geographyConfig: {
        borderColor: 'rgba(0, 0, 0, .09)',
        highlightFillColor: '#3b82f6',
        highlightBorderColor: '#3b82f6',
        popupTemplate: function (geo, data) {
          if (!data) return;
          const growUp = `<svg class="size-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
          const growDown = `<svg class="size-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`;

          return `<div class="bg-white rounded-xl shadow-xl w-96 p-3">
            <div class="flex mb-1">
              <div class="me-2">
                <div class="size-4 rounded-full bg-no-repeat bg-center bg-cover" style="background-image: url('../assets/vendor/svg-country-flags/svg/${data.short}.svg')"></div>
              </div>
              <span class="text-sm font-medium text-black">${data.customName || geo.properties.name}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 text-black">Active:</span>
              <span class="text-sm font-medium ml-2 text-black">${data.active.value}</span>
              <span class="text-sm ml-1 text-black ${data.active.isGrown ? 'text-teal-500' : 'text-red-500'}">${data.active.percent}%</span>
              ${data.active.isGrown ? growUp : growDown}
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 text-black">New:</span>
              <span class="text-sm font-medium ml-2 text-black">${data.new.value}</span>
              <span class="text-sm ml-1 text-black ${data.new.isGrown ? 'text-teal-500' : 'text-red-500'}">${data.new.percent}%</span>
              ${data.new.isGrown ? growUp : growDown}
            </div>
          </div>`;
        }
      }
    });

    // Temaya göre renk güncelleme (örnek)
    function updateTheme(theme) {
      dataMap.options.fills = theme === 'dark'
        ? { defaultFill: '#374151', MAJOR: '#6b7280' }
        : { defaultFill: '#d1d5db', MAJOR: '#9ca3af' };

      dataMap.updateChoropleth(dataSet, { reset: true });
    }

    // Başlangıçta tema güncelle
    updateTheme(localStorage.getItem('hs_theme') || 'light');

    window.addEventListener('on-hs-appearance-change', e => {
      updateTheme(e.detail);
    });

    window.addEventListener('resize', () => dataMap.resize());
  });

  onDestroy(() => {
    window.removeEventListener('on-hs-appearance-change', () => {});
    window.removeEventListener('resize', () => {});
  });
</script>

<style>
  /* Sadece container yüksekliği ayarlıyoruz */
  #hs-users-datamap {
    position: relative;
    width: 100%;
    max-width: 900px;
    height: 500px;
    margin: auto;
  }
</style>

<div id="hs-users-datamap" bind:this={mapContainer}></div>
