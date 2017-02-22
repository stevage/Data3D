(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showRadiusLegend = showRadiusLegend;
exports.showExtrusionHeightLegend = showExtrusionHeightLegend;
exports.showCategoryLegend = showCategoryLegend;
/* jshint esnext:true */
function showRadiusLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = (closeHandler ? '<div class="close">Close ✖</div>' : '') + ('<h3>' + columnName + '</h3>') + (
    // TODO pad the small circle so the text starts at the same X position for both
    '<span class="circle" style="height:6px; width: 6px; border-radius: 3px"></span><label>' + minVal + '</label><br/>') + ('<span class="circle" style="height:20px; width: 20px; border-radius: 10px"></span><label>' + maxVal + '</label>');

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}

function showExtrusionHeightLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = (closeHandler ? '<div class="close">Close ✖</div>' : '') + ('<h3>' + columnName + '</h3>') + ('<span class="circle" style="height:20px; width: 12px; background: rgb(40,40,250)"></span><label>' + maxVal + '</label><br/>') + ('<span class="circle" style="height:3px; width: 12px; background: rgb(20,20,40)"></span><label>' + minVal + '</label>');

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}

function showCategoryLegend(id, columnName, colorStops, closeHandler) {
    var legendHtml = '<div class="close">Close ✖</div>' + ('<h3>' + columnName + '</h3>') + colorStops.sort(function (stopa, stopb) {
        return stopa[0].localeCompare(stopb[0]);
    }) // sort on values
    .map(function (stop) {
        return '<span class="box" style=\'background: ' + stop[1] + '\'></span><label>' + stop[0] + '</label><br/>';
    }).join('\n');

    document.querySelector(id).innerHTML = legendHtml;
    document.querySelector(id + ' .close').addEventListener('click', closeHandler);
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MapVis = undefined;

var _legend = require('./legend');

var legend = _interopRequireWildcard(_legend);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* jshint esnext:true */

/*
Wraps a Mapbox map with data vis capabilities like circle size and color, and polygon height.

sourceData is an object with:
- dataId
- locationColumn
- textColumns
- numericColumns
- rows
- shape
- mins, maxs
*/
var def = function def(a, b) {
    return a !== undefined ? a : b;
};

var unique = 0;

var MapVis = exports.MapVis = function MapVis(map, sourceData, filter, featureHoverHook, options) {
    var _this2 = this;

    _classCallCheck(this, MapVis);

    this.map = map;
    this.sourceData = sourceData;
    this.filter = filter;
    this.featureHoverHook = featureHoverHook; // f(properties, sourceData)
    options = def(options, {});
    this.options = {
        circleRadius: def(options.circleRadius, 10),
        invisible: options.invisible, // whether to create with opacity 0
        symbol: options.symbol // Mapbox symbol properties, meaning we show symbol instead of circle
    };

    //this.options.invisible = false;
    // TODO should be passed a Legend object of some kind.

    this.dataColumn = undefined;

    this.layerId = sourceData.shape + '-' + sourceData.dataId + '-' + unique++;
    this.layerIdHighlight = this.layerId + '-highlight';

    // Convert a table of rows to a Mapbox datasource
    this.addPointsToMap = function () {
        var sourceId = 'dataset-' + this.sourceData.dataId;
        if (!this.map.getSource(sourceId)) this.map.addSource(sourceId, pointDatasetToGeoJSON(this.sourceData));

        if (!this.options.symbol) {
            this.map.addLayer(circleLayer(sourceId, this.layerId, this.filter, false, this.options.invisible));
            if (this.featureHoverHook) this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
        } else {
            this.map.addLayer(symbolLayer(sourceId, this.layerId, this.options.symbol, this.filter, false, this.options.invisible));
            if (this.featureHoverHook)
                // try using a circle highlight even on an icon
                this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
            //this.map.addLayer(symbolLayer(sourceId, this.layerIdHighlight, this.options.symbol, ['==', this.sourceData.locationColumn, '-'], true)); // highlight layer
        }
    };

    this.addPolygonsToMap = function () {
        // we don't need to construct a "polygon datasource", the geometry exists in Mapbox already
        // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4

        // add CLUE blocks polygon dataset, ripe for choroplething
        var sourceId = 'dataset-' + this.sourceData.dataId;
        if (!this.map.getSource(sourceId)) this.map.addSource(sourceId, {
            type: 'vector',
            url: 'mapbox://opencouncildata.aedfmyp8'
        });
        if (this.featureHoverHook) {
            this.map.addLayer(polygonHighlightLayer(sourceId, this.layerIdHighlight, this.options.invisible));
        }
        this.map.addLayer(polygonLayer(sourceId, this.layerId, this.options.invisible));
    };

    // switch visualisation to using this column
    this.setVisColumn = function (columnName) {
        if (this.options.symbol) {
            //console.log('This is a symbol layer, we ignore setVisColumn.');
            return;
        }
        if (columnName === undefined) {
            columnName = sourceData.textColumns[0];
        }
        this.dataColumn = columnName;
        console.log('Data column: ' + this.dataColumn);

        if (sourceData.numericColumns.indexOf(this.dataColumn) >= 0) {
            if (sourceData.shape === 'point') {
                this.setCircleRadiusStyle(this.dataColumn);
            } else {
                // polygon
                this.setPolygonHeightStyle(this.dataColumn);
                // TODO add close button behaviour. maybe?
            }
        } else if (sourceData.textColumns.indexOf(this.dataColumn) >= 0) {
            // TODO handle enum fields on polygons (no example currently)
            this.setCircleColorStyle(this.dataColumn);
        }
    };

    this.setCircleRadiusStyle = function (dataColumn) {
        var minSize = 0.3 * this.options.circleRadius;
        var maxSize = this.options.circleRadius;

        this.map.setPaintProperty(this.layerId, 'circle-radius', {
            property: dataColumn,
            stops: [[{ zoom: 10, value: sourceData.mins[dataColumn] }, 1], [{ zoom: 10, value: sourceData.maxs[dataColumn] }, 3], [{ zoom: 17, value: sourceData.mins[dataColumn] }, minSize], [{ zoom: 17, value: sourceData.maxs[dataColumn] }, maxSize]]
        });

        legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn] /*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
    };

    this.removeCircleRadius = function (e) {
        console.log(pointLayer().paint['circle-radius']);
        this.map.setPaintProperty(this.layerId, 'circle-radius', pointLayer().paint['circle-radius']);
        document.querySelector('#legend-numeric').innerHTML = '';
    };

    this.setCircleColorStyle = function (dataColumn) {
        // from ColorBrewer
        var enumColors = ['#1f78b4', '#fb9a99', '#b2df8a', '#33a02c', '#e31a1c', '#fdbf6f', '#a6cee3', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        var enumStops = this.sourceData.sortedFrequencies[dataColumn].map(function (val, i) {
            return [val, enumColors[i]];
        });
        this.map.setPaintProperty(this.layerId, 'circle-color', {
            property: dataColumn,
            type: 'categorical',
            stops: enumStops
        });
        // TODO test close handler, currently non functional due to pointer-events:none in CSS
        legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, this.removeCircleColor.bind(this));
    };

    this.removeCircleColor = function (e) {
        this.map.setPaintProperty(this.layerId, 'circle-color', pointLayer().paint['circle-color']);
        document.querySelector('#legend-enum').innerHTML = '';
    };
    /*
        Applies a style that represents numeric data values as heights of extruded polygons.
        TODO: add removePolygonHeight
    */
    this.setPolygonHeightStyle = function (dataColumn) {
        var _this = this;

        this.map.setPaintProperty(this.layerId, 'fill-extrusion-height', {
            // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
            property: 'block_id', //locationColumn, // the ID on the actual geometry dataset
            type: 'categorical',
            stops: this.sourceData.filteredRows().map(function (row) {
                return [row[_this.sourceData.locationColumn], row[dataColumn] / _this.sourceData.maxs[dataColumn] * 1000];
            })
        });
        this.map.setPaintProperty(this.layerId, 'fill-extrusion-color', {
            property: 'block_id',
            type: 'categorical',
            stops: this.sourceData.filteredRows()
            //.map(row => [row[this.sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / this.sourceData.maxs[dataColumn] * 200) + ')'])
            .map(function (row) {
                return [row[_this.sourceData.locationColumn], 'hsl(340,88%,' + Math.round(20 + row[dataColumn] / _this.sourceData.maxs[dataColumn] * 50) + '%)'];
            })
        });
        this.map.setFilter(this.layerId, ['!in', 'block_id'].concat(_toConsumableArray( /* ### TODO generalise */
        this.sourceData.filteredRows().filter(function (row) {
            return row[dataColumn] === 0;
        }).map(function (row) {
            return row[_this.sourceData.locationColumn];
        }))));

        legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, this.sourceData.mins[dataColumn], this.sourceData.maxs[dataColumn] /*, removeCircleRadius*/);
    };

    this.lastFeature = undefined;

    this.remove = function () {
        this.map.removeLayer(this.layerId);
        if (this.mousemove) {
            this.map.removeLayer(this.layerIdHighlight);
            this.map.off('mousemove', this.mousemove);
            thouse.mousemove = undefined;
        }
    };
    // The actual constructor...
    if (this.sourceData.shape === 'point') {
        this.addPointsToMap();
    } else {
        this.addPolygonsToMap();
    }
    if (featureHoverHook) {
        this.mousemove = function (e) {
            var f = _this2.map.queryRenderedFeatures(e.point, { layers: [_this2.layerId] })[0];
            if (f && f !== _this2.lastFeature) {
                _this2.map.getCanvas().style.cursor = 'pointer';

                _this2.lastFeature = f;
                if (featureHoverHook) {
                    featureHoverHook(f.properties, _this2.sourceData, _this2);
                }

                if (sourceData.shape === 'point') {
                    _this2.map.setFilter(_this2.layerIdHighlight, ['==', _this2.sourceData.locationColumn, f.properties[_this2.sourceData.locationColumn]]); // we don't have any other reliable key?
                } else {
                    _this2.map.setFilter(_this2.layerIdHighlight, ['==', 'block_id', f.properties.block_id]); // don't have a general way to match other kinds of polygons
                    //console.log(f.properties);
                }
            } else {
                _this2.map.getCanvas().style.cursor = '';
            }
        }.bind(this);
        this.map.on('mousemove', this.mousemove);
    }
};

