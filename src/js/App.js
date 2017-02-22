/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
import { SourceData } from './sourceData';
import { FlightPath } from './flightPath';
import { datasets } from './cycleDatasets';
import { MapVis } from './mapVis';
console.log(datasets);
//mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mbWVsYm91cm5lIiwiYSI6ImNpejdob2J0czAwOWQzM21ubGt6MDVqaHoifQ.55YbqeTHWMK_b6CEAmoUlA';
/*
Pedestrian sensor locations: ygaw-6rzq

**Trees: http://localhost:3002/#fp38-wiyy

Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

let def = (a, b) => a !== undefined ? a : b;

let whenMapLoaded = (map, f) => map.loaded() ? f() : map.once('load', f);

let clone = obj => JSON.parse(JSON.stringify(obj));

const opacityProp = {
            fill: 'fill-opacity',
            circle: 'circle-opacity',
            symbol: 'icon-opacity',
            'line': 'line-opacity',
            'fill-extrusion': 'fill-extrusion-opacity'
        };

// returns a value like 'circle-opacity', for a given layer style.
function getOpacityProp(layer) {
    if (layer.layout && layer.layout['text-field'])
        return 'text-opacity';
    else
        return opacityProp[layer.type];
}

//false && whenMapLoaded(() =>
//  setVisColumn(sourceData.numericColumns[Math.floor(Math.random() * sourceData.numericColumns.length)]));

// TODO decide if this should be in MapVis
function showFeatureTable(feature, sourceData, mapvis) {
    function rowsInArray(array, classStr) {
        return '<table>' + 
            Object.keys(feature)
                .filter(key => 
                    array === undefined || array.indexOf(key) >= 0)
                .map(key =>
                    `<tr><td ${classStr}>${key}</td><td>${feature[key]}</td></tr>`)
                .join('\n') + 
            '</table>';
        }

    if (feature === undefined) {
        // Called before the user has selected anything
        feature = {};
        sourceData.textColumns.forEach(c => feature[c] = '');
        sourceData.numericColumns.forEach(c => feature[c] = '');
        sourceData.boringColumns.forEach(c => feature[c] = '');

    } else if (sourceData.shape === 'polygon') { // TODO check that this is a block lookup choropleth
        feature = sourceData.getRowForBlock(feature.block_id, feature.census_yr);        
    }



    document.getElementById('features').innerHTML = 
        '<h4>Click a field to visualise with colour</h4>' +
        rowsInArray(sourceData.textColumns, 'class="enum-field"') + 
        '<h4>Click a field to visualise with size</h4>' +
        rowsInArray(sourceData.numericColumns, 'class="numeric-field"') + 
        '<h4>Other fields</h4>' +
        rowsInArray(sourceData.boringColumns, '');


    document.querySelectorAll('#features td').forEach(td => 
        td.addEventListener('click', e => {
            mapvis.setVisColumn(e.target.innerText) ; // TODO highlight the selected row
        }));
}

var lastFeature;


function chooseDataset() {
    if (window.location.hash) {
        return window.location.hash.replace('#','');
    }

    // known CLUE block datasets that work ok
    var clueChoices = [
        'b36j-kiy4', // employment
        '234q-gg83', // floor space by use by block
        'c3gt-hrz6' // business establishments -- this one is complete, the others have gappy data for confidentiality
    ];

    // known point datasets that work ok
    var pointChoices = [
        'fp38-wiyy', // trees
        'ygaw-6rzq', // pedestrian sensor locations
        '84bf-dihi', // Venues for events
        'tdvh-n9dv', // Live bike share
        'gh7s-qda8', // DAM
        'sfrg-zygb', // Cafes and Restaurants
        'ew6k-chz4', // Bio Blitz 2016
        '7vrd-4av5', // wayfinding
        'ss79-v558', // bus stops
        'mffi-m9yn', // pubs
        'svux-bada', // soil textures - nice one
        'qjwc-f5sh', // community food guide - good
        'fthi-zajy', // properties over $2.5m
        'tx8h-2jgi', // accessible toilets
        '6u5z-ubvh', // bicycle parking
        //bs7n-5veh, // business establishments. 100,000 rows, too fragile.
        ];

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';
    return pointChoices[Math.round(Math.random() * pointChoices.length)];
    //return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    let includeNo = false;
    document.querySelector('#caption h1').innerHTML = (includeNo ? (_datasetNo || ''):'') + (caption || name || '');
    document.querySelector('#footer .dataset').innerHTML = name || '';
    
    // TODO reinstate for non-demo mode.
    //document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    //document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
 
 }

 function tweakPlaceLabels(map, up) {
    ['place-suburb', 'place-neighbourhood'].forEach(layerId => {

        //rgb(227, 4, 80); CoM pop magenta
        //map.setPaintProperty(layerId, 'text-color', up ? 'rgb(227,4,80)' : 'hsl(0,0,30%)'); // CoM pop green
        map.setPaintProperty(layerId, 'text-color', up ? 'rgb(0,183,79)' : 'hsl(0,0,30%)'); // CoM pop green
        
    });
 }

 function tweakBasemap(map) {
    var placecolor = '#888'; //'rgb(206, 219, 175)';
    var roadcolor = '#777'; //'rgb(240, 191, 156)';
    map.getStyle().layers.forEach(layer => {
        if (layer.paint['text-color'] === 'hsl(0, 0%, 60%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 20%)');
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 70%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 78%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 45%)'); // roads mostly
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 90%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');
    });
    ['poi-parks-scalerank1', 'poi-parks-scalerank1', 'poi-parks-scalerank1'].forEach(id => {
        map.setPaintProperty(id, 'text-color', '#333');
    });

    map.removeLayer('place-city-lg-s'); // remove the Melbourne label itself.

}

/*
  Refresh the map view for this new dataset.
*/
function showDataset(map, dataset, filter, caption, noFeatureInfo, options, invisible) {
    
    options = def(options, {});
    if (invisible) {
        options.invisible = true;
    } else {
        //showCaption(dataset.name, dataset.dataId, caption);
    }

    let mapvis = new MapVis(map, dataset, filter, !noFeatureInfo? showFeatureTable : null, options);

    showFeatureTable(undefined, dataset, mapvis); 
    return mapvis;
}

