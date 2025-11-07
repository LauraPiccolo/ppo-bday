<script>
  import Gallery from '../../components/Gallery.svelte';

	export let data;
  console.log(data)
</script>

<Gallery images={data.crocoImages.map((img) => img.filename)}/>
