/* global gauge_data:false LinearGauge:false RadialGauge:false */
$(function() {
  function range(start, stop, step) {
    var a, b;
    a=[start];
    b=start;
    while(b < stop) {
      b += step;
      a.push(b);
    }
    return a;
  }

  function ticks(max_val) {
    // Dynamically adjust tick size to leave gauge readable.
    var vals, order, val;
    vals = [
      {flow: 8, ticks: {major: 1, minor: 0.5}},
      {flow: 4, ticks: {major: 1, minor: 0.2}},
      {flow: 2, ticks: {major: 0.5, minor: 0.1}},
      {flow: 1, ticks: {major: 0.25, minor: 0.05}},
      {flow: 0, ticks: {major: 0.1, minor: 0.05}}
    ];
    order = Math.floor((Math.log(max_val) / Math.LN10) + 0.000000001);
    for (var i = 0; i < vals.length; i++) {
      if ((max_val / Math.pow(10, order)) >= vals[i]['flow']) {
        val = vals[i];
        break;
      }
    }
    val['ticks']['major'] *= Math.pow(10, order);
    val['ticks']['minor'] *= Math.pow(10, order);
    return val['ticks'];
  }

  function max_flow(inflow_val, outflow_val) {
    // Dynamically set gauge max to next major tick.
    var max_val, min_max_val, tick;
    min_max_val = 20000;  // Gauge max should never be less than this.
    max_val = Math.max(inflow_val, outflow_val, min_max_val);
    tick = ticks(max_val)['major'];
    if ((Math.floor(max_val / tick) * tick) == max_val) {
      // At a tick mark already, leave as-as.
      return max_val;
    }
    // Next major tick.
    return ((Math.floor(max_val / tick) + 1) * tick);
  }

  function format_date_title(date_str) {
    var d, mon, hrs, ampm;
    d = new Date(date_str);
    mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    hrs = (d.getHours() + 12) % 12 || 12;
    ampm = (d.getHours() >= 12) ? 'pm' : 'am';
    return (mon + ' ' + d.getDate() + ' ' + hrs + ampm);
  }

  function draw_gauges(data) {
    var max_flow_val, level_min;
    level_min = Math.min(
        (Math.floor((data['value']['level'] - 15) / 50) - Math.floor(data['value']['level'] / 750)) * 50, 750);  // Dynamically set min level -- lessen gap from bottom when at lower levels.
    max_flow_val = max_flow(data['value']['inflow'], data['value']['outflow']);
    $('#title-date').text(data['title']);
    new LinearGauge({
      renderTo: 'level-gauge',
      width: 180,
      height: 311,
      units: 'Feet',
      minValue: level_min,
      maxValue: 925,
      exactTicks: true,
      majorTicks: range(level_min, 900, 50).concat(925),
      minorTicks: 10,
      borderShadowWidth: 0,
      borders: false,
      needleSide: 'left',
      colorBarProgress: '#0099cc',
      colorBar: '#ffffff',
      barBeginCircle: false,
      fontValueSize: 16,
      highlights: [
        {
          from: 850,
          to: 870,
          color: 'rgba(255, 255, 0, .75)'
        }, {
          from: 870,
          to: 885,
          color: 'rgba(255, 127, 0, .75)'
        }, {
          from: 885,
          to: 901,
          color: 'rgba(200, 0, 0, .75)'
        }, {
          from: 901,
          to: 920,
          color: 'rgba(100, 100, 100, .75)'
        }
      ],
      value: data['value']['level']
    }).draw();
    new RadialGauge({
      renderTo: 'inflow-gauge',
      width: 170,
      height: 170,
      units: 'cfps',
      minValue: 0,
      maxValue: max_flow(data['value']['inflow'], data['value']['outflow']),
      exactTicks: true,
      majorTicks: range(0, max_flow_val, ticks(max_flow_val)['major']),
      minorTicks: ticks(max_flow_val)['minor'],
      borderShadowWidth: 0,
      borders: false,
      valueBoxWidth: 32,
      valueDec: 0,
      fontValueSize: 32,
      highlights: [],
      value: data['value']['inflow']
    }).draw();
    new RadialGauge({
      renderTo: 'outflow-gauge',
      width: 170,
      height: 170,
      units: 'cfps',
      minValue: 0,
      maxValue: max_flow_val,
      exactTicks: true,
      majorTicks: range(0, max_flow_val, ticks(max_flow_val)['major']),
      minorTicks: ticks(max_flow_val)['minor'],
      borderShadowWidth: 0,
      borders: false,
      valueBoxWidth: 32,
      valueDec: 0,
      fontValueSize: 32,
      highlights: [],
      value: data['value']['outflow']
    }).draw();
  }

  jQuery(document).ready(function(){
    draw_gauges(gauge_data);
  });
});
