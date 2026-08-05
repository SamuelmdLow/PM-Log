<script lang="ts">
    import AttachmentResultVideo from "./AttachmentResultVideo.svelte";
    import AtttachmentResultHTML from "./AttachmentResultHTML.svelte";
    import { dateString, durationString } from "$lib/utils";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));

</script>

{#if json["video_m3u8"]}
    <AttachmentResultVideo attachment={attachment} />
{:else}
    <AtttachmentResultHTML attachment={attachment} />
{/if}