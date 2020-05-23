
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<meta charset="utf-8" />
<title>map16 - Data Dashboard</title>
<?php include ("php/map16_header_scripts_solutions.php"); ?>
<link
rel="stylesheet"
href="https://js.arcgis.com/4.15/esri/themes/light/main.css"/>
<link rel="stylesheet" href="css/style.css"/>
<script src="https://js.arcgis.com/4.15/"></script>
<script src="js/script.js"></script>
</head>
<body class="fixed-header">
</div>
<div class="page-content-wrapper">
<div class="content ">
<div class="map16-container-fluid padding-20 sm-padding-10 bg-master-lightest">
<section class="p-t-100 ">
<div class="map16-container map16-layout-overflow-top">
<div class="col-sm-12 col-md-6 col-xlg-6">
<div class="row ">
<div class="col-sm-6 m-b-10">
<div class="m-t-45 hover-push map16-corner">
<div class="gradient-45deg-red-red map16-design-corner-top padding-10 hover-caption" >
<h5 class="block-title text-center text-white no-margin  ">
Very High
</h5>
</div>
<div class="bg-menu-dark p-t-20 p-b-20 map16-corner hover-caption">
<h1 class="text-center text-white m-b-25 font-montserrat">
<i class="fa fa-warning"></i> 57</h1>
<p class="text-master-light text-center ">
</p>
</div>
<div class="gradient-45deg-red-red p-t-10 p-b-10 map16-design-corner-bottom hover-caption">
<h5 class="block-title text-master-light text-center no-margin "> Filter Map
</h5>
</div>
</div>
</div>
<div class="col-sm-6 m-b-10">
<div class="m-t-45 hover-push map16-corner">
<div class="gradient-45deg-amber-amber map16-design-corner-top padding-10 hover-caption" >
<h5 class="block-title text-center text-white no-margin  ">
High
</h5>
</div>
<div class="bg-menu-dark p-t-20 p-b-20 map16-corner hover-caption">
<h1 class="text-center text-white m-b-25 font-montserrat">
<i class="fa fa-exclamation"></i> 14
</h1>
<p class="text-master-light text-center ">
</p>
</div>
<div class="gradient-45deg-amber-amber p-t-10 p-b-10 map16-design-corner-bottom hover-caption">
<h5 class="block-title text-master-light text-center no-margin "> Filter Map
</h5>
</div>
</div>
</div>
</div>
<div class="row">
</div>
</div>
<div class="col-sm-12 col-md-6 col-xlg-6">
<div class="row">
<div class="col-sm-6 m-b-10">
<div class="m-t-45 hover-push map16-corner">
<div class="gradient-45deg-green-teal map16-design-corner-top padding-10 hover-caption" >
<h5 class="block-title text-center text-white no-margin  ">
Medium
</h5>
</div>
<div class="bg-menu-dark p-t-20 p-b-20 map16-corner hover-caption">
<h1 class="text-center text-white m-b-25 font-montserrat">
<i class="fa fa-check-square-o"></i> 7
</h1>
<p class="text-master-light text-center ">
</p>
</div>
<div class="gradient-45deg-green-teal p-t-10 p-b-10 map16-design-corner-bottom hover-caption">
<h5 class="block-title text-master-light text-center no-margin "> Filter Map
</h5>
</div>
</div>
</div>
<div class="col-sm-6 m-b-10">
<div class="m-t-45 hover-push map16-corner hover-caption">
<div class="gradient-45deg-light-blue-cyan map16-design-corner-top padding-10 hover-caption" >
<h5 class="block-title text-center text-white no-margin  ">
Low
</h5>
</div>
<div class="bg-menu-dark p-t-20 p-b-20 map16-corner hover-caption">
<h1 class="text-center text-white m-b-25 font-montserrat">
<i class="fa  fa-cloud"></i> 5
</h1>
<p class="text-master-light text-center ">
</p>
</div>
<div class="gradient-45deg-light-blue-cyan p-t-10 p-b-10 map16-design-corner-bottom hover-caption">
<h5 class="block-title text-master-light text-center no-margin "> Filter Map
</h5>
</div>
</div>
</div>
</div>
</div>
</div>
<br>
<br>
</section>
<div class="col-md-8 sm-no-padding">
<div class="panel panel-transparent">
<div class="row column-seperation">   
<div class="col-md-12 sm-no-padding">
<div class="panel panel-transparent">
<div class="panel-body no-padding">
<div id="portlet-advance" class="panel panel-default">
<div class="panel-heading ">
<div class="pull-left">
<h4 class="no-margin">MAPVIEW <span class="hint-text small text-darken-1 ml-1">(Note: Flooding Alerts Up By 15%)</span></h4>
</div>
<div class="pull-right">
<a class="btn btn-bordered btn-cons btn-primary m-b-10" id="filterReset">Reset Filter</a>
</div>
<br>
</div>
<div class="panel-body">
<div id="chart-container">
<div id="viewDiv" style="height: 600px; width: 100%;"></div>
</div>
<br>
<div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="col-md-4 sm-no-padding">
<div class="panel panel-transparent">
<div class="row column-seperation">   
<div class="col-md-12 sm-no-padding">
<div class="panel panel-transparent">
<div class="panel-body no-padding">
<div id="portlet-advance" class="panel panel-default">
<div class="panel-body">
<div class="panel-container">
<div id="chart-container" style="height: 670px; width: 100%";>
<div class="panel-side esri-widget" >
<ul id="list_graphics">
<li>Loading&hellip;</li>
</ul>
</div>
</div>
</div>
<div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<br>
<br>
</div>
</div>
</body>
</html>