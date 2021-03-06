require([
  'esri/views/MapView',
  'esri/Map',
  'esri/layers/FeatureLayer',
  'esri/widgets/Expand'
], function (MapView, Map, FeatureLayer, Expand) {
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
  let selectedclusteringUntilZoom = 99;

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
          'Predominant warning level in this cluster is <b>{cluster_type_warning_level}</b>.'
        }
      ]
    }
  };

  /**
   * @type {PopupTemplate}
   */
  const popupTemplate = {
    title: 'Location: {warning_level}',
    lastEditInfoEnabled: false,
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'warning_level',
            label: 'Warning Level',
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
'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/test_point_layer/FeatureServer/0',
    outFields: ['warning_level'],
    featureReduction: clusterConfig,
    popupTemplate: popupTemplate
  });

  /**
   * @type {Map}
   */
  const map = new Map({
    basemap: 'gray-vector',
    layers: [layer]
  });

  /**
   * @type {MapView}
   */
  const view = new MapView({
    map: map,
    container: 'viewDiv',
    center: [-2.228596, 51.723758],
    zoom: 12
  });

  view.ui.add(
    new Expand({
      view: view,
      content: document.getElementById('infoDiv'),
      expandIconClass: 'esri-icon-layer-list',
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
  function listNodeCreateItem (id, content) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
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
    graphics.forEach(function (result, index) {
      const attributes = result.attributes;
      if (
        !selectedSeason ||
        attributes.warning_level === selectedSeason
      ) {
        fragment.appendChild(
          listNodeCreateItem(index, attributes.warning_level)
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
            orderByFields: ['warning_level']
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
          if (error.warning_level !== 'AbortError') {
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
      where: `warning_level='${selectedSeason}'`
    };
    listNodeReset();
    event.stopPropagation();
  };

  // document.getElementById('seasons-filter')
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

  document.getElementById('filterReset')
    .addEventListener('click', seasonsResetClickHandler);

  // cluster

  /**
   * Change event handler for clusteringUntilZoomLevel.
   *
   * @param {Event} event
   */
  function clusteringUntilZoomLevelChangeHandler (event) {
    selectedclusteringUntilZoom = Number(event.target.value);
    viewZoomChangeHandler(view.zoom);
  };

  document.getElementById('clusteringUntilZoomLevel')
    .addEventListener('change', clusteringUntilZoomLevelChangeHandler);

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler (newValue) {
    if (Number.isInteger(newValue)) {
      document.getElementById('currentZoomLevelValue').innerText = newValue;
    }
    layer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : clusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);
});