// convert a table of rows to GeoJSON


function pointDatasetToGeoJSON(sourceData) {
    var datasource = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    sourceData.rows.forEach(function (row) {
        try {
            if (row[sourceData.locationColumn]) {
                datasource.data.features.push({
                    type: 'Feature',
                    properties: row,
                    geometry: {
                        type: 'Point',
                        coordinates: row[sourceData.locationColumn]
                    }
                });
            }
        } catch (e) {
            // Just don't push it 
            console.log('Bad location: ' + row[sourceData.locationColumn]);
        }
    });
    return datasource;
};

function circleLayer(sourceId, layerId, filter, highlight, invisible) {
    var ret = {
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
            //            'circle-color': highlight ? 'hsl(20, 95%, 50%)' : 'hsl(220,80%,50%)',
            'circle-color': highlight ? 'rgba(0,0,0,0)' : 'hsl(220,80%,50%)',
            'circle-opacity': !invisible ? 0.95 : 0,
            'circle-stroke-color': highlight ? 'white' : 'rgba(50,50,50,0.5)',
            'circle-stroke-width': 1,
            'circle-radius': {
                stops: highlight ? [[10, 4], [17, 10]] : [[10, 2], [17, 5]]
            }
        }
    };
    if (filter) ret.filter = filter;
    return ret;
}

