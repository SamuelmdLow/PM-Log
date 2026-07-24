<script lang="ts">
	import { now } from '../lib/time.js';
	import { getContextClient } from '@urql/svelte';
	import TitleHeader from './TitleHeader.svelte';
	import ScheduleItem from './ScheduleItem.svelte';
	import UpcomingScheduleItem from './UpcomingScheduleItem.svelte';
	import Globe from './Globe.svelte';
	import SearchBox from './search/SearchBox.svelte';
	import Loader from './Loader.svelte';

	let selectedCoordinate = $state([79.3839347, -43.6534817]);

	let limit = 100;
	let offset = $state(0);
	let loading = $state(true);

	const QUERY = `
			query MyQuery($limit: Int!, $offset: Int!) {
				allScheduleItems(first: $limit, offset: $offset) {
					edges {
						node {
							content
							source
							datetime
							location {
								name
								timezone
								longitude
								latitude
							}
							attachments {
								edges {
									node {
										title
										content
										source
										json
									}
								}
							}
						}
					}
				}
			}
    	`;

	let schedule = $state([]);
	let endOfSchedule = $state(false);

	const client = getContextClient();
	function addScheduieItems() {
		loading = true;
		client
			.query(QUERY, {limit, offset})
			.toPromise()
			.then(result => {
				const newItems = result.data.allScheduleItems.edges;
				loading = false;
				if (newItems.length > 0) {
					schedule = schedule.concat(result.data.allScheduleItems.edges);
				} else {
					endOfSchedule = true;
				}
			});
	}

	function getDate(edge: any) {
		const date = new Date(edge.node.datetime);
		const today = new Date();
		if (today.toDateString() == date.toDateString()) {
			return "Today";
		}
		return new Intl.DateTimeFormat('en-US', {    
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric", })
			.format(date) + ".";
	}

	function dateFormat(datetime: Date, timezone: String | null) {
		if (timezone==null) {
			timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		}

		const options = {      
			hour: "numeric",
    		minute: "2-digit",
			timeZoneName: "shortOffset",
			timeZone: timezone,} as Intl.DateTimeFormatOptions;

		return new Intl.DateTimeFormat('en-US', options).format(datetime);
	}

	function getFutureSchedule(schedule: any, now: Date) {
		return schedule
					.filter((edge: any) => new Date(edge.node.datetime) > now)
					.reverse();
	}

	function getPastSchedule(schedule: any, now: Date) {
		return schedule
					.filter((edge: any) => new Date(edge.node.datetime) <= now)
	}

	addScheduieItems();
	let futureSchedule = $derived(getFutureSchedule(schedule, $now));
	let pastSchedule = $derived(getPastSchedule(schedule, $now));
</script>

<svelte:head>
	<title>PM LOG</title>
	<meta name="description" content="Activities of Canadian Prime Minister Mark Carney." />
</svelte:head>

<section>

	<div class="background-map">
		<div class="globe-container">
			<div class="globe-wrapper">
			<Globe bind:focus={selectedCoordinate}/>
			</div>
		</div>
	</div>

	<TitleHeader />

	<div class="container">
		<div class="sidebar">
			<SearchBox newSearch={""} display={"small"} />

			{#if schedule.length <= 0}
				<Loader />
			{:else}
				<h2 class="visually-hidden">Future</h2>
				<div>
					<div class="local-time-header"><time datetime={$now.toLocaleTimeString()}>{dateFormat($now, null)}</time></div>
					{#if futureSchedule.length > 0}
						{#if futureSchedule[0].node.location }
							<div>{futureSchedule[0].node.location.name}: <time datetime={$now.toLocaleTimeString()}>{dateFormat($now, futureSchedule[0].node.location.timezone)}</time></div>
						{/if}
					{:else}
						{#if pastSchedule[0].node.location }
						<div>{pastSchedule[0].node.location.name}: <time datetime={$now.toLocaleTimeString()}>{dateFormat($now, pastSchedule[0].node.location.timezone)}</time></div>
						{/if}
					{/if}
				</div>
				{#if futureSchedule.length > 0}
				<ul>
					{#each Object.entries(Object.groupBy(futureSchedule, getDate)) as [date, items]}
						<li class="date-group">
							{#if date != "Today"}
							<h3>{date}</h3>
							{/if}
							<ul>
								{#each items as item}
									<li>
										<UpcomingScheduleItem node={item.node} />
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
				{:else}
				<p>No schedule available.</p>
				{/if}
			{/if}
		</div>

		<div>
			{#if schedule.length > 0}
				<ul>
					{#each Object.entries(Object.groupBy( pastSchedule, getDate )) as [date, items]}
						<li class="date-group">
							{#if date != "Today"}
							<h3 class="date-heading">{date}</h3>
							{/if}
							<ul>
								{#each items as item}
									<li>
										<ScheduleItem node={item.node} bind:selectedCoordinate={selectedCoordinate}/>
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}

			{#if loading}
				<Loader />
			{:else}
			<div class="end-container">
				{#if !endOfSchedule}
				<button class="end" onclick={(e) => {offset = offset + limit; addScheduieItems();}}>Load more</button>
				{:else}
				<p class="end">End of schedule</p>
				{/if}
			</div>
			{/if}
			
		</div>

		<div class="sidebar">
		</div>
	</div>
</section>

<style>	
	.container {
		margin-inline: auto;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		max-width: 1100px;
		gap: 1.5em;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.local-time-header {
		font-size: 2em;
		font-weight: 600;
	}

	.date-group {
		margin-bottom: 2rem;
	}

	.date-heading {
		margin: 0.75em auto;
		padding-inline: 1em;
		border-bottom: 2px solid var(--color-border);
		width: fit-content;

		text-align: center;
		color: var(--color-text-200);
		font-family: "Instrument Serif", serif;
		font-weight: 400;
	}

	.sidebar {
  		flex-shrink: 0;
	}

	.background-map {
		position: sticky;
		top: 0;
		z-index: -1;
		height: 100%;
	}
	.globe-container {
		position: absolute;
		right: 0;
		max-width: 75vw;
		height: 100vh;
		width: auto;
		aspect-ratio: 1;
	}
	.globe-wrapper {
		width: 100%;
		mask-mode: alpha;
		mask-image: radial-gradient(closest-corner at 66% 33%,black,rgba(0,0,0,0.1));
	}

	@media screen and (min-width: 1000px) {
		.sidebar {
			width: 100%;
			max-width: min(300px, 30%);
		}
	}

	@media screen and (max-width: 1000px) {
		.container {
			max-width: 750px;
			flex-direction: column;
		}
		.sidebar {
			padding: 1.5rem;
		}
		.local-time-header {
			font-size: 1.5em;
		}
	}
</style>