function addMapboxDataset(map, dataset) {
    if (!map.getSource(dataset.mapbox.source)) {
        map.addSource(dataset.mapbox.source, {
            type: 'vector',
            url: dataset.mapbox.source
        });
    }
}
/*
  Show a dataset that already exists on Mapbox
*/
function showMapboxDataset(map, dataset, invisible) {
    addMapboxDataset(map, dataset);
    let style = map.getLayer(dataset.mapbox.id);
    if (!style) {
        //if (invisible)
            //dataset.mapbox
        style = clone(dataset.mapbox);
        if (invisible) {
            style.paint[getOpacityProp(style)] = 0;
        }
        map.addLayer(style);
    } else {
        map.setPaintProperty(dataset.mapbox.id, getOpacityProp(style), def(dataset.opacity,0.9)); // TODO set right opacity
    }
    dataset.layerId = dataset.mapbox.id;

    //if (!invisible) 
        // surely this is an error - mapbox datasets don't have 'dataId'
        //showCaption(dataset.name, dataset.dataId, dataset.caption);
}

let _datasetNo='';
/* Advance and display the next dataset in our loop 
Each dataset is pre-loaded by being "shown" invisible (opacity 0), then "revealed" at the right time.

    // TODO clean this up so relationship between "now" and "next" is clearer, no repetition.

*/
function nextDataset(map, datasetNo) {
    function reveal(d) {
        // TODO change 0.9 to something specific for each type
        if (d.mapbox || d.dataset) {
            map.setPaintProperty(d.layerId, getOpacityProp(map.getLayer(d.layerId)), def(d.opacity, 0.9));
        } else if (d.paint) {
            d._oldPaint = [];
            d.paint.forEach(paint => {
                d._oldPaint.push([paint[0], paint[1], map.getPaintProperty(paint[0], paint[1])]);
                map.setPaintProperty(paint[0], paint[1], paint[2]);
            });
        }
        if (d.mapbox || d.paint) {
            showCaption(d.name, undefined, d.caption);
        } else if (d.dataset) {
            showCaption(d.dataset.name, d.dataset.dataId, d.caption);
        }
    }
    function preloadDataset(d) {
        if (d.mapbox) {
            showMapboxDataset(map, d, true);
        } else if (d.dataset) {
            d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options,  true);
            d.mapvis.setVisColumn(d.column);
            d.layerId = d.mapvis.layerId;
        }
    }

    _datasetNo = datasetNo;
    let d = datasets[datasetNo], 
        nextD = datasets[(datasetNo + 1) % datasets.length];


    if (!d.layerId || map.getLayer(d.layerid) /* this second test shouldn't be needed...*/) {
        preloadDataset(d);
    }
    reveal(d);
        

    // load, but don't show, next one. // Comment out the next line to not do the pre-loading thing.
    preloadDataset(nextD);

    if (d.showLegend) {
        document.querySelector('#legends').style.display = 'block';
    } else {
        document.querySelector('#legends').style.display = 'none';
    }

    // We're aiming to arrive at the viewpoint 1/3 of the way through the dataset's appearance
    // and leave 2/3 of the way through.
    if (d.flyTo && !map.isMoving()) {
        d.flyTo.duration = d.delay/3;// so it lands about a third of the way through the dataset's visibility.
        map.flyTo(d.flyTo);
    }
    
    if (nextD.flyTo) {
        // got to be careful if the data overrides this,
        nextD.flyTo.duration = def(nextD.flyTo.duration, d.delay/3.0 + nextD.delay/3.0);// so it lands about a third of the way through the dataset's visibility.
        setTimeout(() => {
            map.flyTo(nextD.flyTo);
        }, d.delay * 2.0/3.0);
    }

    setTimeout(() => {
        if (d.mapvis)
            d.mapvis.remove();
        
        if (d.mapbox)
            map.removeLayer(d.mapbox.id);

        if (d.paint) // restore paint settings before they were messed up
            d._oldPaint.forEach(paint => {
                map.setPaintProperty(paint[0], paint[1], paint[2]);
            });


        
    }, d.delay + def(d.linger, 0)); // optional "linger" time allows overlap. Not generally needed since we implemented preloading.
    
    setTimeout(() => {
        nextDataset(map, (datasetNo + 1) % datasets.length);
    }, d.delay );
}

