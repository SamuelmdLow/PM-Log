<script lang="ts">    
    import M3UVideo from "$components/M3UVideo.svelte";
    import Vote from "./Vote.svelte";
    import { groupBySpeaker } from "$lib/utils";
    let { attachment } = $props();

    let json = $derived(JSON.parse(attachment.json));
    let diarizedSegments = $derived(groupBySpeaker(JSON.parse(attachment.content)));
</script>

<li class="attachment">
    <!-- 
    <a href={attachment.node.source} title={attachment.node.title}>
        <img src={json["video_poster"]} alt={attachment.node.title}/>
    </a>
    -->
    {#if json["video_m3u8"]}
        <M3UVideo video_json={json} diarizedSegments={diarizedSegments}/>
        <div class="attachment_link">
            <a href={attachment.source}>{attachment.title}</a>
        </div>
    {:else if json["ourcommons_votes"]}
        <Vote attachment={attachment} />
    {:else}
        <div class="attachment_link">
            <a href={attachment.source}>{attachment.title}</a>
        </div>
    {/if}

</li>

<style>
li {
    list-style: none;
}

.attachment {
    margin-bottom: 1rem;
    padding-block: 0.1rem;

    font-size: 0.9rem;
    font-weight: 400;
    line-height: 1;
    color: var(--color-text-200);
}

.attachment_link {
    border-left: 2px solid var(--color-border);
    padding-left: 1rem;
    margin-inline: 1.5rem;
}

img {
    margin-bottom: 1em;
    display: block;
    width: 100%;
}
</style>