require([
  'esri/views/MapView',
  'esri/Map',
  'esri/layers/FeatureLayer',
  'esri/widgets/Home',
  'esri/widgets/Legend',
  'esri/widgets/Expand',
  'esri/widgets/Fullscreen',
  'esri/widgets/Search',
  'esri/widgets/Search'

], function (MapView, Map, FeatureLayer, Home, Legend, Expand, Fullscreen, Search) {
  /**
   * @type {string}
   */
  let selectedSeason = null;

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
          text: 'This cluster represents <b>{cluster_count}</b> features.'
        },
        {
          type: 'text',
          text:
            'Predominant warning level in this cluster is <b>{cluster_type_ALERT_LEVEL}</b>.'
        }
      ]
    },
    clusterMinSize: '24px',
    clusterMaxSize: '60px',
    labelingInfo: [{
      // turn off deconfliction to ensure all clusters are labeled
      deconflictionStrategy: 'none',
      labelExpressionInfo: {
        expression: 'Text($feature.cluster_count, "#,###")'
      },
      symbol: {
        type: 'text',
        color: '#202328',
        font: {
          weight: 'bold',
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
      return '<a class="btn btn-bordered btn-cons btn-danger full-width m-b-20" ' +
      `href=${value} target="_blank">VIEW CAMERA</a>`;
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
    `<tr><td>Warning Level</td><td>${safeAttrValue(attrs.current_level)}</td></tr>` +
    `<tr><td>DAM Area</td><td>${safeAttrValue(attrs.dam)}</td></tr>` +
    `<tr><td>Postcode</td><td>${safeAttrValue(attrs.postcode)}</td></tr>` +
    `<tr><td>Road</td><td>${safeAttrValue(attrs.road)}</td></tr>` +
    `<tr><td>Node Reference</td><td>${safeAttrValue(attrs.sd_number)}</td></tr>` +
    `<tr><td>Alert Level</td><td>${safeAttrValue(attrs.alert_level)}</td></tr>` +
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
    div.innerHTML = popupTemplateContentSensorAnchor(attrs.sensor_url) +
      popupTemplateContentAttrTable(attrs);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const popupTemplate = {
    title: '{ALERT_LEVEL} - {TOWN}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    fieldInfos: [
      {
        fieldName: 'ANALYTICS_URL'
      },
      {
        fieldName: 'ALERT_LEVEL'
      },
      {
        fieldName: 'MEASURE'
      },
      {
        fieldName: 'DAM_AREA'
      },
      {
        fieldName: 'TOWN'
      },
      {
        fieldName: 'TIME_ID'
      },
      {
        fieldName: 'DATE_ID'
      }
    ],
    outFields: [
      'ALERT_LEVEL', 'MEASURE', 'DAM_AREA', 'TOWN', 'TIME_ID', 'DATE_ID', 'ANALYTICS_URL'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const layer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_flood_sensors_wgs_master/FeatureServer/0',
    outFields: [
      // this fields does not correspond to the layer
      // 'current_level', 'dam', 'postcode', 'road', 'sd_number', 'alert_level', 'sensor_url'
      '*'
    ],
    featureReduction: clusterConfig,
    popupTemplate: popupTemplate,
    labelingInfo: [],
    labelsVisible: true
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
    layers: [DAMlayer, IDASlayer, layer]
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
      content: new Search({ view: view })
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
    if (!a) {
      return -1;
    }
    if (!b) {
      return 1;
    }
    if (a === 'No Alert') {
      return -1;
    }
    if (b === 'No Alert') {
      return 1;
    }
    if (a === 'Green Alert') {
      return -1;
    }
    if (b === 'Green Alert') {
      return 1;
    }
    if (a === 'Amber Alert') {
      return -1;
    }
    if (b === 'Amber Alert') {
      return 1;
    }
    if (a === 'Red Alert') {
      return -1;
    }
    if (b === 'Red Alert') {
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
      a.attributes.ALERT_LEVEL,
      b.attributes.ALERT_LEVEL
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
      case 'High':
        li.classList.add('gradient-45deg-red-red');
        break;
      case 'Medium':
        li.classList.add('gradient-45deg-amber-amber');
        break;
      case 'Low':
        li.classList.add('gradient-45deg-green-teal');
        break;
      default:
        li.classList.add('gradient-45deg-light-blue-cyan');
        break;
    }
    return li;
  };

  /**
   * Clear and build listNode.
   */
  function listNodeReset () {
    if (!graphics) {
      return;
    }
    const fragment = document.createDocumentFragment();
    graphics.sort(compareFeatures);
    graphics.forEach(function (result, index) {
      const attributes = result.attributes;
      if (
        !selectedSeason ||
        attributes.current_level === selectedSeason
      ) {
        fragment.appendChild(
          listNodeCreateItem(
            index,
            attributes.current_level +
            ' | ' + attributes.postcode +
            ' | ' + attributes.road,
            attributes.current_level
          )
        );
      }
    });
    listNode.innerHTML = '';
    listNode.appendChild(fragment);
  };

  view.whenLayerView(layer).then(function (layerView) {
    floodLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['ALERT_LEVEL']
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
          if (error.current_level !== 'AbortError') {
            console.error(error);
          }
        });
    }
  };

  listNode.addEventListener('click', listNodeClickHandler);

  // seasons filter

  /**
   * Click event handler for seasonsElement.
   *
   * @param {MouseEvent} event
   */
  function seasonsElementClickHandler (event) {
    selectedSeason = event.currentTarget.getAttribute('data-season');
    floodLayerView.filter = {
      where: `current_level='${selectedSeason}'`
    };
    listNodeReset();
    event.stopPropagation();
  };

  document.querySelectorAll('div[data-season]').forEach(
    node => node.addEventListener('click', seasonsElementClickHandler)
  );

  // seasons reset fiter

  /**
   * Click event handler for seasonsReset.
   *
   * @param {MouseEvent} event
   */
  function seasonsResetClickHandler (event) {
    floodLayerView.filter = null;
    selectedSeason = null;
    listNodeReset();
  };

  document.getElementById('filterReset1')
    .addEventListener('click', seasonsResetClickHandler);
  document.getElementById('filterReset2')
    .addEventListener('click', seasonsResetClickHandler);

  // cluster

  /**
   * Change event handler for clusteringUntilZoomLevel.
   *
   * @param {Event} event
   */
  // function clusteringUntilZoomLevelChangeHandler (event) {
  //   selectedclusteringUntilZoom = Number(event.target.value);
  //   viewZoomChangeHandler(view.zoom);
  // };

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler (newValue) {
    layer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : clusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);
});
