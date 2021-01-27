
    var options = {
      series: [
        { name: 'Manhole Level', data: []},
        { name: 'Rain Level', data: []}
      ],
      chart: {
        height: 500,
        type: 'area',
          animations: {
        enabled: false
          }
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.3,
          opacityTo: 0.1,
          stops: [25, 90, 100]
        },
      },
      colors: ['#1565c0', '#26c6da'],
      stroke: {
        curve: 'smooth',
        /*lineCap: 'butt',*/
        colors: ['#1565c0', '#26c6da'],
        width: 2,
        dashArray: [0, 2],

      },
      noData: {
        text: 'Loading map16 Sensor Analytics...'
      },
      xaxis: {
        type: 'datetime',
        tickPlacement: 'on',
        labels: {
          /*rotate: -45,
          rotateAlways: true*/
        }
      },
      yaxis: [
        {
          seriesName: 'Manhole Level (mm)',
          forceNiceScale: true,
          min: 0,
          max: <?php echo $_GET["depth"];?>,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#1565c0'
          },
          labels: {
            style: {
              colors: '#1565c0',
            },
          },
          title: {
            text: "Manhole Level (mm)",
            style: {
              color: '#1565c0',
            }
          },
          tooltip: {
            enabled: true
          }
        },
        {
          seriesName: 'Rain (mm)',
          forceNiceScale: true,
          min: 0,
          /*max:15,*/
          opposite: true,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#26c6da'
          },
          labels: {
            style: {
              colors: '#26c6da',
            },
          },
          title: {
            text: "Rain (mm)",
            style: {
              color: '#26c6da',
            }
          }
        },
      ],
      legend: {
        position: 'top'
      },
      annotations: {
        position: 'front',
        yaxis: [
          {
            y: '<?php echo $_GET["red-alert"];?>',
            borderColor: '#bf360c',
            fillColor: '#bf360c',
            opacity: 0.2,
            label: {
              borderColor: '#bf360c',
              style: {
                color: '#fff',
                background: '#bf360c'
              },
              text: 'Red Alert Level'
            }
          },
          {
            y: '<?php echo $_GET["amber-alert"];?>',
            borderColor: '#ff6f00',
            fillColor: '#ff6f00',
            opacity: 0.2,
            label: {
              borderColor: '#ff6f00',
              style: {
                color: '#fff',
                background: '#ff6f00'
              },
              text: 'Amber Alert Level'
            }
          }
        ]
      },
      tooltip: {
        enabled: true,
        enabledOnSeries: undefined,
        x: {
          show: true,
          format: 'HH:mm:ss - MMM dd',
          formatter: undefined,
        },
      }
    };
    var chart = new ApexCharts(document.querySelector("#chart_water_timeline"), options);
    chart.render();

    function getManholeData() {
      return fetch('php/charts/data-water-level.php?id=<?php echo $_GET["id"];?>')
      .then(response => response.json());
    }

    function getRainData() {
      return fetch('php/charts/data-rain-level.php?rg=<?php echo $_GET["rg"];?>')
      .then(response => response.json());
    }

    function addSeries() {
      Promise.all([getManholeData(), getRainData()])
      .then(
        ([manholeData, rainData]) => chart.updateSeries([
          { data: manholeData },
          { data: rainData }
        ], true)
      )
      .catch(error => console.log(error));
    }

    addSeries();
