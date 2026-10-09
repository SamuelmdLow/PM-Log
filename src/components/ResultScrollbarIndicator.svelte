<script>
	import { onMount } from "svelte";

    let {transcriptElem, getTranscriptElemOffset} = $props();
    let scrollbarIndicator;
    let scoreHighlightThreshold = 0.25;

    function createScrollBarIndicator() {
        if (transcriptElem && scrollbarIndicator) {
            scrollbarIndicator.innerHTMl = "";
            for (let child of transcriptElem.getElementsByClassName('transcript-line')) {
                let indicator = document.createElement("div");
                indicator.classList.add("indicator");
                indicator.style.top = String((getTranscriptElemOffset(child) / transcriptElem.scrollHeight) * 100) + "%";
                indicator.style.height = String((child.offsetHeight / transcriptElem.scrollHeight) * 100) + "%";
                const score = parseFloat(window.getComputedStyle(child).getPropertyValue("--score"));
                if (score > scoreHighlightThreshold) {
                    indicator.style.setProperty("--score", String(1 - ((1-score) * (1-score))));
                } else {
                    indicator.style.setProperty("--score", "0");
                }
                scrollbarIndicator.appendChild(indicator);
            }
        }
    }

    onMount(() => {
        createScrollBarIndicator();
    })
</script>
<div class="scrollbar-indicator" bind:this={scrollbarIndicator}></div>