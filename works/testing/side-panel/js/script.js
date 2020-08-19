const OBJECTID = 'objectId';

require([
  'esri/views/MapView',
  'esri/Map',
  'esri/layers/FeatureLayer',
  'esri/widgets/Home',
  'esri/widgets/Legend',
  'esri/widgets/Expand',
  'esri/widgets/Fullscreen',
  'esri/Graphic'
], function (
  MapView,
  Map,
  FeatureLayer,
  Home,
  Legend,
  Expand,
  Fullscreen,
  Graphic
) {
  /**
   * @type {Graphic[]}
   */
  const minRandomDate = new Date(2010, 0, 1);

  /**
   * @type {Graphic[]}
   */
  const maxRandomDate = new Date();

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
   * Returns value of a url parameter
   *
   * @param {string} name - The name of the parameter
   * @returns {string} The value of the parameter
   */
  function getUrlParam (name) {
    if ('URLSearchParams' in window) {
      const url = new URL(document.URL);
      console.log(url.searchParams.toString());
      if (url.searchParams.has(name)) {
        return url.searchParams.get('id');
      }
    };
    return null;
  }

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
          label: 'Date Installed'
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
          label: 'Location'
        },
        {
          value: feature.graphic.attributes.asset_location_other,
          label: 'Other Location'
        },
        {
          value: feature.graphic.attributes.gateway_installed,
          label: 'Gateway Installed'
        },
        {
          value: feature.graphic.attributes.rain_sensor_installed,
          label: 'Rain Installed'
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
   * @type {FeatureLayer}
   */
  const sensorsLayer = new FeatureLayer({
    source: [],
    objectIdField: OBJECTID,
    geometryType: 'point',
    featureReduction: sensorsClusterConfig,
    popupTemplate: sensorsPopupTemplate,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        style: 'diamond',
        size: '10px',
        color: '#6200ea',
        outline: {
          color: [128, 128, 128, 0.5],
          width: '0.5px'
        }
      }
    },
    fields: [
      { name: 'sensor_id', label: 'Id', type: 'integer' },
      { name: 'sensor_type', label: 'Type', type: 'string' },
      { name: 'NODEREFERE', label: 'NODEREFERE', type: 'string' },
      { name: 'install_name', label: 'Name', type: 'string' },
      { name: 'POSTCODE', label: 'Postcode', type: 'integer' },
      { name: 'THOROUGHFARE', label: 'Road', type: 'string' },
      { name: 'TOWN', label: 'Town', type: 'string' },
      { name: 'DAM_AREA', label: 'DAM', type: 'string' },
      { name: 'CreationDate', label: 'Creation', type: 'date' }
    ],
    outFields: ['*']
  });

  console.log(`sensors input: ${getUrlParam('sensors')}`);

  sensorsLayer.applyEdits({
    addFeatures: __rp.randomPoints(
      -5.679, 50.192, 1.338, 55.457, (+getUrlParam('sensors') || 1000)
    ).map((p, i) => new Graphic({
      geometry: { type: 'point', x: p[0], y: p[1], longitude: p[0], latitude: p[1] },
      attributes: {
        objectId: i,
        sensor_id: i,
        sensor_type: `Type ${i}`,
        NODEREFERE: `No deferere ${i}`,
        install_name: `Name ${i}`,
        POSTCODE: i + 10000,
        THOROUGHFARE: `Road ${i}`,
        TOWN: `Town ${i}`,
        DAM_AREA: `DAM ${i}`,
        CreationDate: +__rp.randomDate(minRandomDate, maxRandomDate)
      },
      layer: sensorsLayer
    }))
  }).then(results =>
    console.log(`> Sensors Layer Features Loaded ${
      results.addFeatureResults.filter(result => !result.error).length
    }`)
  );

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
    // url:
    //   'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_gateway_install_view/FeatureServer/0',
    source: [],
    objectIdField: OBJECTID,
    geometryType: 'point',
    featureReduction: gatewaysClusterConfig,
    popupTemplate: gatewaysPopupTemplate,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        style: 'triangle',
        size: '10px',
        color: '#3f51b5',
        outline: {
          color: [128, 128, 128, 0.5],
          width: '0.5px'
        }
      }
    },
    fields: [
      { name: 'gateway_id', label: 'Id', type: 'integer' },
      { name: 'asset_location', label: 'Location', type: 'string' },
      { name: 'asset_location_other', label: 'Other', type: 'string' },
      { name: 'gateway_installed', label: 'Gateway', type: 'string' },
      { name: 'rain_sensor_installed', label: 'Rain Sensor', type: 'string' },
      { name: 'install_name', label: 'Name', type: 'string' },
      { name: 'CreationDate', label: 'Creation', type: 'date' }
    ],
    outFields: ['*']
  });

  console.log(`gateways input: ${getUrlParam('gateways')}`);

  gatewaysLayer.applyEdits({
    addFeatures: __rp.randomPoints(
      -5.679, 50.192, 1.338, 55.457, (+getUrlParam('gateways') || 1000)
    ).map((p, i) => new Graphic({
      geometry: { type: 'point', x: p[0], y: p[1], longitude: p[0], latitude: p[1] },
      attributes: {
        objectId: i,
        gateway_id: i,
        asset_location: `Location ${i}`,
        asset_location_other: `Other ${i}`,
        gateway_installed: `Gateways ${i}`,
        rain_sensor_installed: `Rain ${i}`,
        install_name: `Name ${i}`,
        CreationDate: +__rp.randomDate(minRandomDate, maxRandomDate)
      },
      layer: gatewaysLayer
    }))
  }).then(results =>
    console.log(`> Gateways Layer Features Loaded ${
      results.addFeatureResults.filter(result => !result.error).length
    }`)
  );

  /**
   * @type {Map}
   */
  const map = new Map({
    basemap: 'gray',
    layers: [
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
    new Fullscreen({
      view: view,
      element: document.getElementById('applicationDiv')
    }),
    'top-right'
  );

  // list

  /**
   * @type {HTMLUListElement}
   */
  const listNode = document.getElementById('listGraphics');

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
            outFields: ['*']
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
            outFields: ['*']
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
});