/* Pre download all datasets in the loop */
function loadDatasets(map) {
    return Promise
        .all(datasets.map(d => { 
            if (d.dataset)
                return d.dataset.load();
            else
                return Promise.resolve();
                // style isn't done loading so we can't add sources. not sure it will actually trigger downloading anyway.
                //return Promise.resolve (addMapboxDataset(map, d));
        })).then(() => datasets[0].dataset);
}

function loadOneDataset() {
    let dataset = chooseDataset();
    return new SourceData(dataset).load();
    /*if (dataset.match(/....-..../))
        
    else
        return Promise.resolve(true);*/
}

(function start() {
    
    try {
        document.documentElement.requestFullscreen();
    } catch (e) {
    }


    let demoMode = window.location.hash === '#demo';
    if (demoMode) {
        // if we did this after the map was loading, call map.resize();
        document.querySelector('#features').style.display = 'none';        
        document.querySelector('#legends').style.display = 'none';        
    }

    let map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/dark-v9',
        style: 'mapbox://styles/cityofmelbourne/ciz983lqo001w2ss2eou49eos?fresh=5',
        center: [144.95, -37.813],
        zoom: 13,//13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl(), 'top-right');
    //map.once('load', () => tweakBasemap(map));
    //map.once('load',() => tweakPlaceLabels(map,true));
    //setTimeout(()=>tweakPlaceLabels(map, false), 8000);
    map.on('moveend', e=> {
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });
    map.on('error', e => {
        //console.error(e);
    });

    (demoMode ? loadDatasets(map) : loadOneDataset())
    .then(dataset => {
        window.scrollTo(0,1); // does this hide the address bar? Nope    
        if (dataset) 
            showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, () => {

            if (demoMode) {
                nextDataset(map, 0);
            } else {
                showDataset(map, dataset);
                // would be nice to support loading mapbox datasets but
                // it's a faff to guess how to style it
                //if (dataset.match(/....-..../))
                //else

            }
            document.querySelectorAll('#loading')[0].outerHTML='';

            if (demoMode) {
                //var fp = new FlightPath(map);
            }
        });
        

    });
})();