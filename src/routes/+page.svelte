<script>
  import Canvas from "../components/Canvas.svelte";
  import { page } from '$app/stores';
	let key;
	$: key = $page.url.pathname;

</script>

{#key key}
<Canvas />
{/key}