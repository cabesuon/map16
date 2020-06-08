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
  let selectedclusteringUntilZoom = 11;

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
            'Predominant warning level in this cluster is <b>{cluster_type_current_level}</b>.'
        }
      ]
    }
  };

  /**
   * @type {PopupTemplate}
   */
  const popupTemplate = {
    title: '{current_level} - {postcode}',
    lastEditInfoEnabled: false,
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'current_level',
            label: 'Warning Level',
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: 'dam',
            label: 'DAM Area',
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: 'postcode',
            label: 'Postcode',
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: 'road',
            label: 'Road',
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: 'sd_number',
            label: 'Road',
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: 'alert_level',
            label: 'Alert Level',
            format: {
              places: 0,
              digitSeparator: true
            }
          }
        ]
      }
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const layer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sap_uu_dam_demo_sensors_wgs_master_view/FeatureServer/0',
    outFields: ['current_level', 'postcode'],
    featureReduction: clusterConfig,
    popupTemplate: popupTemplate
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

  view.ui.add(new Expand({
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
   * Create and resturn a listNode item.
   *
   * @param {number} id - Data result id
   * @param {string} content - Content text
   * @return {HTMLLIElement} The <li> element
   */
  function listNodeCreateItem(id, content) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
    switch (content) {
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
  function listNodeReset() {
    if (!graphics) {
      return;
    }
    const fragment = document.createDocumentFragment();
    graphics.forEach(function (result, index) {
      const attributes = result.attributes;
      if (
        !selectedSeason ||
        attributes.current_level === selectedSeason
      ) {
        fragment.appendChild(
          listNodeCreateItem(index, attributes.current_level)
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
            orderByFields: ['current_level']
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
  function seasonsElementClickHandler(event) {
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
  function seasonsResetClickHandler(event) {
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
  function clusteringUntilZoomLevelChangeHandler(event) {
    selectedclusteringUntilZoom = Number(event.target.value);
    viewZoomChangeHandler(view.zoom);
  };

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler(newValue) {
    layer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : clusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);
});
