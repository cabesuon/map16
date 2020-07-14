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
        }
      ]
    }
  };

  /**
   * Returns an anchor with the feature sensor url for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {string} -The anchor element in string format
   */
  function popupTemplateContentCameraAnchor(value) {
    if (value)
      return `<a class="btn btn-bordered btn-cons btn-primary camera-anchor" `
        + `href=${value} target="_blank">View Video Stream</a>`;
    return '';
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
   * @param {Feature} feature - Feature
   * @return {string} -The table element in string format
   */
  function popupTemplateContentAttrTable(attrs) {
    return `<div class="esri-widget__table"><tbody>`
      + `<tr><td>`
      + `<div class="camera-embed-container">${safeAttrValue(attrs.CAMERA_EMBED)}</div>`
      + `</td></tr>`
      + `</tbody></table>`;
  }

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function popupTemplateContent(feature) {
    const div = document.createElement('div');
    div.className = 'popup-content';
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    const attrs = feature.graphic.attributes;
    div.innerHTML = popupTemplateContentCameraAnchor(attrs.CAMERA_URL)
      + popupTemplateContentAttrTable(attrs);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const popupTemplate = {
    title: '{CAMERA_ID} - {THOROUGHFARE} - {TOWN}',
    lastEditInfoEnabled: false,
    content: popupTemplateContent,
    fieldInfos: [
      {
        fieldName: 'CAMERA_ID'
      },
      {
        fieldName: 'CAMERA_EMBED'
      },
      {
        fieldName: 'DAM_AREA'
      },
      {
        fieldName: 'POSTCODE'
      },
      {
        fieldName: 'THOROUGHFARE'
      },
      {
        fieldName: 'TOWN'
      },
      {
        fieldName: 'CAMERA_URL'
      },
      {
        fieldName: 'CAMERA_ANALYTICS'
      }
    ],
    outFields: [
      'CAMERA_ID', 'CAMERA_EMBED', 'DAM_AREA', 'POSTCODE', 'THOROUGHFARE', 'TOWN', 'CAMERA_URL', 'CAMERA_ANALYTICS'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const layer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_cam_monit_wgs_master_view/FeatureServer/0',
    outFields: [
      'CAMERA_ID', 'CAMERA_EMBED', 'DAM_AREA', 'POSTCODE', 'THOROUGHFARE', 'TOWN', 'CAMERA_URL', 'CAMERA_ANALYTICS'
    ],
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
      content: new Search({
        view: view,
        sources: [
          {
            layer: layer,
            searchFields: ['THOROUGHFARE'],
            displayField: 'THOROUGHFARE',
            exactMatch: false,
            outFields: ['*'],
            name: 'Cameras',
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
   * @return {HTMLLIElement} The <li> element
   */
  function listNodeCreateItem(id, content) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
    li.classList.add('gradient-45deg-red-red');
    return li;
  };

  /**
   * Create and return the content of a listNode item.
   *
   * @param {Object} attributes - Feature attributes
   * @return {string} The content
   */
  function listNodeItemContent(attributes) {
    return safeAttrValue(attributes.CAMERA_ID)
      + ' | '
      + safeAttrValue(attributes.THOROUGHFARE)
      + ' | ' 
      + safeAttrValue(attributes.TOWN)
    ;
  }

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
      fragment.appendChild(
        listNodeCreateItem(
          index,
          listNodeItemContent(attributes)
        )
      );
    });
    listNode.innerHTML = '';
    listNode.appendChild(fragment);
  };

  function updateLiveMapNumber(value) {
    document.getElementById('liveMapNumberSpan').innerText = value;
  }

  view.whenLayerView(layer).then(function (layerView) {
    floodLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['CAMERA_ID']
          })
          .then(function (results) {
            graphics = results.features;
            updateLiveMapNumber(graphics.length);
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

  // cluster

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
