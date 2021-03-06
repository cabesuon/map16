# Freelance works for **map16**

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Result</th>
      <th>Hours</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>05/12/2020</td>
      <td>
        <ol>
          <li>
            Clustering of the point feature layer. Up to a certain point. Apply the filtering to the clusters as
            well.
          </li>
          <li>
            Reset filter to not only reset the map, but reset the side panel with all results
          </li>
          <li>
            When sidebar item clicked on its zooms to the point location and show popup. (The same as when polygon
            layers are used)
          </li>
        </ol>
      </td>
      <td>
        <a href="./051220/index.html" target="_blank">Cluster-Filter</a>
      </td>
      <td>
        <ol>
          <li>
            1:30
          </li>
          <li>
            0:45
          </li>
          <li>
            0:45
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>05/20/2020</td>
      <td>
        <ol>
          <li>
            Integration of 05/12/20 work to map16 solution.
          </li>
          <li>
            Peek at multiple data chart issue using ApexCharts.
          </li>
        </ol>
      </td>
      <td>
        <ol>
          <li><a href="./052020/html/1.html" target="_blank">map16 - Data Dashboard</a></li>
          <li><a href="./052020/html/2.html" target="_blank">jQuery Ajax Example</a></li>
        </ol>
      </td>
      <td>
        <ol>
          <li>
            1:00
          </li>
          <li>
            1:00
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>06/05/2020</td>
      <td>
        <ol>
          <li>
            Remove the ability to change clustering zoom level in the map view. We want the ability to set it in the
            script.js. We have currently set it to 11 in the .js file.
          </li>
          <li>
            Leave the filtering option widget in the map view as well as the main buttons outside of the map view.
          </li>
          <li>
            Colour the text in the side panel to correspond with High Medium Low etc….
          </li>
          <li>
            Expand function currently is added to top right hand corner. We would like to get this working
            correctly, so map can go full screen.
          </li>
          <li>
            <strong>Extra:</strong> Colour the text in the map filter panel to correspond with High Medium Low etc….
          </li>
        </ol>
      </td>
      <td>
        <a href="./060520/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ol>
          <li>
            0:15
          </li>
          <li>
            0:15
          </li>
          <li>
            0:30
          </li>
          <li>
            0:30
          </li>
          <li>
            0:30
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>06/09/2020</td>
      </td>
      <td>
        <ol>
          <li>
            Order the side panel results to (High – Medium – Low). They are currently showing (High – Low – Medium).
          </li>
          <li>
            <strong>Previus:</strong> Add a visual button, similar to the design below which uses the attribute
            sensor_url.
          </li>
          <li>
            <strong>Fix:</strong> One of our team has just noticed that when we start adding more information into
            the side panel such as the line of code below;
            <i>listNodeCreateItem(index, attributes.current_level + ' | ' + attributes.postcode + ‘ | ‘ +
              attributes.road)</i>
            The colour of the side bar dosent recognise this and everything becomes blue. It looks like the switch
            (content) function is looking or exact match of High, Medium etc.
          </li>
        </ol>
      </td>
      <td>
        <a href="./060520/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ol>
          <li>
            0:15
          </li>
          <li>
            0:30
          </li>
          <li>
            0:15
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>06/26/2020</td>
      <td>
        <ol>
          <li>
            See the new polygon layer correctly and set everything working as before.
          </li>
        </ol>
      </td>
      <td>
        <a href="./062620/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ol>
          <li>
            1:00
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>06/29/2020</td>
      <td>
        <ol>
          <li>
            Grid features without data should say 'In-Active Grid' in sidepanel.
          </li>
          <li>
            Add extra fields to sidepanel.
          </li>
          <li>
            <strong>Fix:</strong> One of our team just spotted something else. For some reason when the ‘MEASURE’
            value is 0 the application is reading it as na and not 0. Both in the side panel and the popup.
          </li>
        </ol>
      </td>
      <td>
        <a href="./062620/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ol>
          <li>
            0:10
          </li>
          <li>
            0:00
          </li>
          <li>
            0:10
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>07/03/2020</td>
      <td>
        <ol>
          <li>
            Add information from two layers in the side panel (Currently only showing 1):
            (i) sus_uu_sensor_pre_install_wgs_master/FeatureServer/0,
            (ii) sus_uu_gateway_pre_install_surveys_view/FeatureServer/0.
          </li>
          <li>
            Add layer turn on and off using the buttons shown below.
          </li>
          <li>
            Within “Find Address Or Place” search be able to search from an attribute “THOROUGHFARE” in the
            sus_uu_sensor_pre_install_wgs_master/FeatureServer/0 layer.
          </li>
          <li>
            Add a measurement widget into the map view with an expand.
          </li>
          <li>
            Add a filter by ‘Creation Date” into the current filter widget.
          </li>
        </ol>
      </td>
      <td>
        <a href="./070320/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ol>
          <li>
            1:00
          </li>
          <li>
            0:30
          </li>
          <li>
            0:30
          </li>
          <li>
            1:00
          </li>
          <li>
            3:00
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>07/10/2020</td>
      <td>
        <ol>
          <li>
            Task 1
            <ul>
              <li>Make sure the pop is showing responsive iframe embed.</li>
              <li>No Filters, just standard, home, legend, search.</li>
              <li>Sidebar showing list of cameras. List in red.</li>
              <li>Dynamic calculation in top right tab (Live Map Number), showing feature count in current mapview.
              </li>
            </ul>
          </li>
          <li>
            Task 2
            <ul>
              <li>Toggle 4 layers on and off.</li>
              <li>Clustering on 3 point layers.</li>
              <li>
                Combine mapview and sidepanel with;
                <ul>
                  <li>Point Sensors – In Sidebar – “sensorlayer”</li>
                  <li>Rain grid – In Sidebar – “raingridlayer”</li>
                  <li>Point Camera – In Sidebar “cameralayer” (Same Popup from task1)</li>
                  <li>Point Gateways – In Sidebar “gatewaylayer”</li>
                </ul>
                (One colour for each layer in sidepanel)
              </li>
              <li>Filter 1 - Option Of Alert Level – Point Sensors (Same as before)</li>
              <li>Filter 2 – Option Of Alert Level – Rain Grid (Same As Before)</li>
            </ul>
          </li>
        </ol>
      </td>
      <td>
        <ol>
          <li>
            <a href="./071020/task1/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
          <li>
            <a href="./071020/task2/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
        </ol>
      </td>
      <td>
        <ol>
          <li>
            3:00
          </li>
          <li>
            7:00
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>07/14/2020</td>
      <td>
        I have listed below the changes./fix’s. I have also added the date you did the works based on your overview
        page;
        <ol>
          <li>
            07/10/20
            <ul>
              <li>2nd Filter Rain Grid – Not Filtering map.</li>
              <li>Add visual on filter – Showing if filter is active.</li>
              <li>Remove any Inactive rain grids from side panel.</li>
              <li>Add dynamic top information (As per camera system).</li>
            </ul>
          </li>
          <li>
            07/03/20
            <ul>
              <li>Add dynamic top information (As per camera system).</li>
            </ul>
          </li>
          <li>
            06/26/20
            <ul>
              <li>Add dynamic top information (As per camera system).</li>
            </ul>
          </li>
          <li>
            06/05/20
            <ul>
              <li>Add dynamic top information (As per camera system).</li>
            </ul>
          </li>
        </ol>
      </td>
      <td>
        <ol>
          <li>
            <a href="./071020/task2/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
          <li>
            <a href="./070320/task2/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
          <li>
            <a href="./062620/task1/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
          <li>
            <a href="./060520/task2/index.html" target="_blank">map16 - Data Dashboard</a>
          </li>
        </ol>
      </td>
      <td>
        <ol>
          <li>
            1:30
          </li>
          <li>
            0:10
          </li>
          <li>
            0:10
          </li>
          <li>
            0:10
          </li>
        </ol>
      </td>
    </tr>
    <tr>
      <td>07/15/2020</td>
      <td>
        I was wondering if we could swap out the gateway layer and replace it with a river sensor layer. This is a
        now a polygon layer instead of a point layer.<br>
        I have added all the information to the JavaScript file. Including URL and fields. The only thing we need is
        an analytics URL button the same as the rain grid & sensors.
      </td>
      <td>
        <a href="./071520/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
    <tr>
      <td>07/19/2020</td>
      <td>
        <ol>
          <li>I really like the DIV element design for the filter rain grid below. Would it be possible to add the
            same style for the sensor filter below.</li>
          <li>We also would like to change the design of each button. At the moment it seems like there is one
            design for all 3 buttons. However, in their separate views, we have changed each button to look like the
            below;</li>
          <li>I was also wondering if you noticed an issues with loading speeds of the map/sidepanel/numbers at the
            top. Its not to bad, once it loads, but seems hang a little.</li>
          <li>
            <b>Extras</b>,
            <ul>
              <li>Fix: zoom to river features. Now center is the centriod of the polygon.</li>
              <li>Fix: map live number not taking into account layer visibility (for every work since 06/05/2020).
              </li>
              <li>Toggle buttons same layer correspondance order that big buttons</li>
            </ul>
          </li>
        </ol>
      </td>
      <td>
        <a href="./071920/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        <ul>
          <li>0:10</li>
          <li>0:10</li>
          <li>-</li>
          <li>0:40</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>07/21/2020</td>
      <td>
        I have also attached a html file with that we would like you have a look at. It basically uses
        ?id=lr-us00021 in the url to zoom and filter to that specific sensor location.
      </td>
      <td>
        <a href="./071920/testing_zoom_to_location_with_url_parameter.html" target="_blank">Zoom to location with
          URL Parameters</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
    <tr>
      <td>07/22/2020</td>
      <td>
        Would it be possible to look at the install dashboard I have added below. This is exactly the same as the
        works done on 070320, just with slightly different layers.
      </td>
      <td>
        <a href="./072220/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
    <tr>
      <td>08/19/2020</td>
      <td>
        Would it be possible to look at the install dashboard I have added below. This is exactly the same as the
        works done on 070320, just with slightly different layers.
      </td>
      <td>
        <a href="./072220/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
    <tr>
      <td>08/19/2020</td>
      <td>
        We are having some issues with our analytics charts. They are comparing flood sensor’s to rain sensor data. I have attached the sample to the email. Below are two screen shots showing the issue. It’s a strange one as it doesn’t always happen, especially on our live sytem.
      </td>
      <td>
        <a href="./other/081920/index.html" target="_blank">map16 | Flood Analytics</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
    <tr>
      <td>09/03/2020</td>
      <td>
        One of our clients has an API that we need to access and store this data in a mySQL database. The API is using oauth2 authentication and we are just trying to come up with the best way to automate this process.
      </td>
      <td>
        <ul>
          <li>[created] pyprograms/fmc/main.py</li>
          <li>[created] shscript/enigma-tracking-job.sh</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>[develop] 2:30</li>
          <li>[updates] 1:00</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>09/07/2020</td>
      <td>
        Works order API.
      </td>
      <td>
        <ul>
          <li>[updated] pyprograms/fmc/main.py</li>
          <li>[created] shscript/street-manager-work-orders-job.sh</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>[develop] 2:30</li>
          <li>[updates] 1:00</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>09/30/2020</td>
      <td>
        We looking to get the cluster labels on the example I have added the download link below.
      </td>
      <td>
        <a href="./other/092920/index.html" target="_blank">map16 - Data Dashboard</a>
      </td>
      <td>
        1:00
      </td>
    </tr>
  </tbody>
</table>
