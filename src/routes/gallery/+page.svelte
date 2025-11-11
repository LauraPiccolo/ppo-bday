<script>
  import Gallery from '../../components/Gallery.svelte';
	export let data;
    import { page } from '$app/stores';
	let key;
	$: key = $page.url.pathname;
</script>
{#key key}
<Gallery images={data.crocoImages.map((img) => img.filename)}/>
  {/key}
