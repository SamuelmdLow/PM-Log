<script lang="ts">
	import { page } from '$app/state';
    import { getContextClient } from '@urql/svelte';
    import { onMount } from 'svelte';
    import TitleHeader from '../TitleHeader.svelte';
    import AttachmentResult from './AttachmentResult.svelte';
    import SearchBox from './SearchBox.svelte';

    let loading = $state(false);
    let error = $state(false);
    let search_response = $state([]);
    let endOfResults = $state(false);

	const SEARCH_QUERY = `
		query MyQuery($search: String!, $limit: Int!, $offset: Int!) {
			attachmentsSemanticSearch(query: $search, first: $limit, offset: $offset) {
                edges {
                    node {
                        id
                        title
                        content
                        json
                        publishedAt
                        source
                        scoredContent(query: $search)
                    }
                }
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
    let newSearch = $state("");
    let limit = 10;
    let offset = 0;

    function addSearchResult() {
        client
            .query(SEARCH_QUERY, {search, limit, offset})
            .toPromise()
            .then(result => {
                if (result.data.attachmentsSemanticSearch.edges.length < limit ) {
                    endOfResults = true;
                }
                search_response = search_response.concat(result.data.attachmentsSemanticSearch.edges);
                console.log(search_response);
                loading = false;
            }).catch(reason => {
                error = true;
                loading = false;
            });	
    }

    $effect(() => {
        newSearch = search;
        endOfResults = false;
        search_response = [];
        loading = false;
        if (search != "") {
            loading = true;
            error = false;
            addSearchResult()
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
        {#if search == ""}
            <div class="loader">Search something</div>
        {:else if loading}
            <div class="loader">Loading...</div>
        {:else if error}
            <div class="loader">Error making request.</div>
        {:else if search_response.length == 0}
            <div class="loader">No results.</div>
        {:else}
            {#each search_response as attachment}
                <AttachmentResult attachment={attachment.node} />
            {/each}

			<div class="end-container">
				{#if !endOfResults}
                <button onclick={() => {offset = offset + limit; addSearchResult()}} class="end">Load more</button>
				{/if}
			</div>

        {/if}
    </div>
</section>

<style>
    .container {
        margin: auto;
        max-width: 800px;
    }
</style>