<script>
    import { timeString } from "$lib/utils";
    import { now } from "$lib/time";

    let {attachment} = $props();
    let vote = $derived(JSON.parse(attachment.json)['ourcommons_votes'])
    let byParty = $derived(voteByParty(vote.votes));
    let partyLeans = $derived(partyLean(byParty));

    function voteByParty(voters) {
        let voteValue = {
            "Yea": {},
            "Nay": {},
            "Paired": {},
        };
        for (let voter of voters) {
            console.log(voter.vote);
            if (!(voter.party in voteValue[voter.vote])) {
                voteValue[voter.vote][voter.party] = [];
            }
            voteValue[voter.vote][voter.party].push(voter);
        }
        console.log(voteValue);
        return voteValue;
    }

    function dominantVote(result) {
        if (result == "Agreed To") {
            return "Yea";
        }
        return "Nay";
    }

    function voteValueOrder(result) {
        if (result == "Agreed To") {
            return ["Yea", "Nay", "Paired"];
        }
        return ["Nay", "Yea", "Paired"];
    }

    function partyLean(voteValues) {
        let parties = [];
        for (let value of Object.keys(voteValues)) {
            for (let party of Object.keys(voteValues[value])) {
                if (!(parties.includes(party))) {
                    parties.push(party);
                }
            }
        }

        let leans = {};
        for (let party of parties) {
            const yea = voteValues["Yea"][party] ? voteValues["Yea"][party].length : 0;
            const nay = voteValues["Nay"][party] ? voteValues["Nay"][party].length : 0;
            const paired = voteValues["Paired"][party] ? voteValues["Paired"][party].length : 0;

            if (yea > nay && yea > paired) {
                leans[party] = "Yea";
            } else if (nay > yea && nay > paired) {
                leans[party] = "Nay";
            } else {
                leans[party] = "Paired";
            }
        }

        return leans;
    }

</script>

<div class="vote">

    <div class="motion">
    <div class="time"><time datetime={attachment.publishedAt}>{timeString(attachment.publishedAt, $now)}</time></div>
    <div class="header">
        <a href={vote['vote_url']}>{vote['result']}: {vote['subject']}</a> 
        {#if 'bill_url' in vote}
        <a href={vote['bill_url']}>{"(" + (vote['bill_reading'] ? vote['bill_reading'] + " of ": "") + "Bill " + vote['bill_code'] + ")"}</a>
        {/if}
    </div>
    {#each vote.motion as motion_text}
        <p>{motion_text}</p>
    {/each}
    </div>

    <div class="breakdown">
    {#each voteValueOrder(vote.result) as value}
        {#if Object.values(byParty[value]).length > 0}
        <div class="breakdown-col">
            <div class={"breakdown-header" + (dominantVote(vote.result) == value ? " dominant" : "")}>{value} {Object.values(byParty[value]).map(a => a.length).reduce((a,b) => a+b)}</div>
            <ul>
            {#each Object.keys(byParty[value]).sort((a, b) => byParty[value][b].length - byParty[value][a].length) as party}
                {#if partyLeans[party] == value || value == "Paired" }
                <li>{party} ({byParty[value][party].length})</li>
                {:else}
                    {#each byParty[value][party] as voter}
                        <li><a href={voter.url}>{voter.name} ({voter.provinceTerritory} {party})</a></li>
                    {/each}
                {/if}
            {/each}
            </ul>
        </div>
        {/if}
    {/each}
    </div>
</div>

<style>
    .vote {
        padding-inline: 1.5em;        
        @media screen and (min-width: 1000px) {
            padding-inline: 1em;
            border-left: 2px solid var(--color-border);
        }
    }
    .motion {
        margin-bottom: 1em;
        max-height: 15em;
        overflow: auto;
        .time {
            font-size: 0.9em;
            color: var(--color-text-300)
        }
        .header {
            margin-block: 0.5em;
            font-weight: 600;
            line-height: 1.25em;
        }
        p {
            margin-block: 0 1em;
        }
    }
    .breakdown {
        display: flex;
        justify-content: space-between;
        .breakdown-header {
            margin-bottom: 0.5em;
            font-weight: 600;
            &.dominant {
                text-decoration: underline;
            }
        }
        .breakdown-col {
            max-width: calc(calc(100% - 2em) / 3);
        }
        ul {
            list-style: none;
            li {
                margin-bottom: 0.5em;
                font-size: 0.9em;
            }
        }
    }
</style>