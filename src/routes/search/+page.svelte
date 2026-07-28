<script lang="ts">
	import { page } from '$app/state';
    import { getContextClient } from '@urql/svelte';
    import { onMount } from 'svelte';
    import TitleHeader from '../TitleHeader.svelte';
    import AttachmentResult from './AttachmentResult.svelte';
    import SearchBox from './SearchBox.svelte';
    import Loader from '../Loader.svelte';

    let search = $derived(getQuery(page.url.searchParams));
    let search_response = $state([]);

    let loading = $state(true);
    let error = $state(false);
    let endOfResults = $state(false);
    
    let limit = 10;
    let offset = 0;

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

    function addSearchResult(query:string) {
        if (query) {
            loading = true;
            error = false;
            endOfResults = false;
            client
                .query(SEARCH_QUERY, {"search": query, "limit": limit, "offset": offset})
                .toPromise()
                .then(result => {
                    if (result.data.attachmentsSemanticSearch.edges.length < limit ) {
                        endOfResults = true;
                    }
                    search_response = search_response.concat(result.data.attachmentsSemanticSearch.edges);
                    loading = false;
                }).catch(reason => {
                    error = true;
                    loading = false;
                });	
        }
    }

    function getQuery(searchParams:URLSearchParams) {
        const q = searchParams.get('q');
        if (q) {
            return decodeURI(q);
        }
        return null;
    }

    $effect(() => {
        offset = 0;
        search_response = [];
        console.log(search);
        addSearchResult(search);
    })

</script>

<svelte:head>
	<title>{search} - PM Log</title>
	<meta name="description" content="Activities of Canadian Prime Minister Mark Carney." />
</svelte:head>

<section>

    <TitleHeader />
    <SearchBox display={"central"}/>

    <div class="container">
        {#if error}
            <div class="loader">Error making request.</div>
        {:else if search_response.length == 0 && !loading}
            <div class="loader">No results.</div>
        {:else if search !== ""}
            {#each search_response as attachment}
                <AttachmentResult attachment={attachment.node} />
            {/each}

			<div class="end-container">
                {#if loading}
                    <Loader />
                {:else if !endOfResults}
                    <button onclick={() => {offset = offset + limit; addSearchResult(search)}} class="end">Load more</button>
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