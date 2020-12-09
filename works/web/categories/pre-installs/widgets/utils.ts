import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import Extent from 'esri/geometry/Extent';

// gis utils

export function simpleSymbol(
  graphic: __esri.Graphic,
  color: string | number[] | __esri.Color
): SimpleMarkerSymbol | SimpleLineSymbol | SimpleFillSymbol {
  switch (graphic.geometry.type) {
    case 'point':
    case 'multipoint':
      return new SimpleMarkerSymbol({
        color: 'transparent',
        size: '16px',
        outline: {
          color,
          width: 1
        }
      });
    case 'polyline':
      return new SimpleLineSymbol({
        color,
        width: 1
      });
    case 'polygon':
    case 'extent':
      return new SimpleFillSymbol({
        color: '#eeeeeeee',
        outline: {
          color,
          width: 1
        }
      });
  }
  return null;
}

export function viewGoToTargetParam(
  view: __esri.MapView,
  geom: __esri.Geometry
): { target: __esri.geometry.Extent }|
  { center: __esri.geometry.Point, zoom: number } {
  if (!geom) {
    return { center: view.center, zoom: view.zoom };
  }
  if (geom.type === 'point') {
    return { center: geom as __esri.Point, zoom: view.zoom + 4 <= 18 ? view.zoom + 4 : 18 };
  }
  return { target: geom.extent.expand(1.1) };
}

export function addPointToExtent(
  pto: __esri.Point,
  ext: __esri.geometry.Extent
): __esri.geometry.Extent {
  if (!pto) {
    return ext;
  }
  let e;
  if (!ext) {
    e = new Extent({
      xmin: pto.x,
      xmax: pto.x,
      ymin: pto.y,
      ymax: pto.y,
      spatialReference: {
        wkid: 102100
      }
    });
  } else {
    e = ext.clone();
    if (pto.x < e.xmin) {
      e.xmin = pto.x;
    } 
    if (pto.x > e.xmax) {
      ext.xmax = pto.x;
    }
    if (pto.y < e.ymin) {
      e.ymin = pto.y;
    } 
    if (pto.y > e.ymax) {
      ext.ymax = pto.y;
    }
  }
  return e;
}

export function extent(
  geoms: __esri.Geometry[]
): __esri.geometry.Extent {
  if (!geoms || geoms.length === 0) {
    return null;
  }
  let ext = null;
  if (geoms[0].type === 'point') {
    ext = addPointToExtent(geoms[0] as __esri.Point, null);
  } else {
    ext = geoms[0].extent.clone();
  }
  for (let i = 1; i < geoms.length; i++) {
    if (geoms[i].type === 'point') {
      ext = addPointToExtent(geoms[i] as __esri.Point, ext);
    } else {
      ext.union(geoms[i].extent);
    }
  }
  return ext;
}

export function fieldValue(value: any, field: __esri.Field): string {
  if (
    field.type === 'date' ||
    field.type.toString().toLowerCase().includes('date')) {
      return (new Date(value)).toLocaleDateString();
  }
  if (
    field.type === 'double' ||
    field.type.toString().toLowerCase().includes('double')) {
      return Number(value).toFixed(3);
  }
  return value.toString();
}

// dom manipulation

export function removeAllChildNodes(parent: HTMLElement) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
