<script lang="ts">
    // https://www.d3indepth.com/geographic/
    import { getContextClient } from '@urql/svelte';
    import { geoPath, geoOrthographic, geoGraticule, geoDistance } from 'd3-geo';
    import { onMount } from 'svelte';

    let {focus = $bindable()} = $props();
    let source = focus;
    let rotation = $state(focus);

    const width = 800;
    const height = 600;

    let locations = [];

    const QUERY = `query MyQuery($limit: Int!, $offset: Int!) {
        allLocations(first: $limit, offset: $offset) {
            edges {
            node {
                latitude
                longitude
                name
            }
            }
            pageInfo {
            hasNextPage
            }
        }
        }`

    const client = getContextClient();
    const limit = 100;

    function addLocations(offset) {
        client
            .query(QUERY, {limit, offset})
            .toPromise()
            .then(result => {
                const newItems = result.data.allLocations.edges;
                if (newItems.length > 0) {
                    locations = locations.concat(newItems);

                    if (result.data.allLocations.pageInfo.hasNextPage) {
                        addLocations(offset+limit);
                    }
                }
            });
    }
    
    onMount(() => {
        addLocations(0);

        const canvas = <HTMLCanvasElement> document.getElementById("canvas");
            
        let context = < CanvasRenderingContext2D> canvas.getContext('2d');

        let geojson: Record<string, any> = {}

        let projection = geoOrthographic()
            .scale(300);

        let geoGenerator = geoPath()
            .projection(projection)
            .pointRadius(4)
            .context(context);

        projection.rotate(rotation);
    
        function update() {
            const difLong = focus[0] - rotation[0];
            const difLat = focus[1] - rotation[1];
            const difTotal = Math.sqrt(Math.pow(difLong, 2) + Math.pow(difLat, 2));
            if (difTotal > 0) {
                let ratio = 1/Math.sqrt(difTotal);
                if (ratio > 0.99) {
                    ratio = 1;
                }

                rotation[0] = rotation[0] + (difLong * ratio);
                rotation[1] = rotation[1] + (difLat * ratio);

                projection.rotate(rotation);
            } else {
                source = [focus[0], focus[1]];
            }

            context.clearRect(0, 0, width, height);

            context.lineWidth = 0.5;
            context.strokeStyle = '#333';

            context.beginPath();
            geoGenerator({type: 'FeatureCollection', features: geojson.features});
            context.stroke();

            for (let location of locations) {
                let cord = projection([location.node.longitude, location.node.latitude])

                let dist = geoDistance([location.node.longitude*-1, location.node.latitude*-1],rotation);
                let size = (1 * Math.max(Math.PI - dist, 0)) / Math.PI;
                let opacity = ((Math.PI*2) - dist)/ (Math.PI*2*2);

                context.fillStyle = "rgba(111, 14, 30, " + String(opacity) + ")";
                context.beginPath();
                context.arc(cord[0], cord[1], size, 0, 2 * Math.PI);
                context.fill();
            }

            let focusCord = projection([rotation[0]*-1, rotation[1]*-1]);
            let sourceCord = projection([source[0]*-1, source[1]*-1]);
            let targetCord = projection([focus[0]*-1, focus[1]*-1]);

            if (difTotal > 0) {
                context.lineWidth = 2;
                context.strokeStyle = "#C71A37";
                context.lineCap = "round";
                context.beginPath();
                context.moveTo(sourceCord[0], sourceCord[1]);
                context.quadraticCurveTo(focusCord[0], focusCord[1], targetCord[0], targetCord[1]);
                context.stroke();
            }
            context.fillStyle = "#C71A37";
            context.beginPath();
            context.arc(targetCord[0], targetCord[1], 2, 0, 2 * Math.PI);
            context.fill();

            // Graticule
            let graticule = geoGraticule();
            context.beginPath();
            context.lineWidth = 0.5;
            context.strokeStyle = '#ccc';
            geoGenerator(graticule());
            context.stroke();
        }
        fetch('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
            .then(response => response.text())
            .then(response => {
                geojson = JSON.parse(response);
                window.setInterval(update, 100);
            })
    })
</script>

<div id="content">
    <canvas id="canvas" width="800" height="600"></canvas>
</div>

<style>
    canvas {
        width: 100%;
    }
</style>