function simpleMovingAverage (d, n) {
  const result = [];
  if (!d || d.length < n) {
    return result;
  }
  let sum = 0;
  let i;
  let y;
  for (i = 0; i < n; i++) {
    y = Number(d[i].y);
    result.push({ x: d[i].x, y });
    sum += y;
  }
  for (i = n; i < d.length; i++) {
    result.push({ x: d[i].x, y: sum / n });
    sum -= Number(d[i - n].y);
    sum += Number(d[i].y);
  }
  return result;
}

function exponentialMovingAverage(d, n, a) {
  const k = a || 2 / (n + 1);
  const result = [
    {
      x: d[0].x,
      y: Number(d[0].y)
    }
  ];
  for (let i = 1; i < d.length; i++) {
    result.push({
      x: d[i].x,
      y: Number(d[i].y) * k + result[i - 1].y * (1 - k)
    });
  }
  return result;
}
