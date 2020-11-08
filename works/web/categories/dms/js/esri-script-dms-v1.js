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
  'esri/layers/WebTileLayer'
], function (MapView, Map, FeatureLayer, Home, Legend, Expand, Fullscreen, Search, WebTileLayer) {
  /**
   * @type {string}
   */
  let selectedSensorFilterField = null;

  /**
   * @type {string}
   */
  let selectedSensorFilterValue = null;

  /**
   * @type {LayerView}
   */
  let floodLayerView = null;

  /**
   * @type {Graphic[]}
   */
  let graphics = null;

  /**
   * @type {number}
   */
  const selectedclusteringUntilZoom = 11;

  /**
   * @type {ClusterConfig}
   */
  const clusterConfig = {
    type: 'cluster',
    popupTemplate: {
      content: [
        {
          type: 'text',
          text: 'This cluster represents <b>{cluster_count}</b> sensors.'
        },
        {
          type: 'text',
          text:
          'Predominant warning level of these sensors is <b>{cluster_type_ALERT_LEVEL}</b>.'
        }
      ]
    },
    clusterMinSize: '24px',
    clusterMaxSize: '60px',
    labelingInfo: [{
      // turn off deconfliction to ensure all clusters are labeled
      deconflictionStrategy: 'none',
      labelExpressionInfo: {
        expression: "Text($feature.cluster_count, '#,###')"
      },
      symbol: {
        type: 'text',
        color: '#474747',
        font: {
          // weight: 'bold',
          family: 'Noto Sans',
          size: '12px'
        }
      },
      labelPlacement: 'center-center'
    }]
  };

  /**
   * Returns an anchor with the feature sensor url for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {string} -The anchor element in string format
   */
  function popupTemplateContentSensorAnchor (value) {
    if (value) {
      return '<a class="btn btn-bordered btn-cons btn-primary full-width m-b-20" ' +
        `href=${value} target="_blank"><i class="fa fa-wifi"></i>  Sensor Analytics</a>`;
    }
    return '';
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
   * @param {Feature} feature - Feature
   * @return {string} -The table element in string format
   */
  function popupTemplateContentAttrTable (attrs) {
    return '<table class="esri-widget__table"><tbody>' +
    `<tr><td>Status</td><td>${safeAttrValue(attrs.STATUS)}</td></tr>` +
    `<tr><td>Sensor ID</td><td>${safeAttrValue(attrs.DEVICE_ID)}</td></tr>` +
    `<tr><td>Gateway ID</td><td>${safeAttrValue(attrs.GATEWAY_ID)}</td></tr>` +
    `<tr><td>Alert Level</td><td>${safeAttrValue(attrs.ALERT_LEVEL)}</td></tr>` +
    `<tr><td>Mount Level Status</td><td>${safeAttrValue(attrs.LEVEL_STATUS)}</td></tr>` +
    `<tr><td>Level Status</td><td>${safeAttrValue(attrs.BENCHING_STATUS)}</td></tr>` +
    `<tr><td>Level Reading</td><td>${safeAttrValue(attrs.LEVEL_READING)}</td></tr>` +
    `<tr><td>% Water Level</td><td>${safeAttrValue(attrs.PERCENT_WATER_LEVEL)}</td></tr>` +
    `<tr><td>Water Level (mm)</td><td>${safeAttrValue(attrs.WATER_LEVEL)}</td></tr>` +
    `<tr><td>Manhole Ref</td><td>${safeAttrValue(attrs.MANHOLE_REF)}</td></tr>` +
    `<tr><td>DAM Area</td><td>${safeAttrValue(attrs.DAM_AREA)}</td></tr>` +
    `<tr><td>Postcode</td><td>${safeAttrValue(attrs.POSTCODE)}</td></tr>` +
    `<tr><td>Road</td><td>${safeAttrValue(attrs.ROAD)}</td></tr>` +
    `<tr><td>Town</td><td>${safeAttrValue(attrs.TOWN)}</td></tr>` +
    '</tbody></table>';
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
    const attrs = feature.graphic.attributes;
    div.innerHTML = popupTemplateContentSensorAnchor(attrs.ANALYTICS_URL) +
    popupTemplateContentAttrTable(attrs);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const popupTemplate = {
    title: '{STATUS} - {POSTCODE} - {TOWN}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    fieldInfos: [
      {
        fieldName: 'ANALYTICS_URL'
      },
      {
        fieldName: 'STATUS'
      },
      {
        fieldName: 'DEVICE_ID'
      },
      {
        fieldName: 'GATEWAY_ID'
      },
      {
        fieldName: 'ALERT_LEVEL'
      },
      {
        fieldName: 'LEVEL_STATUS'
      },
      {
        fieldName: 'BENCHING_STATUS'
      },
      {
        fieldName: 'LEVEL_READING'
      },
      {
        fieldName: 'PERCENT_WATER_LEVEL'
      },
      {
        fieldName: 'WATER_LEVEL'
      },
      {
        fieldName: 'MANHOLE_REF'
      },
      {
        fieldName: 'DAM_AREA'
      },
      {
        fieldName: 'POSTCODE'
      },
      {
        fieldName: 'ROAD'
      },
      {
        fieldName: 'TOWN'
      },
      {
        fieldName: 'alert_level'
      }
    ],
    outFields: [
      'ALERT_LEVEL', 'STATUS', 'DAM_AREA', 'POSTCODE', 'ROAD', 'MANHOLE_REF', 'DEVICE_ID', 'GATEWAY_ID', 'ALERT_LEVEL', 'LEVEL_STATUS', 'BENCHING_STATUS', 'LEVEL_READING', 'ANALYTICS_URL', 'TOWN', 'PERCENT_WATER_LEVEL', 'WATER_LEVEL'
    ]
  };

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
  const GravitySewerlayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_master_linear_data_wgs_v2_view_JS/FeatureServer/1',
    renderer: {
      type: 'simple', // autocasts as UniqueValueRenderer
      symbol: {
        type: 'cim', // autocasts as CIMSymbol
        data: {
          type: 'CIMSymbolReference',
          symbol: {
            type: 'CIMLineSymbol',
            symbolLayers: [
              {
                // black 1px line symbol
                type: 'CIMSolidStroke',
                enable: 'true',
                width: 1,
                color: [0, 0, 0, 255]
              },
              {
                // arrow symbol
                type: 'CIMVectorMarker',
                enable: true,
                size: 5,
                markerPlacement: {
                  type: 'CIMMarkerPlacementAlongLineSameSize', // places same size markers along the line
                  angleToLine: true,
                  endings: 'WithFullGap',
                  offsetAlongLine: 20, // determines space between each arrow
                  placementTemplate: [30]
                },
                frame: {
                  xmin: -5,
                  ymin: -5,
                  xmax: 5,
                  ymax: 5
                },
                markerGraphics: [
                  {
                    type: 'CIMMarkerGraphic',
                    geometry: {
                      rings: [
                        [
                          [-8, -5.47],
                          [-8, 5.6],
                          [1.96, -0.03],
                          [-8, -5.47]
                        ]
                      ]
                    },
                    symbol: {
                      // black fill for the arrow symbol
                      type: 'CIMPolygonSymbol',
                      symbolLayers: [
                        {
                          type: 'CIMSolidFill',
                          enable: true,
                          color: [0, 0, 0, 255]
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
  });

  /**
   * @type {FeatureLayer}
   */
  const sensorslayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_flood_sensors_dms_wgs_master_status_view/FeatureServer/0',
    /* definitionExpression: "DAM_AREA = 'Area 3 - Pennine'", */
    outFields: [
      'ALERT_LEVEL', 'STATUS', 'DAM_AREA', 'POSTCODE', 'ROAD', 'MANHOLE_REF', 'DEVICE_ID', 'GATEWAY_ID', 'ALERT_LEVEL', 'LEVEL_STATUS', 'BENCHING_STATUS', 'LEVEL_READING', 'ANALYTICS_URL', 'TOWN', 'PERCENT_WATER_LEVEL', 'WATER_LEVEL'
    ],
    featureReduction: clusterConfig,
    popupTemplate: popupTemplate,
    labelingInfo: [],
    labelsVisable: true
  });

  /**
   * @type {FeatureLayer}
   */
  const sensorsbenchinglayer = new FeatureLayer({
    url:
 'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_flood_sensors_dms_wgs_master_benching/FeatureServer/0'
  });

  /**
   * @type {FeatureLayer}
   */
  const sensorslevelstatuslayer = new FeatureLayer({
    url:
 'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_flood_sensors_dms_wgs_master_level_status/FeatureServer/0'
  });

  const gatewayslayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_gw_location_wgs_master_view/FeatureServer/0'
  });

  /**
   * @type {FeatureLayer}
   */
  const DAMlayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_dam_area_wgs_master_view/FeatureServer/0'
    /* definitionExpression: "area = 'Area 3 - Pennine'" */
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
      GravitySewerlayer,
      DAMlayer,
      IDASlayer,
      sensorslayer,
      gatewayslayer,
      sensorsbenchinglayer,
      sensorslevelstatuslayer
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
      minZoom: 7,
      maxZoom: 20,
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

  // widgets

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
      content: new Search({ view: view })
    }),
    'top-left'
  );

  view.ui.add(
    new Expand({
      expandTooltip: 'Search Sensors',
      expandIconClass: 'esri-icon-share',
      expanded: false,
      autoCollapse: true,
      view: view,
      content: new Search({
        view: view,
        sources: [
          {
            layer: sensorslayer,
            searchFields: ['DEVICE_ID', 'ROAD'],
            displayField: 'DEVICE_ID',
            exactMatch: false,
            outFields: ['*'],
            name: 'Sensor ID',
            zoomScale: 5,
            placeholder: 'Search Sensor ID Or Road',
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
      view: view,
      content: document.getElementById('infoDiv'),
      expandIconClass: 'esri-icon-filter',
      autoCollapse: true,
      expanded: true
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
  function compareLevels (a, b) {
    if (a === 'Active') {
      return -1;
    }
    if (b === 'Active') {
      return 1;
    }
    if (a === 'Blue Alert') {
      return -1;
    }
    if (b === 'Blue Alert') {
      return 1;
    }
    if (a === 'Amber Alert') {
      return -1;
    }
    if (b === 'Amber Alert') {
      return 1;
    }
    if (a === 'No Signal') {
      return -1;
    }
    if (b === 'No Signal') {
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
  function compareFeatures (a, b) {
    return -1 * compareLevels(
      a.attributes.STATUS,
      b.attributes.STATUS
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
  function listNodeCreateItem (id, content, level) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
    switch (level) {
      case 'No Signal':
        li.classList.add('gradient-45deg-red-red');
        break;
      case 'Amber Alert':
        li.classList.add('gradient-45deg-amber-amber');
        break;
      case 'Blue Alert':
        li.classList.add('gradient-45deg-light-blue-cyan');
        break;
      default:
        li.classList.add('gradient-45deg-green-teal');
        break;
    }
    return li;
  };

  /**
   * Update UI with the number of features by alert level in current map view.
   *
   * @param {{'Very High': number,'High': number,'Medium': number,'Low': number,}} level - Alert level
   */
  function updateLiveMapNumber (alertLevelCount) {
    document.getElementById('nosignalAlertMapNumberSpan')
      .innerText = alertLevelCount['No Signal'];
    document.getElementById('activeMapNumberSpan')
      .innerText = alertLevelCount.Active;
  }

  /**
   * Clear and build listNode.
   */
  function listNodeReset () {
    if (!graphics) {
      return;
    }
    const alertLevelCount = {
      'No Signal': 0,
      Active: 0
    };
    const fragment = document.createDocumentFragment();
    graphics.sort(compareFeatures);
    graphics.forEach(function (result, index) {
      const attributes = result.attributes;
      if (
        !selectedSensorFilterField ||
        attributes[selectedSensorFilterField] === selectedSensorFilterValue
      ) {
        if (Object.prototype.hasOwnProperty.call(alertLevelCount, attributes.STATUS)) {
          alertLevelCount[attributes.STATUS]++;
        }
        fragment.appendChild(
          listNodeCreateItem(
            index,
            attributes.STATUS +
            ' | ' +
            attributes.ALERT_LEVEL +
            ' | ' +
            attributes.POSTCODE +
            ' | ' +
            attributes.ROAD +
            ' | ' +
            attributes.TOWN +
            ' | ' +
            attributes.DEVICE_ID,
            attributes.STATUS
          )
        );
      }
    });
    listNode.innerHTML = '';
    listNode.appendChild(fragment);
    updateLiveMapNumber(alertLevelCount);
  };

  view.whenLayerView(sensorslayer).then(function (layerView) {
    floodLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['STATUS']
          })
          .then(function (results) {
            graphics = results.features;
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
          if (error.STATUS !== 'AbortError') {
            console.error(error);
          }
        });
    }
  };

  listNode.addEventListener('click', listNodeClickHandler);

  // sensors filter

  /**
   * Click event handler for sensorsElement.
   *
   * @param {MouseEvent} event
   */
  function sensorsElementClickHandler (event) {
    selectedSensorFilterField = event.currentTarget.getAttribute('sensor-filter-field');
    selectedSensorFilterValue = event.currentTarget.getAttribute('sensor-filter-value');
    floodLayerView.filter = {
      where: `${selectedSensorFilterField}='${selectedSensorFilterValue}'`
    };
    listNodeReset();
    event.stopPropagation();
  };

  document.querySelectorAll('[sensor-filter-field]').forEach(
    node => node.addEventListener('click', sensorsElementClickHandler)
  );

  // sensors reset fiter

  /**
   * Click event handler for sensorsReset.
   *
   * @param {MouseEvent} event
   */
  function sensorsResetClickHandler (event) {
    floodLayerView.filter = null;
    selectedSensorFilterField = null;
    selectedSensorFilterValue = null;
    listNodeReset();
  };

  document.getElementById('filterReset1')
    .addEventListener('click', sensorsResetClickHandler);
  document.getElementById('filterReset2')
    .addEventListener('click', sensorsResetClickHandler);

  // cluster

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler (newValue) {
    sensorslayer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : clusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);
});
