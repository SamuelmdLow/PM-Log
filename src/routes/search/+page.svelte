<script lang="ts">
	import { page } from '$app/state';
    import { getContextClient } from '@urql/svelte';
    import { onMount } from 'svelte';
    import TitleHeader from '../TitleHeader.svelte';
    import AttachmentResult from './AttachmentResult.svelte';
    import SearchBox from './SearchBox.svelte';

    let loading = $state(false);
    let search_response = $state([]);

	const SEARCH_QUERY = `
		query MyQuery($search: String!) {
			attachmentsSemanticSearch(query: $search) {
				content
				id
				json
				publishedAt
				source
				title
			}
		}
	`;

    const client = getContextClient();

    function readQuery(searchParams:URLSearchParams) {
        if (page.url.searchParams.has('q')) {
            return decodeURI(searchParams.get('q'));
        }
        return '';
    }

    let search = $derived(readQuery(page.url.searchParams));
    let newSearch = $state("")
    $effect(() => {
        newSearch = search;
        if (search != "") {
            loading = true;
            client
                .query(SEARCH_QUERY, {search})
                .toPromise()
                .then(result => {
                    search_response = result.data.attachmentsSemanticSearch;
                    console.log(search_response);
                    loading = false;
                });	
        }
    })

</script>

<svelte:head>
	<title>PM LOG - Search</title>
	<meta name="description" content="Activities of Canadian Prime Minister Mark Carney." />
</svelte:head>

<section>

    <TitleHeader />
    <SearchBox bind:newSearch={newSearch} display={"central"}/>

    <div class="container">
        {#if loading}
            <div class="loader">Loading...</div>
        {:else if search_response.length == 0}
            <div class="loader">No results.</div>
        {:else}
            {#each search_response as attachment}
                <AttachmentResult attachment={attachment} />
            {/each}
        {/if}
    </div>
</section>

<style>
    .container {
        margin: auto;
        max-width: 800px;
    }
</style>