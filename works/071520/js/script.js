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
  function popupTemplateContentAnchor(url, text) {
    if (url)
      return `<a class="btn btn-bordered btn-cons btn-success anchor" `
        + `href=${url} target="_blank">${text}</a>`;
    return '';
  }

  /**
   * Returns a safe value of a feature attribute value for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {string} -The table element in string format
   */
  function safeAttrValue(value) {
    return value !== null && value !== undefined ? value : 'n/a';
  }

  /**
   * Returns a table with the feature attributes for PopupTemplate.
   *
   * @param {Array<{label:string, value:string}>} attrs - Label and values of feature attributes
   * @return {string} -The table element in string format
   */
  function popupTemplateContentAttrTable(attrs) {
    let content = `<table class="esri-widget__table"><tbody>`;
    for (const attr of attrs) {
      content += `<tr><td>${safeAttrValue(attr.label)}</td><td>${safeAttrValue(attr.value)}</td></tr>`
    }
    content += `</tbody></table>`;
    return content;
  }

  /**
   * @type {string}
   */
  const servicesUrl = 'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services';

  /*
  
  POINT SENSORS
  
  */

  /**
   * @type {Graphic[]}
   */
  let sensorsGraphics = [];

  /**
   * @type {string}
   */
  let selectedSensorLevel = null;

  /**
   * @type {LayerView}
   */
  let sensorsLayerView = null;

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
            'Predominant level in this cluster is <b>{cluster_type_current_level}</b>.'
        }
      ]
    }
  };

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function sensorsPopupTemplateContent(feature) {
    const div = document.createElement('div');
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    const attrs = feature.graphic.attributes;
    div.innerHTML =
      popupTemplateContentAnchor(attrs.sensor_url, 'Analytics Dashboard')
      + popupTemplateContentAttrTable([
        {
          value: safeAttrValue(attrs.current_level),
          label: 'Warning Level'
        },
        {
          value: safeAttrValue(attrs.dam),
          label: 'DAM Area'
        },
        {
          value: safeAttrValue(attrs.postcode),
          label: 'Postcode'
        },
        {
          value: safeAttrValue(attrs.road),
          label: 'Road'
        },
        {
          value: safeAttrValue(attrs.sd_number),
          label: 'Node Reference'
        },
        {
          value: safeAttrValue(attrs.alert_level),
          label: 'Alert Level'
        }
      ]);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const sensorsPopupTemplate = {
    title: '{ALERT_LEVEL} - {TOWN}',
    lastEditInfoEnabled: false,
    content: sensorsPopupTemplateContent,
    outFields: [
      'current_level', 'dam', 'postcode', 'road', 'sd_number', 'alert_level', 'sensor_url'
    ]
  };

  const sensorsLayer = new FeatureLayer({
    url: `${servicesUrl}/sap_uu_dam_demo_sensors_wgs_master_view/FeatureServer/0`,
    outFields: [
      'current_level', 'dam', 'postcode', 'road', 'sd_number', 'alert_level', 'sensor_url'
    ],
    featureReduction: sensorsClusterConfig,
    popupTemplate: sensorsPopupTemplate
  });

  /**
   * Create and return the content of a sensor listNode item.
   *
   * @param {Object} attributes - Feature attributes
   * @return {string} The content
   */
  function sensorsListNodeItemContent(attributes) {
    return safeAttrValue(attributes.current_level)
      + ' | '
      + safeAttrValue(attributes.postcode)
      + ' | '
      + safeAttrValue(attributes.road)
      ;
  }

  /*
  
  RAIN GRID LAYER
  
  */

  /**
   * @type {Graphic[]}
   */
  let raingridGraphics = [];

  /**
   * @type {string}
   */
  let selectedRainGridLevel = null;

  /**
   * @type {LayerView}
   */
  let raingridLayerView = null;

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function raingridPopupTemplateContent(feature) {
    const div = document.createElement('div');
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    const attrs = feature.graphic.attributes;
    div.innerHTML =
      popupTemplateContentAnchor(attrs.ANALYTICS_URL, 'Analytics Dashboard')
      + popupTemplateContentAttrTable([
        {
          value: safeAttrValue(attrs.ALERT_LEVEL),
          label: 'Alert Level'
        },
        {
          value: safeAttrValue(attrs.MEASURE),
          label: 'Rain Measure (mm)'
        },
        {
          value: safeAttrValue(attrs.DAM_AREA),
          label: 'DAM Area'
        },
        {
          value: safeAttrValue(attrs.TOWN),
          label: 'Town'
        },
        {
          value: safeAttrValue(attrs.TIME_ID),
          label: 'Time'
        },
        {
          value: safeAttrValue(attrs.DATE_ID),
          label: 'Date'
        }
      ]);
    return div;
  }

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {string} -The title
   */
  function raingridPopupTemplateTitle(feature) {
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }
    const attrs = feature.graphic.attributes;
    if (!attrs.ALERT_LEVEL) {
      return 'In-Active Grid';
    }
    return `${safeAttrValue(attrs.ALERT_LEVEL)} - ${safeAttrValue(attrs.TOWN)}`;
  }

  /**
   * @type {PopupTemplate}
   */
  const raingridPopupTemplate = {
    title: raingridPopupTemplateTitle,
    lastEditInfoEnabled: false,
    content: raingridPopupTemplateContent,
    outFields: [
      'ALERT_LEVEL', 'MEASURE', 'DAM_AREA', 'TOWN', 'TIME_ID', 'DATE_ID', 'ANALYTICS_URL'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const raingridLayer = new FeatureLayer({
    url: `${servicesUrl}/uu_2km_tle_msh_ntwrk_wgs_master/FeatureServer/0`,
    outFields: [
      'ALERT_LEVEL', 'MEASURE', 'DAM_AREA', 'TOWN', 'TIME_ID', 'DATE_ID', 'ANALYTICS_URL'
    ],
    popupTemplate: raingridPopupTemplate
  });

  /**
   * Create and return the content of a raingrid listNode item.
   *
   * @param {Object} attributes - Feature attributes
   * @return {string} The content
   */
  function raingridListNodeItemContent(attributes) {
    let content = 'In-Active Grid';
    if (attributes.ALERT_LEVEL) {
      content =
        safeAttrValue(attributes.ALERT_LEVEL)
        + ' | '
        + safeAttrValue(attributes.TOWN)
        + ' | '
        + safeAttrValue(attributes.MEASURE)
        + ' | '
        + safeAttrValue(attributes.POSTCODE)
        + ' | '
        + safeAttrValue(attributes.DAM_AREA);
    }
    return content;
  }

  /*
  
  CAMERAS LAYER
  
  */

  /**
   * @type {Graphic[]}
   */
  let camerasGraphics = [];

  /**
   * @type {LayerView}
   */
  let camerasLayerView = null;

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function camerasPopupTemplateContent(feature) {
    const div = document.createElement('div');
    div.className = 'popup-embed-content';
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }

    const attrs = feature.graphic.attributes;
    div.innerHTML =
      popupTemplateContentAnchor(attrs.CAMERA_URL, 'View Video Stream')
      + `<div class="esri-widget__table"><tbody>`
      + `<tr><td>`
      + `<div class="video-embed-container">${safeAttrValue(attrs.CAMERA_EMBED)}</div>`
      + `</td></tr>`
      + `</tbody></table>`;
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const camerasPopupTemplate = {
    title: '{CAMERA_ID} - {THOROUGHFARE} - {TOWN}',
    lastEditInfoEnabled: false,
    content: camerasPopupTemplateContent,
    outFields: [
      'CAMERA_ID', 'CAMERA_EMBED', 'DAM_AREA', 'POSTCODE', 'THOROUGHFARE', 'TOWN', 'CAMERA_URL', 'CAMERA_ANALYTICS'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const camerasLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/sus_uu_live_cam_monit_wgs_master_view/FeatureServer/0',
    outFields: [
      'CAMERA_ID', 'CAMERA_EMBED', 'DAM_AREA', 'POSTCODE', 'THOROUGHFARE', 'TOWN', 'CAMERA_URL', 'CAMERA_ANALYTICS'
    ],
    featureReduction: clusterConfig,
    popupTemplate: camerasPopupTemplate
  });

  /**
   * Create and return the content of a camera listNode item.
   *
   * @param {Object} attributes - Feature attributes
   * @return {string} The content
   */
  function camerasListNodeItemContent(attributes) {
    return safeAttrValue(attributes.CAMERA_ID)
      + ' | '
      + safeAttrValue(attributes.THOROUGHFARE)
      + ' | '
      + safeAttrValue(attributes.TOWN)
      ;
  }

  /*
  
  RIVER SENSORS LAYER
  
  */

  /**
   * @type {Graphic[]}
   */
  let riverSensorsGraphics = [];

  /**
   * @type {LayerView}
   */
  let riverSensorsLayerView = null;

  /**
   * Create and return the content of a feature for PopupTemplate.
   *
   * @param {Feature} feature - Feature
   * @return {HTMLDivElement} -The div element
   */
  function riverSensorsPopupTemplateContent(feature) {
    const div = document.createElement('div');
    if (!feature || !feature.graphic || !feature.graphic.attributes) {
      return;
    }

    const attrs = feature.graphic.attributes;
    div.innerHTML =
      popupTemplateContentAnchor(attrs.ANALYTICS_URL, 'Analytics Dashboard')
      + popupTemplateContentAttrTable([
        {
          value: safeAttrValue(attrs.ALERT_LEVEL),
          label: 'Alert Level'
        },
        {
          value: safeAttrValue(attrs.RIVER_LEVEL),
          label: 'River Level'
        },
        {
          value: safeAttrValue(attrs.PERCENT_RIVER_LEVEL),
          label: 'Percent River Level'
        },
        {
          value: safeAttrValue(attrs.DAM_AREA),
          label: 'DAM Area'
        },
        {
          value: safeAttrValue(attrs.TOWN),
          label: 'Town'
        },
        {
          value: safeAttrValue(attrs.POSTCODE),
          label: 'Postcode'
        },
        {
          value: safeAttrValue(attrs.DATE_ID),
          label: 'Date'
        }
      ]);
    return div;
  }

  /**
   * @type {PopupTemplate}
   */
  const riverSensorsPopupTemplate = {
    title: '{ObjectId}',
    lastEditInfoEnabled: false,
    content: riverSensorsPopupTemplateContent,
    outFields: [
      'ALERT_LEVEL',
      'RIVER_LEVEL',
      'PERCENT_RIVER_LEVEL',
      'POSTCODE',
      'DAM_AREA',
      'TOWN',
      'DATE_ID',
      'ANALYTICS_URL'
    ]
  };

  /**
   * @type {FeatureLayer}
   */
  const riverSensorsLayer = new FeatureLayer({
    url:
      'https://services8.arcgis.com/7LEpm0qhEOOXFxtS/arcgis/rest/services/uu_riv_ntwrk_wgs_master/FeatureServer/0',
    popupTemplate: riverSensorsPopupTemplate,
    outFields: [
      'ALERT_LEVEL',
      'RIVER_LEVEL',
      'PERCENT_RIVER_LEVEL',
      'POSTCODE',
      'DAM_AREA',
      'TOWN',
      'DATE_ID',
      'ANALYTICS_URL'
    ]
  });

  /**
   * Create and return the content of a riverSensors listNode item.
   *
   * @param {Object} attributes - Feature attributes
   * @return {string} The content
   */
  function riverSensorsListNodeItemContent(attributes) {
    return safeAttrValue(attributes.ALERT_LEVEL)
      + ' | '
      + safeAttrValue(attributes.TOWN)
      + ' | '
      + safeAttrValue(attributes.POSTCODE)
      + ' | '
      + safeAttrValue(attributes.DAM_AREA)
    ;
  }

  /**
   * @type {FeatureLayer}
   */
  const DAMlayer = new FeatureLayer({
    url: `${servicesUrl}/sus_uu_dam_area_wgs_master_view/FeatureServer/0`
  });

  /**
   * @type {FeatureLayer}
   */
  const IDASlayer = new FeatureLayer({
    url: `${servicesUrl}/sap_uu_all_idas_areas_wgs_master_view/FeatureServer/0`
  });

  /**
   * @type {Map}
   */
  const map = new Map({
    basemap: 'gray-vector',
    layers: [
      DAMlayer,
      IDASlayer,
      raingridLayer,
      camerasLayer,
      sensorsLayer,
      riverSensorsLayer
    ]
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
            layer: sensorsLayer,
            searchFields: ['road'],
            displayField: 'road',
            exactMatch: false,
            outFields: ['*'],
            name: 'Sensors',
            placeholder: 'Search Road',
            maxResults: 6,
            maxSuggestions: 6,
            suggestionsEnabled: true,
            minSuggestCharacters: 0
          },
          {
            layer: camerasLayer,
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

  const sensorsFilterExpand = new Expand({
    expandTooltip: 'Filter Sensors',
    expanded: false,
    view: view,
    content: document.getElementById('sensorsFilterContainer'),
    expandIconClass: 'esri-icon-filter'
  });
  view.ui.add(
    sensorsFilterExpand,
    'top-left'
  );

  const raingridFilterExpand = new Expand({
    expandTooltip: 'Filter Rain Grid',
    expanded: false,
    view: view,
    content: document.getElementById('raingridFilterContainer'),
    expandIconClass: 'esri-icon-filter'
  });
  view.ui.add(
    raingridFilterExpand,
    'top-left'
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
   * @param {string} bgClass - Background class for item
   * @return {HTMLLIElement} The <li> element
   */
  function listNodeCreateItem(id, content, bgClass) {
    const li = document.createElement('li');
    li.classList.add('panel-result');
    li.tabIndex = 0;
    li.setAttribute('data-result-id', id);
    li.textContent = content;
    li.classList.add(bgClass);
    return li;
  };

  /**
   * Create and return a fragment of items.
   *
   * @param {Graphic[]} graphics - Items features of the fragment
   * @param {Function} listNodeItemContent - Function that returns the content of an item
   * @param {string} bgClass - Background class for item
   * @return {DocumentFragment} The fragment
   */
  function listNodeCreateFragment(
    graphics, sourceName, listNodeItemContent, bgClass, filter
  ) {
    const fragment = document.createDocumentFragment();
    graphics.forEach(function (result, index) {
      const attributes = result.attributes;
      if (!filter || filter(result)) {
        fragment.appendChild(
          listNodeCreateItem(
            `${sourceName}-${index}`,
            listNodeItemContent(attributes),
            bgClass
          )
        );
      }
    });
    return fragment;
  }

  /**
   * Clear and build listNode.
   */
  function listNodeReset() {
    listNode.innerHTML = '';
    let filter = null;
    if (sensorsLayer.visible) {
      sensorsGraphics;
      if (selectedSensorLevel) {
        filter = function (f) {
          return f.attributes.current_level === selectedSensorLevel;
        }
      }
      sensorsFragment = listNodeCreateFragment(
        sensorsGraphics,
        'SENSOR',
        sensorsListNodeItemContent,
        'gradient-45deg-amber-amber',
        filter
      );
      updateLiveMapNumber(sensorsLayer, sensorsFragment.childElementCount);
      listNode.appendChild(sensorsFragment);
    }
    filter = null;
    if (raingridLayer.visible) {
      raingridGraphics;
      if (selectedRainGridLevel) {
        filter = function (f) {
          return f.attributes.ALERT_LEVEL === selectedRainGridLevel;
        };
      } else {
        filter = function (f) {
          return f.attributes.ALERT_LEVEL;
        };
      }
      raingridFragment = listNodeCreateFragment(
        raingridGraphics,
        'RAINGRID',
        raingridListNodeItemContent,
        'gradient-45deg-light-blue-cyan',
        filter
      );
      updateLiveMapNumber(raingridLayer, raingridFragment.childElementCount);
      listNode.appendChild(raingridFragment);
    }
    filter = null;
    if (camerasLayer.visible) {
      camerasFragment = listNodeCreateFragment(
        camerasGraphics,
        'CAMERA',
        camerasListNodeItemContent,
        'gradient-45deg-red-red',
        filter
      );
      updateLiveMapNumber(camerasLayer, camerasFragment.childElementCount);
      listNode.appendChild(camerasFragment);
    }
    filter = null;
    if (riverSensorsLayer.visible) {
      riverSensorsFragment = listNodeCreateFragment(
        riverSensorsGraphics,
        'RIVERS',
        riverSensorsListNodeItemContent,
        'gradient-45deg-indigo-purple',
        filter
      );
      updateLiveMapNumber(riverSensorsLayer, riverSensorsFragment.childElementCount);
      listNode.appendChild(riverSensorsFragment);
    }
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
      case raingridLayer:
        id = 'raingridMapNumberSpan';
      break;
      case camerasLayer:
        id = 'camerasMapNumberSpan';
      break;
      case riverSensorsLayer:
        id = 'riverSensorsMapNumberSpan';
      break;
    }
    document.getElementById(id).innerText = value;
  }

  view.whenLayerView(sensorsLayer).then(function (layerView) {
    sensorsLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['current_level']
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

  view.whenLayerView(raingridLayer).then(function (layerView) {
    raingridLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['ALERT_LEVEL']
          })
          .then(function (results) {
            raingridGraphics = results.features;
            listNodeReset();
          })
          .catch(function (error) {
            console.error('query failed: ', error);
          });
      }
    });
  });

  view.whenLayerView(camerasLayer).then(function (layerView) {
    camerasLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['CAMERA_ID']
          })
          .then(function (results) {
            camerasGraphics = results.features;
            listNodeReset();
          })
          .catch(function (error) {
            console.error('query failed: ', error);
          });
      }
    });
  });

  view.whenLayerView(riverSensorsLayer).then(function (layerView) {
    riverSensorsLayerView = layerView;
    layerView.watch('updating', function (value) {
      if (!value) {
        layerView
          .queryFeatures({
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ['ObjectId']
          })
          .then(function (results) {
            riverSensorsGraphics = results.features;
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
    const arr = resultId.split('-');
    let result = null;
    let center = null;
    switch (arr[0]) {
      case 'SENSOR':
        result = sensorsGraphics[parseInt(arr[1], 10)];
        center = [result.geometry.longitude, result.geometry.latitude];
        break;
      case 'RAINGRID':
        result = raingridGraphics[parseInt(arr[1], 10)];
        center = result.geometry.centroid;
        break;
      case 'CAMERA':
        result = camerasGraphics[parseInt(arr[1], 10)];
        center = [result.geometry.longitude, result.geometry.latitude];
        break;
      case 'RIVERS':
        result = riverSensorsGraphics[parseInt(arr[1], 10)];
        center = [result.geometry.longitude, result.geometry.latitude];
        break;
    }
    if (result && center) {
      view
        .goTo({
          center,
          zoom: view.zoom + 4
        })
        .then(function () {
          view.popup.open({
            features: [result],
            location: center
          });
        })
        .catch(function (error) {
          if (error.alert_level !== 'AbortError') {
            console.error(error);
          }
        });
    }
  };

  listNode.addEventListener('click', listNodeClickHandler);

  // sensors filter

  function updateAlertFilterButtonActive(tag, btn) {
    // remove active from all items
    document.querySelectorAll(`button[${tag}]`).forEach(
      node => node.classList.remove('active')
    );
    // add active to selected item
    if (btn) {
      btn.classList.add('active');
    }
  }

  /**
   * Click event handler for sensorsElement.
   *
   * @param {MouseEvent} event
   */
  function sensorsElementClickHandler(event) {
    updateAlertFilterButtonActive('data-sensor', this);
    selectedSensorLevel = event.currentTarget.getAttribute('data-sensor');
    sensorsLayerView.filter = {
      where: `current_level='${selectedSensorLevel}'`
    };
    listNodeReset();
    if (selectedSensorLevel) {
      sensorsFilterExpand.iconNumber = ' ';
    } else {
      sensorsFilterExpand.iconNumber = null;
    }
    event.stopPropagation();
    event.stopPropagation();
  };

  document.querySelectorAll('button[data-sensor]').forEach(
    node => node.addEventListener('click', sensorsElementClickHandler)
  );

  // sensors filter reset

  /**
   * Click event handler for sensorsFilterReset.
   *
   * @param {MouseEvent} event
   */
  function sensorsFilterResetClickHandler(event) {
    updateAlertFilterButtonActive('data-sensor', null);
    sensorsLayerView.filter = null;
    selectedSensorLevel = null;
    listNodeReset();
    sensorsFilterExpand.iconNumber = null;
  };

  document.getElementById('sensorsFilterReset')
    .addEventListener('click', sensorsFilterResetClickHandler);

  // raingrid filter

  function updateAlertFilterItemActive(tag, item) {
    // remove active from all items
    document.querySelectorAll(`div[${tag}]`).forEach(
      node => node.classList.remove('alert-filter-item-active')
    );
    // add active to selected item
    if (item) {
      item.classList.add('alert-filter-item-active');
    }
  }

  /**
   * Click event handler for raingridElement.
   *
   * @param {MouseEvent} event
   */
  function raingridElementClickHandler(event) {
    updateAlertFilterItemActive('data-raingrid', this);
    selectedRainGridLevel = event.currentTarget.getAttribute('data-raingrid');
    raingridLayerView.filter = {
      where: `ALERT_LEVEL='${selectedRainGridLevel}'`
    };
    listNodeReset();
    if (selectedRainGridLevel) {
      raingridFilterExpand.iconNumber = ' ';
    } else {
      raingridFilterExpand.iconNumber = null;
    }
    event.stopPropagation();
    event.stopPropagation();
  };

  document.querySelectorAll('div[data-raingrid]').forEach(
    node => node.addEventListener('click', raingridElementClickHandler)
  );

  // raingrid filter reset

  /**
   * Click event handler for raingridFilterReset.
   *
   * @param {MouseEvent} event
   */
  function raingridFilterResetClickHandler(event) {
    updateAlertFilterItemActive('data-raingrid', null);
    raingridLayerView.filter = null;
    selectedRainGridLevel = null;
    listNodeReset();
    raingridFilterExpand.iconNumber = null;
  };

  document.getElementById('raingridFilterReset')
    .addEventListener('click', raingridFilterResetClickHandler);

  // cluster

  /**
   * Zoom change handler for map view.
   *
   * @param {number} newValue
   */
  function viewZoomChangeHandler(newValue) {
    sensorsLayer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : sensorsClusterConfig;

    camerasLayer.featureReduction =
      newValue > selectedclusteringUntilZoom ? null : clusterConfig;
  }

  view.watch('zoom', viewZoomChangeHandler);

  // toggle layers visibility

  /**
   * Update toggle button active property
   * 
   * @param {FeatureLayer} layer
   * @param {HTMLButtonElement} btn 
   */
  function updateToggleButtonActiveProp(layer, btn) {
    if (layer.visible) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  /**
   * Toggle layer visibility
   * 
   * @param {FeatureLayer} layer
   * @param {HTMLButtonElement} btn 
   */
  function toggleSourceVisibility(layer, btn) {
    layer.visible = !layer.visible;
    updateToggleButtonActiveProp(layer, btn);
    listNodeReset();
  }

  /**
   * Click event handler for data-source.
   *
   * @param {MouseEvent} event
   */
  function sourceElementClickHandler(event) {
    switch (event.currentTarget.getAttribute('data-source')) {
      case 'SENSORS':
        toggleSourceVisibility(sensorsLayer, toggleSensorsBtn);
        break;
      case 'RAINGRID':
        toggleSourceVisibility(raingridLayer, toggleRaingridBtn);
        break;
      case 'CAMERAS':
        toggleSourceVisibility(camerasLayer, toggleCamerasBtn);
        break;
      case 'RIVERSENSORS':
        toggleSourceVisibility(riverSensorsLayer, toggleRiverSensorsBtn);
        break;
    }
    event.stopPropagation();
  };

  /**
   * @type {HTMLButtonElement}
   */
  const toggleSensorsBtn = document.getElementById('toggleSensorsBtn');
  updateToggleButtonActiveProp(sensorsLayer, toggleSensorsBtn);

  /**
   * @type {HTMLButtonElement}
   */
  const toggleRaingridBtn = document.getElementById('toggleRaingridBtn');
  updateToggleButtonActiveProp(raingridLayer, toggleRaingridBtn);

  /**
   * @type {HTMLButtonElement}
   */
  const toggleCamerasBtn = document.getElementById('toggleCamerasBtn');
  updateToggleButtonActiveProp(camerasLayer, toggleCamerasBtn);

  /**
   * @type {HTMLButtonElement}
   */
  const toggleRiverSensorsBtn = document.getElementById('toggleRiverSensorsBtn');
  updateToggleButtonActiveProp(riverSensorsLayer, toggleRiverSensorsBtn);

  document.querySelectorAll('button[data-source]').forEach(
    node => node.addEventListener('click', sourceElementClickHandler)
  );
  document.querySelectorAll('div[data-source]').forEach(
    node => node.addEventListener('click', sourceElementClickHandler)
  );

});
