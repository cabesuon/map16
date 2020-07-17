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
  'esri/widgets/TimeSlider'
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
  TimeSlider
) {
  /**
   * @type {Date}
   */
  let selectedFilterDateStart = null;
  
  /**
   * @type {Date}
   */
  let selectedFilterDateEnd = null;

  /**
   * @type {LayerView}
   */
  let sensorsLayerView = null;

  /**
   * @type {LayerView}
   */
  let gatewaysLayerView = null;

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
  let selectedclusteringUntilZoom = 11;

  /**
   * @type {ClusterConfig}
   */
  const sensorsClusterConfig = {
    type: 'cluster',
    popupTemplate: {
      content: [
        {
          type: 'text',
          text: 'This cluster represents <b>{cluster_count}</b> features.'
        },
        {
          type: 'text',
          text:
            'Predominant sensor type in this cluster is <b>{cluster_type_sensor_type_label}</b>.'
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
          text: 'This cluster represents <b>{cluster_count}</b> features.'
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
  function dateToString(date) {
    const m = date.getMonth() + 1 < 10 ?
    `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const d = date.getDate() < 10 ?
    `0${date.getDate()}` : `${date.getDate()}`;
    
    return `${m}/${d}/${date.getFullYear()}`;
  }

  /**
   * Returns the string format of Date.
   *
   * @param {Date} date - The date
   * @return {string} -The string format
   */
  function dateCompare(d1, d2) {
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
  function safeAttrValue(value) {
    return value ? value : 'n/a';
  }

  /**
   * Returns a table with the feature attributes for PopupTemplate.
   *
   * @param {Array<{label:string, value:string}>} attrs - Label and values of feature attributes
   * @return {string} -The table element in string format
   */
  function popupTemplateContentAttrTable(attrs) {
    let content = `<table class="esri-widget__table"><tbody>`;
    for(const attr of attrs) {
      content += `<tr><td>${safeAttrValue(attr.label)}</td><td>${safeAttrValue(attr.value)}</td></tr>`
    }
    content += `</tbody></table>`;
    return content;
  }

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function popupTemplateContent(feature) {
    const div = document.createElement('div');
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    let attrs = [];
    if (feature.graphic.layer === sensorsLayer) {
      attrs = [
        {
          value: feature.graphic.attributes.sensor_type_label,
          label: 'Type'
        },
        {
          value: feature.graphic.attributes.NODEREFERE,
          label: 'Node Ref'
        },
        {
          value: feature.graphic.attributes.POSTCODE,
          label: 'Postcode'
        },
        {
          value: feature.graphic.attributes.THOROUGHFARE,
          label: 'Road'
        },
        {
          value: feature.graphic.attributes.TOWN,
          label: 'Town'
        },
        {
          value: feature.graphic.attributes.DAM_AREA,
          label: 'DAM Area'
        },
        {
          value: dateToString(
            normDate(feature.graphic.attributes.CreationDate)
          ),
          label: 'Creation Date'
        }
      ];
    } else if (feature.graphic.layer === gatewaysLayer) {
      attrs = [
        {
          value: feature.graphic.attributes.survey_id,
          label: 'Survey ID'
        },
        {
          value: feature.graphic.attributes.uu_building,
          label: 'UU Building Available?'
        },
        {
          value: feature.graphic.attributes.power_source,
          label: 'Power Source Available?'
        },
        {
          value: feature.graphic.attributes.socket_type,
          label: 'Socket Type'
        },
        {
          value: dateToString(
            normDate(feature.graphic.attributes.CreationDate)
          ),
          label: 'Creation Date'
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
    title: '{sensor_type_label} - {POSTCODE}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    outFields: [
      'sensor_type_label',
      'NODEREFERE',
      'POSTCODE',
      'THOROUGHFARE',
      'TOWN',
      'DAM_AREA',
      'CreationDate'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const sensorsLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_sensor_pre_install_wgs_master/FeatureServer/0',
    featureReduction: sensorsClusterConfig,
    popupTemplate: sensorsPopupTemplate,
    outFields: [
      'sensor_type_label',
      'NODEREFERE',
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
    title: '{ObjectId}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    outFields: [
      'ObjectId',
      'survey_id',
      'uu_building',
      'power_source',
      'socket_type',
      'CreationDate'
    ]
  };
  
  /**
   * @type {FeatureLayer}
   */
  const gatewaysLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_gateway_pre_install_surveys_view/FeatureServer/0',
    featureReduction: gatewaysClusterConfig,
    popupTemplate: gatewaysPopupTemplate,
    outFields: [
      'ObjectId',
      'survey_id',
      'uu_building',
      'power_source',
      'socket_type',
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
    basemap: 'gray-vector',
    layers: [DAMlayer, IDASlayer, sensorsLayer, gatewaysLayer]
  });

  /**
   * @type {MapView}
   */
  const view = new MapView({
    map: map,
    container: 'viewDiv',
    center: [-2.66042, 54.001848],
    zoom: 6.5,
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
  function featureLayerFullTimeExtent(layer, fieldName) {
    const query = layer.createQuery();
    query.outStatistics = [
      {
        statisticType:'MIN',
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
  function timeSliderFullTimeExtentExtend(start, end) {
    if (!timeSlider.fullTimeExtent) {
      timeSlider.fullTimeExtent = { start, end };
    } else {
      if (dateCompare(start, timeSlider.fullTimeExtent.start) === 1) {
        timeSlider.fullTimeExtent.start = start;
      }
      if (dateCompare(end, timeSlider.fullTimeExtent.end) === -1) {
        timeSlider.fullTimeExtent.end = end;
      }
    }
    // timeSlider.stops = {
    //   interval: {
    //     value: 1,
    //     unit: 'days'
    //   },
    //   timeExtent: {
    //     start: timeSlider.fullTimeExtent.start,
    //     end: timeSlider.fullTimeExtent.end
    //   }
    // };
    timeSlider.values = [
      timeSlider.fullTimeExtent.start,
      timeSlider.fullTimeExtent.end
    ];
  }

  /**
   * Helper function to norm date
   */
  function normDate(d) {
    return new Date(d);
  }

  /**
   * Helper function for time slider time extent and values initialization
   */
  function timeSliderTimeExtentInit() {
    featureLayerFullTimeExtent(sensorsLayer, 'CreationDate')
    .then(function(response) {
      if (!response.features) {
        return;
      }
      timeSliderFullTimeExtentExtend(
        normDate(response.features[0].attributes.min),
        normDate(response.features[0].attributes.max)
      )
    });
    featureLayerFullTimeExtent(gatewaysLayer, 'CreationDate')
    .then(function(response) {
      if (!response.features) {
        return;
      }
      timeSliderFullTimeExtentExtend(
        normDate(response.features[0].attributes.min),
        normDate(response.features[0].attributes.max)
      )
    });
  }
  timeSliderTimeExtentInit();

  // ui

  view.ui.add(new Home({
    view: view
  }),
    'top-left'
  );

  view.ui.add(new Expand({
    expandTooltip: 'Show Legend',
    expanded: false,
    view: view,
    content: new Legend({ view: view })
  }),
    'top-left'
  );

  view.ui.add(
    new Expand({
      expandTooltip: 'Show Search',
      expanded: false,
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
        includeDefaultSources: false,
        locationEnabled: false,
        searchAllEnabled: false
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
      expanded: false
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
      expanded: false
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
  function compareLevels(a, b) {
    if (!a) {
      return -1;
    }
    if (!b) {
      return 1;
    }
    if (a === '4G') {
      return -1;
    }
    if (b === '4G') {
      return 1;
    }
    if (a === 'LoRaWAN') {
      return -1;
    }
    if (b === 'LoRaWAN') {
      return 1;
    }

    return 0;
  }

  /**
   * Compare two features.
   *
   * @param {Feature} a - Feature a
   * @param {Feature} b - Feature b
   * @return {number} -1 if a < b, 0 if a = b, 1 if a > b
   */
  function sensorsCompareFeatures(a, b) {
    return -1 * compareLevels(
      a.attributes.sensor_type_label,
      b.attributes.sensor_type_label
    );
  }

  /**
   * Create and return a listNode item.
   *
   * @param {number} id - Data result id
   * @param {string} content - Content text
   * @param {string} level - Level {'High'|'Medium'|'Low'}
   * @return {HTMLLIElement} The <li> element
   */
  function listNodeCreateItem(id, content, layer) {
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
  function listNodeCreateItemContent(feature) {
    if (feature.layer === sensorsLayer) {
      return safeAttrValue(feature.attributes.sensor_type_label)
        + ' | '
        + safeAttrValue(feature.attributes.POSTCODE)
        + ' | ' 
        + safeAttrValue(feature.attributes.THOROUGHFARE)
        + ' | ' 
        + safeAttrValue(dateToString(normDate(feature.attributes.CreationDate)));
    } else if (feature.layer === gatewaysLayer) {
      return safeAttrValue(feature.attributes.survey_id)
        + ' | '
        + safeAttrValue(feature.attributes.power_source)
        + ' | ' 
        + safeAttrValue(feature.attributes.socket_type)
        + ' | ' 
        + safeAttrValue(dateToString(normDate(feature.attributes.CreationDate)));
    }
    return 'no layer';
  };

  /**
   * Update UI with the number of features of layer in current map view.
   *
   * @param {FeatureLayer} layer - The layer
   * @param {number} value - The features number
   */
  function updateLiveMapNumber(layer, value) {
    let id = '';
    switch(layer) {
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
  function listNodeReset() {
    graphics = [];
    if (sensorsLayer.visible && sensorsGraphics) {
      sensorsGraphics.sort(sensorsCompareFeatures);
      graphics = graphics.concat(sensorsGraphics);
      updateLiveMapNumber(sensorsLayer, sensorsGraphics.length);
    }
    if (gatewaysLayer.visible && gatewaysGraphics) {
      graphics = graphics.concat(gatewaysGraphics);
      updateLiveMapNumber(gatewaysLayer, gatewaysGraphics.length);
    }

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
    sensorsLayerView = layerView;

    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['sensor_type_label']
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
    gatewaysLayerView = layerView;

    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true
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
  function listNodeClickHandler(event) {
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
          if (error.sensor_type_label !== 'AbortError') {
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
  function toggleSensorsVisibility() {
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
  function toggleGatewaysVisibility() {
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
   * Click event handler for seasonsElement.
   *
   * @param {MouseEvent} event
   */
  function sourcesElementClickHandler(event) {
    selectedSource = event.currentTarget.getAttribute('data-source');
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

  function extractBetween(efield, esource, a, b) {
    return `EXTRACT(${efield} FROM ${esource}) BETWEEN ${a} AND ${b}`;
  }

  /**
   * Update the filter of the layers.
   */
  function layerViewFilterUpdate() {
    const filter = {
      where:
      extractBetween(
        'YEAR',
        'CreationDate',
        timeSlider.timeExtent.start.getFullYear(),
        timeSlider.timeExtent.end.getFullYear()
      )
      + ' AND '
      + extractBetween(
        'MONTH',
        'CreationDate',
        timeSlider.timeExtent.start.getMonth() + 1,
        timeSlider.timeExtent.end.getMonth() + 1
      )
      + ' AND '
      + extractBetween(
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
  
  timeSlider.watch("timeExtent", layerViewFilterUpdate);

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler(newValue) {
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
  function distanceMeasurement() {
    measurement.activeTool = 'distance';
    measureDistanceBtn.classList.add('active');
    measureAreaBtn.classList.remove('active');
  }

  /**
   * Activate area measurement
   */
  function areaMeasurement() {
    measurement.activeTool = 'area';
    measureDistanceBtn.classList.remove('active');
    measureAreaBtn.classList.add('active');
  }

  /**
   * Clear measurements
   */
  function clearMeasurements() {
    measureDistanceBtn.classList.remove('active');
    measureAreaBtn.classList.remove('active');
    measurement.clear();
  }

  measureDistanceBtn.addEventListener('click', function() {
    distanceMeasurement();
  });
  measureAreaBtn.addEventListener('click', function() {
  areaMeasurement();
  });
  measureClearBtn.addEventListener('click', function() {
    clearMeasurements();
  });

});
