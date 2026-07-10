<script lang="ts">
    import { timeString } from '../lib/utils.ts';
    import {now} from "../lib/time.js";
    
    let { node, selectedCoordinate = $bindable() } = $props();

    function setLocation(location: any) {
        selectedCoordinate = [location.longitude*-1, location.latitude*-1];
    }

</script>

<div class="schedule-item" onmouseover={(e: FocusEvent) => setLocation(node.location)}>
    <h4>
        <time datetime={node.datetime}>{timeString(node.datetime, $now)}</time> <a href={node.source}>{node.content}</a>
        <button class="location" onclick={(e: MouseEvent) => setLocation(node.location)}>{node.location.name}</button>
    </h4>
    {#if node.attachments.edges.length > 0}
    <ul>
        {#each node.attachments.edges as attachment}
        <li class="attachment">
            <a href={attachment.node.source}>{attachment.node.title}</a>
        </li>
        {/each}
    </ul>
    {/if}
</div>

<style>
.schedule-item {
    margin-bottom: 1rem;
}

time {
    font-weight: 400;
    font-size: 0.9rem;
    color: var(--color-text-300);
}

.location {
    font-weight: 400;
    font-size: 0.75em;
    color: var(--color-text-300);
}
.location:hover {
    opacity: 0.75;
}

h4 {
    font-weight: 500;
    padding-inline: 1.5rem;
    color: var(--color-text-100)
}

li {
    border-left: 2px solid var(--color-border);
    padding-left: 1rem;
    margin-inline: 1.5rem;
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
</style>