function symbolLayer(sourceId, layerId, symbol, filter, highlight, invisible) {
    var ret = {
        id: layerId,
        type: 'symbol',
        source: sourceId
    };
    if (filter) ret.filter = filter;

    ret.paint = def(symbol.paint, {});
    ret.paint['icon-opacity'] = !invisible ? 0.95 : 0;

    //ret.layout = def(symbol.layout, {});
    if (symbol.layout) ret.layout = symbol.layout;

    return ret;
}

function polygonLayer(sourceId, layerId, invisible) {
    return {
        id: layerId,
        type: 'fill-extrusion',
        source: sourceId,
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-extrusion-opacity': !invisible ? 0.8 : 0,
            'fill-extrusion-height': 0,
            'fill-extrusion-color': '#003'
        }
    };
}
function polygonHighlightLayer(sourceId, layerId) {
    return {
        id: layerId,
        type: 'fill',
        source: sourceId,
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-color': 'white'
        },
        filter: ['==', 'block_id', '-']
    };
}

},{"./legend":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2xlZ2VuZC5qcyIsInNyYy9qcy9tYXBWaXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0NnQixnQixHQUFBLGdCO1FBY0EseUIsR0FBQSx5QjtRQWVBLGtCLEdBQUEsa0I7QUE5QmhCO0FBQ08sU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QixVQUE5QixFQUEwQyxNQUExQyxFQUFrRCxNQUFsRCxFQUEwRCxZQUExRCxFQUF3RTtBQUMzRSxRQUFJLGFBQ0EsQ0FBQyxlQUFlLGtDQUFmLEdBQW9ELEVBQXJELGNBQ08sVUFEUDtBQUVBO0FBRkEsK0ZBR3lGLE1BSHpGLHFIQUk0RixNQUo1RixjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUVNLFNBQVMseUJBQVQsQ0FBbUMsRUFBbkMsRUFBdUMsVUFBdkMsRUFBbUQsTUFBbkQsRUFBMkQsTUFBM0QsRUFBbUUsWUFBbkUsRUFBaUY7QUFDcEYsUUFBSSxhQUNBLENBQUMsZUFBZSxrQ0FBZixHQUFvRCxFQUFyRCxjQUNPLFVBRFAsb0hBR21HLE1BSG5HLDBIQUlpRyxNQUpqRyxjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUdNLFNBQVMs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QUpiLEVBSXFEO0FBQ3hELGVBQU87QUFDRiwwQkFBYztBQURaLFNBTEo7QUFRSCxnQkFBUSxDQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLEdBQW5CO0FBUkwsS0FBUDtBQVVIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dSYWRpdXNMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIC8vIFRPRE8gcGFkIHRoZSBzbWFsbCBjaXJjbGUgc28gdGhlIHRleHQgc3RhcnRzIGF0IHRoZSBzYW1lIFggcG9zaXRpb24gZm9yIGJvdGhcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6NnB4OyB3aWR0aDogNnB4OyBib3JkZXItcmFkaXVzOiAzcHhcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDIwcHg7IGJvcmRlci1yYWRpdXM6IDEwcHhcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+YDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcblxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDQwLDQwLDI1MClcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6M3B4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDIwLDIwLDQwKVwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD5gOyBcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2F0ZWdvcnlMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIGNvbG9yU3RvcHMsIGNsb3NlSGFuZGxlcikge1xuICAgIGxldCBsZWdlbmRIdG1sID0gXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nICtcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIGNvbG9yU3RvcHNcbiAgICAgICAgICAgIC5zb3J0KChzdG9wYSwgc3RvcGIpID0+IHN0b3BhWzBdLmxvY2FsZUNvbXBhcmUoc3RvcGJbMF0pKSAvLyBzb3J0IG9uIHZhbHVlc1xuICAgICAgICAgICAgLm1hcChzdG9wID0+IGA8c3BhbiBjbGFzcz1cImJveFwiIHN0eWxlPSdiYWNrZ3JvdW5kOiAke3N0b3BbMV19Jz48L3NwYW4+PGxhYmVsPiR7c3RvcFswXX08L2xhYmVsPjxici8+YClcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuaW1wb3J0ICogYXMgbGVnZW5kIGZyb20gJy4vbGVnZW5kJztcbi8qXG5XcmFwcyBhIE1hcGJveCBtYXAgd2l0aCBkYXRhIHZpcyBjYXBhYmlsaXRpZXMgbGlrZSBjaXJjbGUgc2l6ZSBhbmQgY29sb3IsIGFuZCBwb2x5Z29uIGhlaWdodC5cblxuc291cmNlRGF0YSBpcyBhbiBvYmplY3Qgd2l0aDpcbi0gZGF0YUlkXG4tIGxvY2F0aW9uQ29sdW1uXG4tIHRleHRDb2x1bW5zXG4tIG51bWVyaWNDb2x1bW5zXG4tIHJvd3Ncbi0gc2hhcGVcbi0gbWlucywgbWF4c1xuKi9cbmNvbnN0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxubGV0IHVuaXF1ZSA9IDA7XG5cbmV4cG9ydCBjbGFzcyBNYXBWaXMge1xuICAgIGNvbnN0cnVjdG9yKG1hcCwgc291cmNlRGF0YSwgZmlsdGVyLCBmZWF0dXJlSG92ZXJIb29rLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLnNvdXJjZURhdGEgPSBzb3VyY2VEYXRhO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICAgICAgdGhpcy5mZWF0dXJlSG92ZXJIb29rID0gZmVhdHVyZUhvdmVySG9vazsgLy8gZihwcm9wZXJ0aWVzLCBzb3VyY2VEYXRhKVxuICAgICAgICBvcHRpb25zID0gZGVmKG9wdGlvbnMsIHt9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgY2lyY2xlUmFkaXVzOiBkZWYob3B0aW9ucy5jaXJjbGVSYWRpdXMsIDEwKSxcbiAgICAgICAgICAgIGludmlzaWJsZTogb3B0aW9ucy5pbnZpc2libGUsIC8vIHdoZXRoZXIgdG8gY3JlYXRlIHdpdGggb3BhY2l0eSAwXG4gICAgICAgICAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sIC8vIE1hcGJveCBzeW1ib2wgcHJvcGVydGllcywgbWVhbmluZyB3ZSBzaG93IHN5bWJvbCBpbnN0ZWFkIG9mIGNpcmNsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vdGhpcy5vcHRpb25zLmludmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBUT0RPIHNob3VsZCBiZSBwYXNzZWQgYSBMZWdlbmQgb2JqZWN0IG9mIHNvbWUga2luZC5cblxuICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5sYXllcklkID0gc291cmNlRGF0YS5zaGFwZSArICctJyArIHNvdXJjZURhdGEuZGF0YUlkICsgJy0nICsgKHVuaXF1ZSsrKTtcbiAgICAgICAgdGhpcy5sYXllcklkSGlnaGxpZ2h0ID0gdGhpcy5sYXllcklkICsgJy1oaWdobGlnaHQnO1xuXG5cbiAgICAgICAgXG4gICAgICAgIC8vIENvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIGEgTWFwYm94IGRhdGFzb3VyY2VcbiAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHBvaW50RGF0YXNldFRvR2VvSlNPTih0aGlzLnNvdXJjZURhdGEpICk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHN5bWJvbExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMub3B0aW9ucy5zeW1ib2wsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIC8vIHRyeSB1c2luZyBhIGNpcmNsZSBoaWdobGlnaHQgZXZlbiBvbiBhbiBpY29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBcblxuICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gY29uc3RydWN0IGEgXCJwb2x5Z29uIGRhdGFzb3VyY2VcIiwgdGhlIGdlb21ldHJ5IGV4aXN0cyBpbiBNYXBib3ggYWxyZWFkeVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L0Vjb25vbXkvRW1wbG95bWVudC1ieS1ibG9jay1ieS1pbmR1c3RyeS9iMzZqLWtpeTRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYWRkIENMVUUgYmxvY2tzIHBvbHlnb24gZGF0YXNldCwgcmlwZSBmb3IgY2hvcm9wbGV0aGluZ1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHsgXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2ZWN0b3InLCBcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnbWFwYm94Oi8vb3BlbmNvdW5jaWxkYXRhLmFlZGZteXA4J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihwb2x5Z29uTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG5cblxuXG4gICAgXG4gICAgICAgIC8vIHN3aXRjaCB2aXN1YWxpc2F0aW9uIHRvIHVzaW5nIHRoaXMgY29sdW1uXG4gICAgICAgIHRoaXMuc2V0VmlzQ29sdW1uID0gZnVuY3Rpb24oY29sdW1uTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdUaGlzIGlzIGEgc3ltYm9sIGxheWVyLCB3ZSBpZ25vcmUgc2V0VmlzQ29sdW1uLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2x1bW5OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID0gc291cmNlRGF0YS50ZXh0Q29sdW1uc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IGNvbHVtbk5hbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRGF0YSBjb2x1bW46ICcgKyB0aGlzLmRhdGFDb2x1bW4pO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBwb2x5Z29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gYWRkIGNsb3NlIGJ1dHRvbiBiZWhhdmlvdXIuIG1heWJlP1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlRGF0YS50ZXh0Q29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gaGFuZGxlIGVudW0gZmllbGRzIG9uIHBvbHlnb25zIChubyBleGFtcGxlIGN1cnJlbnRseSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIGxldCBtaW5TaXplID0gMC4zICogdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgIGxldCBtYXhTaXplID0gdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcblxuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtcmFkaXVzJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgM10sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgbWluU2l6ZV0sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgbWF4U2l6ZV1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dSYWRpdXNMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgLy8gQ2FuJ3Qgc2FmZWx5IGNsb3NlIG51bWVyaWMgY29sdW1ucyB5ZXQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8zOTQ5XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVSYWRpdXMgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLXJhZGl1cycsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtbnVtZXJpYycpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIC8vIGZyb20gQ29sb3JCcmV3ZXJcbiAgICAgICAgICAgIGNvbnN0IGVudW1Db2xvcnMgPSBbJyMxZjc4YjQnLCcjZmI5YTk5JywnI2IyZGY4YScsJyMzM2EwMmMnLCcjZTMxYTFjJywnI2ZkYmY2ZicsJyNhNmNlZTMnLCAnI2ZmN2YwMCcsJyNjYWIyZDYnLCcjNmEzZDlhJywnI2ZmZmY5OScsJyNiMTU5MjgnXTtcblxuICAgICAgICAgICAgbGV0IGVudW1TdG9wcyA9IHRoaXMuc291cmNlRGF0YS5zb3J0ZWRGcmVxdWVuY2llc1tkYXRhQ29sdW1uXS5tYXAoKHZhbCxpKSA9PiBbdmFsLCBlbnVtQ29sb3JzW2ldXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBlbnVtU3RvcHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVE9ETyB0ZXN0IGNsb3NlIGhhbmRsZXIsIGN1cnJlbnRseSBub24gZnVuY3Rpb25hbCBkdWUgdG8gcG9pbnRlci1ldmVudHM6bm9uZSBpbiBDU1NcbiAgICAgICAgICAgIGxlZ2VuZC5zaG93Q2F0ZWdvcnlMZWdlbmQoJyNsZWdlbmQtZW51bScsIGRhdGFDb2x1bW4sIGVudW1TdG9wcywgdGhpcy5yZW1vdmVDaXJjbGVDb2xvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1jb2xvcicsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLWNvbG9yJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1lbnVtJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG4gICAgICAgIC8qXG4gICAgICAgICAgICBBcHBsaWVzIGEgc3R5bGUgdGhhdCByZXByZXNlbnRzIG51bWVyaWMgZGF0YSB2YWx1ZXMgYXMgaGVpZ2h0cyBvZiBleHRydWRlZCBwb2x5Z29ucy5cbiAgICAgICAgICAgIFRPRE86IGFkZCByZW1vdmVQb2x5Z29uSGVpZ2h0XG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnLCAge1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyLCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0IGluIHRoZSBwb2x5Z29uIHNldCwgaXQncyBqdXN0IGEgaHVnZSB2YWx1ZSBsb29rdXBcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJywvL2xvY2F0aW9uQ29sdW1uLCAvLyB0aGUgSUQgb24gdGhlIGFjdHVhbCBnZW9tZXRyeSBkYXRhc2V0XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMTAwMF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24tY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgICAgIC8vLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAncmdiKDAsMCwnICsgTWF0aC5yb3VuZCg0MCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMjAwKSArICcpJ10pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ2hzbCgzNDAsODglLCcgKyBNYXRoLnJvdW5kKDIwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiA1MCkgKyAnJSknXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZCwgWychaW4nLCAnYmxvY2tfaWQnLCAuLi4oLyogIyMjIFRPRE8gZ2VuZXJhbGlzZSAqLyBcbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3dbZGF0YUNvbHVtbl0gPT09IDApXG4gICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pKV0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgdGhpcy5zb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdXNlbW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgICAgICAgICAgdGhvdXNlLm1vdXNlbW92ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gVGhlIGFjdHVhbCBjb25zdHJ1Y3Rvci4uLlxuICAgICAgICBpZiAodGhpcy5zb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSAoZSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSB0aGlzLm1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZS5wb2ludCwgeyBsYXllcnM6IFt0aGlzLmxheWVySWRdfSlbMF07ICBcbiAgICAgICAgICAgICAgICBpZiAoZiAmJiBmICE9PSB0aGlzLmxhc3RGZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVIb3Zlckhvb2soZi5wcm9wZXJ0aWVzLCB0aGlzLnNvdXJjZURhdGEsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgZi5wcm9wZXJ0aWVzW3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1dKTsgLy8gd2UgZG9uJ3QgaGF2ZSBhbnkgb3RoZXIgcmVsaWFibGUga2V5P1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsICdibG9ja19pZCcsIGYucHJvcGVydGllcy5ibG9ja19pZF0pOyAvLyBkb24ndCBoYXZlIGEgZ2VuZXJhbCB3YXkgdG8gbWF0Y2ggb3RoZXIga2luZHMgb2YgcG9seWdvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZi5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICB9XG4gICAgICAgIFxuXG5cblxuICAgICAgICBcblxuICAgIH1cbn1cblxuLy8gY29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gR2VvSlNPTlxuZnVuY3Rpb24gcG9pbnREYXRhc2V0VG9HZW9KU09OKHNvdXJjZURhdGEpIHtcbiAgICBsZXQgZGF0YXNvdXJjZSA9IHtcbiAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc291cmNlRGF0YS5yb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pIHtcbiAgICAgICAgICAgICAgICBkYXRhc291cmNlLmRhdGEuZmVhdHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcm93LFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiByb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgLy8gSnVzdCBkb24ndCBwdXNoIGl0IFxuICAgICAgICAgICAgY29uc29sZS5sb2coYEJhZCBsb2NhdGlvbjogJHtyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl19YCk7ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YXNvdXJjZTtcbn07XG5cbmZ1bmN0aW9uIGNpcmNsZUxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBmaWx0ZXIsIGhpZ2hsaWdodCwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICBwYWludDoge1xuLy8gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ2hzbCgyMCwgOTUlLCA1MCUpJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAncmdiYSgwLDAsMCwwKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC45NSA6IDAsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS1jb2xvcic6IGhpZ2hsaWdodCA/ICd3aGl0ZScgOiAncmdiYSg1MCw1MCw1MCwwLjUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzoge1xuICAgICAgICAgICAgICAgIHN0b3BzOiBoaWdobGlnaHQgPyBbWzEwLDRdLCBbMTcsMTBdXSA6IFtbMTAsMl0sIFsxNyw1XV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzeW1ib2xMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgc3ltYm9sLCBmaWx0ZXIsIGhpZ2hsaWdodCwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkXG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuXG4gICAgcmV0LnBhaW50ID0gZGVmKHN5bWJvbC5wYWludCwge30pO1xuICAgIHJldC5wYWludFsnaWNvbi1vcGFjaXR5J10gPSAhaW52aXNpYmxlID8gMC45NSA6IDA7XG5cbiAgICAvL3JldC5sYXlvdXQgPSBkZWYoc3ltYm9sLmxheW91dCwge30pO1xuICAgIGlmIChzeW1ib2wubGF5b3V0KVxuICAgICAgICByZXQubGF5b3V0ID0gc3ltYm9sLmxheW91dDtcblxuICAgIHJldHVybiByZXQ7XG59XG5cblxuIGZ1bmN0aW9uIHBvbHlnb25MYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgaW52aXNpYmxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC44IDogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0JzogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnIzAwMydcbiAgICAgICAgIH0sXG4gICAgfTtcbn1cbiBmdW5jdGlvbiBwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQsIGxheWVySWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ3doaXRlJ1xuICAgICAgICB9LFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnYmxvY2tfaWQnLCAnLSddXG4gICAgfTtcbn1cblxuIl19