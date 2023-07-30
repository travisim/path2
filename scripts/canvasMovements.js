

// var instance = panzoom(document.getElementById('map-container'));
panzoom(document.getElementById('map-container'), {
  beforeWheel: function(e) {
    // allow wheel-zoom only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.altKey;
    return shouldIgnore;
    },

    beforeMouseDown: function(e) {
    // allow mouse-down panning only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.altKey;
    return shouldIgnore;
  },
    maxZoom: 3,
    minZoom: 0.5,
    bounds: true,
     boundsPadding: 0.2,

  
  initialX: 0,
  initialY: 0,
  initialZoom: 1
});


// instance.on('panstart', function(e) {
//   console.log('Fired when pan is just started ', e);
//   // Note: e === instance.
// });

// instance.on('pan', function(e) {
//   console.log('Fired when the scene is being panned', e);
// });

// instance.on('panend', function(e) {
//   console.log('Fired when pan ended', e);
// });

// instance.on('zoom', function(e) {
//   console.log('Fired when scene is zoomed', e);
// });

// instance.on('transform', function(e) {
//   // This event will be called along with events above.
//   console.log('Fired when any transformation has happened', e);
// });
