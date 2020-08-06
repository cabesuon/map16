var apiKey = 'PukIIGPERibDqcEgy4KWqaFMhfD4eeB0';

var serviceUrl = 'https://api.os.uk/maps/raster/v1/zxy';

require([
  'esri/views/MapView',
  'esri/Map',
  'esri/layers/FeatureLayer',
  'esri/widgets/Home',
  'esri/widgets/Legend',
  'esri/widgets/Expand',
  'esri/widgets/Fullscreen',
  'esri/widgets/Search',
  'esri/widgets/Measurement',
  'esri/widgets/TimeSlider',
  'esri/layers/WebTileLayer',
  'esri/popup/content/AttachmentsContent'
], function (
  MapView,
  Map,
  FeatureLayer,
  Home,
  Legend,
  Expand,
  Fullscreen,
  Search,
  Measurement,
  TimeSlider,
  WebTileLayer
) {
  /**
   * @type {Graphic[]}
   */
  let graphics = null;

  /**
   * @type {Graphic[]}
   */
  let sensorsGraphics = null;

  /**
   * @type {Graphic[]}
   */
  let gatewaysGraphics = null;

  /**
   * @type {number}
   */
  const selectedclusteringUntilZoom = 11;

  /**
   * @type {ClusterConfig}
   */
  const sensorsClusterConfig = {
    type: 'cluster',
    popupTemplate: {
      content: [
        {
          type: 'text',
          text: 'This cluster represents <b>{cluster_count}</b> sensors.'
        }
      ]
    }
  };

  /**
   * @type {ClusterConfig}
   */
  const gatewaysClusterConfig = {
    type: 'cluster',
    popupTemplate: {
      content: [
        {
          type: 'text',
          text: 'This cluster represents <b>{cluster_count}</b> gateways.'
        }
      ]
    }
  };

  /**
   * Returns the string format of Date.
   *
   * @param {Date} date - The date
   * @return {string} -The string format
   */
  function dateToString (date) {
    const m = date.getMonth() + 1 < 10
      ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const d = date.getDate() < 10
      ? `0${date.getDate()}` : `${date.getDate()}`;

    return `${m}/${d}/${date.getFullYear()}`;
  }

  /**
   * Returns the string format of Date.
   *
   * @param {Date} date - The date
   * @return {string} -The string format
   */
  function dateCompare (d1, d2) {
    // year
    if (d1.getFullYear() < d2.getFullYear()) {
      return -1;
    }
    if (d1.getFullYear() > d2.getFullYear()) {
      return 1;
    }
    // month
    if (d1.getMonth() < d2.getMonth()) {
      return -1;
    }
    if (d1.getMonth() > d2.getMonth()) {
      return 1;
    }
    // date
    if (d1.getDate() < d2.getDate()) {
      return -1;
    }
    if (d1.getDate() > d2.getDate()) {
      return 1;
    }
    return 0;
  }

  /**
   * Returns a safe value of a feature attribute value for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {string} -The table element in string format
   */
  function safeAttrValue (value) {
    return value || 'n/a';
  }

  /**
   * Returns a table with the feature attributes for PopupTemplate.
   *
   * @param {Array<{label:string, value:string}>} attrs - Label and values of feature attributes
   * @return {string} -The table element in string format
   */
  function popupTemplateContentAttrTable (attrs) {
    let content = '<table class="esri-widget__table"><tbody>';
    for (const attr of attrs) {
      content += `<tr><td>${safeAttrValue(attr.label)}</td><td>${safeAttrValue(attr.value)}</td></tr>`;
    }
    content += '</tbody></table>';
    return content;
  }

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function popupTemplateContent (feature) {
    const div = document.createElement('div');
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    let attrs = [];
    if (feature.graphic.layer === sensorsLayer) {
      attrs = [
        {
          value: feature.graphic.attributes.sensor_id,
          label: 'Sensor ID'
        },
        {
          value: feature.graphic.attributes.sensor_type,
          label: 'Type'
        },
        {
          value: feature.graphic.attributes.NODEREFERE,
          label: 'Node Ref'
        },
        {
          value: feature.graphic.attributes.install_name,
          label: 'Installed By'
        },
        {
          value: dateToString(
            new Date(feature.graphic.attributes.CreationDate)
          ),
          label: 'Date Instlled'
        }
      ];
    } else if (feature.graphic.layer === gatewaysLayer) {
      attrs = [

        {
          value: feature.graphic.attributes.gateway_id,
          label: 'Gateway ID'
        },
        {
          value: feature.graphic.attributes.asset_location,
          label: 'Gateway Location'
        },
        {
          value: feature.graphic.asset_location_other,
          label: 'Other Gateway Location'
        },
        {
          value: feature.graphic.attributes.gateway_installed,
          label: 'Gateway Installed'
        },
        {
          value: feature.graphic.attributes.rain_sensor_installed,
          label: 'Rain Sensor Installed'
        },
        {
          value: feature.graphic.attributes.install_name,
          label: 'Installed By'
        },
        {
          value: dateToString(
            new Date(feature.graphic.attributes.CreationDate)
          ),
          label: 'Date Installed'
        }

      ];
    }
    div.innerHTML = popupTemplateContentAttrTable(attrs);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const sensorsPopupTemplate = {
    title: '{sensor_id} - {sensor_type} - {POSTCODE}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    outFields: [
      'sensor_id',
      'sensor_type',
      'NODEREFERE',
      'install_name',
      'POSTCODE',
      'THOROUGHFARE',
      'TOWN',
      'DAM_AREA',
      'CreationDate'
    ]
  };

  /**
   * @type {WebTileLayer}
   */
  const tileLayer = new WebTileLayer({
    urlTemplate: serviceUrl + '/Light_3857/{level}/{col}/{row}.png?key=' + apiKey
  });

  /**
   * @type {FeatureLayer}
   */
  const Nodelayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_sensor_manholes_wgs_master_JS_view/FeatureServer/0'
  });

  /**
   * @type {FeatureLayer}
   */
  const Sewerlayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/saph_uu_gravity_sewers_all_master_wgs_JS_view/FeatureServer/0'
  });

  /**
   * @type {FeatureLayer}
   */
  const sensorsLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_sensor_install_view_v2/FeatureServer/0',
    featureReduction: sensorsClusterConfig,
    popupTemplate: sensorsPopupTemplate,
    outFields: [
      'sensor_id',
      'sensor_type',
      'NODEREFERE',
      'install_name',
      'POSTCODE',
      'THOROUGHFARE',
      'TOWN',
      'DAM_AREA',
      'CreationDate'
    ]
  });

  /**
   * @type {PopupTemplate}
   */
  const gatewaysPopupTemplate = {
    title: '{gateway_id} - {asset_location}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    outFields: [
      'gateway_id',
      'asset_location',
      'asset_location_other',
      'gateway_installed',
      'rain_sensor_installed',
      'install_name',
      'CreationDate'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const gatewaysLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_gateway_install_view/FeatureServer/0',
    featureReduction: gatewaysClusterConfig,
    popupTemplate: gatewaysPopupTemplate,
    outFields: [
      'gateway_id',
      'asset_location',
      'asset_location_other',
      'gateway_installed',
      'rain_sensor_install',
      'install_name',
      'CreationDate'
    ]
  });

  /**
   * @type {FeatureLayer}
   */
  const DAMlayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_dam_area_wgs_master_view/FeatureServer/0'
  });

  /**
   * @type {FeatureLayer}
   */
  const IDASlayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sap_uu_all_idas_areas_wgs_master_view/FeatureServer/0'
  });

  /**
   * @type {Map}
   */
  const map = new Map({
    layers: [
      tileLayer,
      Nodelayer,
      Sewerlayer,
      DAMlayer,
      IDASlayer,
      sensorsLayer,
      gatewaysLayer
    ]
  });

  /**
   * @type {MapView}
   */
  const view = new MapView({
    map: map,
    container: 'viewDiv',
    center: [-3.333679, 53.982117],
    zoom: 7,
    constraints: {
      minZoom: 6,
      maxZoom: 22,
      rotationEnabled: false
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false
      }
    }
  });

  /**
   * @type {Measurement}
   */
  const measurement = new Measurement({
    view: view,
    expanded: false
  });

  /**
   * @type {TimeSlider}
   */
  const timeSlider = new TimeSlider({
    container: 'timeSlider'
  });

  /**
   * Returns the time extent of a feature layer.
   *
   * @param {FeatureLayer} layer - The layer
   * @param {string} fieldName - The name of the date field
   * @return {Promise} - A promise for one feature with date attributes 'min' and 'max'
   */
  function featureLayerFullTimeExtent (layer, fieldName) {
    const query = layer.createQuery();
    query.outStatistics = [
      {
        statisticType: 'MIN',
        onStatisticField: fieldName,
        outStatisticFieldName: 'min'
      },
      {
        statisticType: 'MAX',
        onStatisticField: fieldName,
        outStatisticFieldName: 'max'
      }
    ];
    return layer.queryFeatures(query);
  }

  /**
   * Extend the time extent of the time slider.
   *
   * @param {Date} start - The start of the extent
   * @param {Date} end - The end of the extent
   */
  function timeSliderFullTimeExtentExtend (start, end) {
    if (!timeSlider.fullTimeExtent) {
      timeSlider.fullTimeExtent = {
        start: startDate(start),
        end: endDate(end)
      };
    } else {
      if (dateCompare(start, timeSlider.fullTimeExtent.start) === 1) {
        timeSlider.fullTimeExtent.start = startDate(start);
      }
      if (dateCompare(end, timeSlider.fullTimeExtent.end) === -1) {
        timeSlider.fullTimeExtent.end = endDate(end);
      }
    }
    timeSlider.values = [
      timeSlider.fullTimeExtent.start,
      timeSlider.fullTimeExtent.end
    ];
    timeSlider.stops = {
      interval: {
        value: 1,
        unit: 'days'
      }
    };
  }

  /**
   * Helper function to norm date
   */
  function startDate (d) {
    const d2 = new Date(d);
    return new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  }

  /**
   * Helper function to norm date
   */
  function endDate (d) {
    const d2 = startDate(d);
    d2.setHours(23, 59, 59);
    return d2;
  }

  /**
   * Helper function for time slider time extent and values initialization
   */
  function timeSliderTimeExtentInit () {
    featureLayerFullTimeExtent(sensorsLayer, 'CreationDate')
      .then(function (response) {
        if (!response.features) {
          return;
        }
        timeSliderFullTimeExtentExtend(
          new Date(response.features[0].attributes.min),
          new Date(response.features[0].attributes.max)
        );
      });
    featureLayerFullTimeExtent(gatewaysLayer, 'CreationDate')
      .then(function (response) {
        if (!response.features) {
          return;
        }
        timeSliderFullTimeExtentExtend(
          new Date(response.features[0].attributes.min),
          new Date(response.features[0].attributes.max)
        );
      });
  }
  timeSliderTimeExtentInit();

  // ui

  view.ui.add(
    new Home({
      view: view
    }),
    'top-left'
  );

  view.ui.add(
    new Expand({
      expandTooltip: 'Show Legend',
      expanded: false,
      autoCollapse: true,
      view: view,
      content: new Legend({ view: view })
    }),
    'top-left'
  );

  view.ui.add(
    new Expand({
      expandTooltip: 'Show Search',
      expanded: false,
      autoCollapse: true,
      view: view,
      content: new Search({
        view: view,
        sources: [
          {
            layer: sensorsLayer,
            searchFields: ['THOROUGHFARE'],
            displayField: 'THOROUGHFARE',
            exactMatch: false,
            outFields: ['*'],
            name: 'Sensors',
            placeholder: 'Search Road',
            maxResults: 6,
            maxSuggestions: 6,
            suggestionsEnabled: true,
            minSuggestCharacters: 0
          }
        ],
        includeDefaultSources: true,
        locationEnabled: false,
        searchAllEnabled: true
      })
    }),
    'top-left'
  );

  view.ui.add(
    new Fullscreen({
      view: view,
      element: document.getElementById('applicationDiv')
    }),
    'top-right'
  );

  view.ui.add(
    new Expand({
      expandTooltip: 'Show Measure',
      view: view,
      content: document.getElementById('measureDiv'),
      expandIconClass: 'esri-icon-measure',
      expanded: false,
      autoCollapse: true
    }),
    'top-left'
  );

  view.ui.add(
    measurement,
    'bottom-right'
  );

  view.ui.add(
    new Expand({
      view: view,
      expandTooltip: 'Show TimeSlider',
      content: timeSlider.domNode,
      expandIconClass: 'esri-icon-filter',
      expanded: false,
      autoCollapse: true
    }),
    'top-left'
  );

  // list

  /**
   * @type {HTMLUListElement}
   */
  const listNode = document.getElementById('listGraphics');

  /**
   * Compare two levels.
   *
   * @param {string} a - Level a
   * @param {string} b - Level b
   * @return {number} -1 if a < b, 0 if a = b, 1 if a > b
   */
  // function compareLevels (a, b) {
  //   if (!a) {
  //     return -1;
  //   }
  //   if (!b) {
  //     return 1;
  //   }
  //   if (a === '4G') {
  //     return -1;
  //   }
  //   if (b === '4G') {
  //     return 1;
  //   }
  //   if (a === 'LoRaWAN') {
  //     return -1;
  //   }
  //   if (b === 'LoRaWAN') {
  //     return 1;
  //   }

  //   return 0;
  // }

  /**
   * Compare two features.
   *
   * @param {Feature} a - Feature a
   * @param {Feature} b - Feature b
   * @return {number} -1 if a < b, 0 if a = b, 1 if a > b
   */
  // function sensorsCompareFeatures (a, b) {
  //   return -1 * compareLevels(
  //     a.attributes.sensor_type,
  //     b.attributes.sensor_type
  //   );
  // }

  /**
   * Create and return a listNode item.
   *
   * @param {number} id - Data result id
   * @param {string} content - Content text
   * @param {string} level - Level {'High'|'Medium'|'Low'}
   * @return {HTMLLIElement} The <li> element
   */
  function listNodeCreateItem (id, content, layer) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
    if (layer === sensorsLayer) {
      li.classList.add('gradient-45deg-purple-deep-purple');
    } else if (layer === gatewaysLayer) {
      li.classList.add('gradient-45deg-indigo-light-blue');
    } else {
      li.classList.add('gradient-45deg-light-grey-grey');
    }
    return li;
  };

  /**
   * Create and return content for listNode item.
   *
   * @param {Graphic} feature - The feature
   * @return {string} The content
   */
  function listNodeCreateItemContent (feature) {
    if (feature.layer === sensorsLayer) {
      return safeAttrValue(feature.attributes.sensor_type) +
        ' | ' +
        safeAttrValue(feature.attributes.POSTCODE) +
        ' | ' +
        safeAttrValue(feature.attributes.THOROUGHFARE) +
        ' | ' +
        safeAttrValue(dateToString(new Date(feature.attributes.CreationDate)));
    } else if (feature.layer === gatewaysLayer) {
      return safeAttrValue(feature.attributes.gateway_id) +
        ' | ' +
        safeAttrValue(feature.asset_location) +
        ' | ' +
        safeAttrValue(dateToString(new Date(feature.attributes.CreationDate)));
    }
    return 'no layer';
  };

  /**
   * Update UI with the number of features of layer in current map view.
   *
   * @param {FeatureLayer} layer - The layer
   * @param {number} value - The features number
   */
  function updateLiveMapNumber (layer, value) {
    let id = '';
    switch (layer) {
      case sensorsLayer:
        id = 'sensorsMapNumberSpan';
        break;
      case gatewaysLayer:
        id = 'gatewaysMapNumberSpan';
        break;
    }
    document.getElementById(id).innerText = value;
  }

  /**
   * Clear and build listNode.
   */
  function listNodeReset () {
    graphics = [];
    let count = 0;
    if (sensorsLayer.visible && sensorsGraphics) {
      // sensorsGraphics.sort(sensorsCompareFeatures);
      graphics = graphics.concat(sensorsGraphics);
      count = sensorsGraphics.length;
    }
    updateLiveMapNumber(sensorsLayer, count);
    count = 0;
    if (gatewaysLayer.visible && gatewaysGraphics) {
      graphics = graphics.concat(gatewaysGraphics);
      count = gatewaysGraphics.length;
    }
    updateLiveMapNumber(gatewaysLayer, count);
    const fragment = document.createDocumentFragment();
    graphics.forEach(function (feature, index) {
      fragment.appendChild(
        listNodeCreateItem(
          index,
          listNodeCreateItemContent(feature),
          feature.layer
        )
      );
    });
    listNode.innerHTML = '';
    listNode.appendChild(fragment);
  };

  view.whenLayerView(sensorsLayer).then(function (layerView) {
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['CreationDate']
          })
          .then(function (results) {
            sensorsGraphics = results.features;
            listNodeReset();
          })
          .catch(function (error) {
            console.error('query failed: ', error);
          });
      }
    });
  });

  view.whenLayerView(gatewaysLayer).then(function (layerView) {
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['CreationDate']
          })
          .then(function (results) {
            gatewaysGraphics = results.features;
            listNodeReset();
          })
          .catch(function (error) {
            console.error('query failed: ', error);
          });
      }
    });
  });

  /**
   * Click event handler for listNode.
   *
   * @param {MouseEvent} event
   */
  function listNodeClickHandler (event) {
    const target = event.target;
    const resultId = target.getAttribute('data-result-id');
    const result =
      resultId && graphics && graphics[parseInt(resultId, 10)];
    if (result) {
      view
        .goTo({
          center: [result.geometry.longitude, result.geometry.latitude],
          zoom: view.zoom + 4
        })
        .then(function () {
          view.popup.open({
            features: [result],
            location: result.geometry.centroid
          });
        })
        .catch(function (error) {
          if (error.sensor_type !== 'AbortError') {
            console.error(error);
          }
        });
    }
  };

  listNode.addEventListener('click', listNodeClickHandler);

  // layers visibility

  /**
   * @type {HTMLButtonElement}
   */
  const toggleSensorsBtn = document.getElementById('toggleSensorsBtn');
  if (sensorsLayer.visible) {
    toggleSensorsBtn.classList.add('active');
  } else {
    toggleSensorsBtn.classList.remove('active');
  }
  /**
   * @type {HTMLButtonElement}
   */
  const toggleGatewaysBtn = document.getElementById('toggleGatewaysBtn');
  if (sensorsLayer.visible) {
    toggleGatewaysBtn.classList.add('active');
  } else {
    toggleGatewaysBtn.classList.remove('active');
  }
  /**
   * Toggle sensors layer visibility
   */
  function toggleSensorsVisibility () {
    sensorsLayer.visible = !sensorsLayer.visible;
    if (sensorsLayer.visible) {
      toggleSensorsBtn.classList.add('active');
    } else {
      toggleSensorsBtn.classList.remove('active');
    }
    listNodeReset();
  }

  /**
   * Toggle gateways layer visibility
   */
  function toggleGatewaysVisibility () {
    gatewaysLayer.visible = !gatewaysLayer.visible;
    if (gatewaysLayer.visible) {
      toggleGatewaysBtn.classList.add('active');
    } else {
      toggleGatewaysBtn.classList.remove('active');
    }
    listNodeReset();
  }

  toggleSensorsBtn.addEventListener('click', toggleSensorsVisibility);
  toggleGatewaysBtn.addEventListener('click', toggleGatewaysVisibility);

  /**
   * Click event handler for sources.
   *
   * @param {MouseEvent} event
   */
  function sourcesElementClickHandler (event) {
    const selectedSource = event.currentTarget.getAttribute('data-source');
    if (selectedSource === 'Sensors') {
      toggleSensorsVisibility();
    } else if (selectedSource === 'Gateways') {
      toggleGatewaysVisibility();
    }
    listNodeReset();
    event.stopPropagation();
  };

  document.querySelectorAll('div[data-source]').forEach(
    node => node.addEventListener('click', sourcesElementClickHandler)
  );

  // filter

  function extractBetween (efield, esource, a, b) {
    return `EXTRACT(${efield} FROM ${esource}) BETWEEN ${a} AND ${b}`;
  }

  /**
   * Update the filter of the layers.
   */
  function layerViewFilterUpdate () {
    const filter = {
      where:
        extractBetween(
          'YEAR',
          'CreationDate',
          timeSlider.timeExtent.start.getFullYear(),
          timeSlider.timeExtent.end.getFullYear()
        ) +
        ' AND ' +
        extractBetween(
          'MONTH',
          'CreationDate',
          timeSlider.timeExtent.start.getMonth() + 1,
          timeSlider.timeExtent.end.getMonth() + 1
        ) +
        ' AND ' +
        extractBetween(
          'DAY',
          'CreationDate',
          timeSlider.timeExtent.start.getDate(),
          timeSlider.timeExtent.end.getDate()
        )
    };
    if (sensorsLayer) {
      sensorsLayer.definitionExpression = filter.where;
    }
    if (gatewaysLayer) {
      gatewaysLayer.definitionExpression = filter.where;
    }
    listNodeReset();
  }

  timeSlider.watch('timeExtent', layerViewFilterUpdate);

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler (newValue) {
    sensorsLayer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : sensorsClusterConfig;
    gatewaysLayer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : gatewaysClusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);

  // measure

  /**
   * @type {HTMLButtonElement}
   */
  const measureDistanceBtn = document.getElementById('measureDistanceBtn');

  /**
   * @type {HTMLButtonElement}
   */
  const measureAreaBtn = document.getElementById('measureAreaBtn');

  /**
   * @type {HTMLButtonElement}
   */
  const measureClearBtn = document.getElementById('measureClearBtn');

  /**
   * Activate distance measurement
   */
  function distanceMeasurement () {
    measurement.activeTool = 'distance';
    measureDistanceBtn.classList.add('active');
    measureAreaBtn.classList.remove('active');
  }

  /**
   * Activate area measurement
   */
  function areaMeasurement () {
    measurement.activeTool = 'area';
    measureDistanceBtn.classList.remove('active');
    measureAreaBtn.classList.add('active');
  }

  /**
   * Clear measurements
   */
  function clearMeasurements () {
    measureDistanceBtn.classList.remove('active');
    measureAreaBtn.classList.remove('active');
    measurement.clear();
  }

  measureDistanceBtn.addEventListener('click', function () {
    distanceMeasurement();
  });
  measureAreaBtn.addEventListener('click', function () {
    areaMeasurement();
  });
  measureClearBtn.addEventListener('click', function () {
    clearMeasurements();
  });
});
