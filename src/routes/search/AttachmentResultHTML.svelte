<script lang="ts">
    import { onMount } from "svelte";
    import { dateString, durationString } from "$lib/utils";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));
    let scored_content = $derived(JSON.parse(attachment.scoredContent));
    let htmlElem;

    onMount(() => {
        if (htmlElem && htmlElem.children.length > 0) {
            const i = scored_content.map(segment => segment.score).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            htmlElem.scrollTo(0, htmlElem.children[i].offsetTop);
        }
    })


    function wrapInnerWithMark(html, score) {
        const elems = ["p", "h1", "h2", "h3", "h4", "li"];
        let attributes = " style='--score: " + String(score) + "'";
        let classList = "marked";
        if (score > 0.45) {
            classList = classList + " higlight"; 
            attributes = attributes + " class='" + classList + "'";
        }
        for (const elem of elems) {
            html = html.replaceAll("<" + elem + ">", "<" + elem + attributes + ">");
        }
        return html
    }
</script>

<div class="result-container">
    <div class="video-container">
        <div class="video-meta">
            <a href={attachment.source}>
                <h3>{attachment.title}</h3>
            </a>
            <div>{dateString(attachment.publishedAt)}</div>
        </div>
    </div>

    <div class="transcript-container">
        {#if scored_content.length > 0}
        <div bind:this={htmlElem} class="transcript">
            {#each scored_content as segment}
                {#if segment["score"] >  0.25}
                    {@html wrapInnerWithMark(segment["data"]["html"], segment["score"])}
                {:else}
                    {@html segment["data"]["html"]}
                {/if}
            {/each}
        </div>
        {:else}
        <p>No transcript generated yet.</p>
        {/if}
    </div>
</div>

<style>
    .result-container {
        position: relative;
        padding-block: 1.5em;
        border-bottom: 1px solid var(--color-border);
    }
    .video-container {
        width: 100%;
        flex-shrink: 0;
    }
    .transcript-container {
        margin: 0em 0 1em 1em;
        width: 100%;
        min-height: 300px;
        clip-path: content-box;
        position: relative;
    }

    .transcript {
        overflow-y: scroll;
        font-size: 15px;
        font-family: serif;
    }

    .video-meta {
        margin: 1em;
    }
    .video-meta h3 {
        margin: 0 0 0.5em 0;
    }

    @media screen and (min-width: 781px) {
        .transcript {
            padding-right: 1em;
            position: absolute;
            top: 0;
            bottom: 0;
        }
    }
    @media screen and (max-width: 780px) {
        .transcript-container {
            width: auto;
            margin: 0 1em 1em 1em;
        }
        .transcript {
            max-height: 300px;
        }
        .result-container {
            flex-direction: column;
        }
    }
</style>