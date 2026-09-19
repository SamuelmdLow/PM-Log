<script lang="ts">
    import AttachmentResultVideo from "$components/AttachmentResultVideo.svelte";
    import AtttachmentResultHTML from "$components/AttachmentResultHTML.svelte";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));

</script>

{#if json["video_m3u8"]}
    <AttachmentResultVideo attachment={attachment} />
{:else}
    <AtttachmentResultHTML attachment={attachment} />
{/if}