export const colors = [
  {
    name: "electric-green",
    background: "#59EAD8",
    font: "#000000"
  },
  {
    name: "sky-blue",
    background: "#5FA9FF",
    font: "#000000"
  },
  {
    name: "pika-yellow",
    background: "#EAEE2A",
    font: "#000000"
  },
  {
    name: "ultra-pink",
    background: "#EA6CFF",
    font: "#000000"
  },
  {
    name: "peach",
    background: "#F89D83",
    font: "#000000"
  },
  {
    name: "periwinkle",
    background: "#9383F8",
    font: "#000000"
  },
  {
    name: "gold-leaf",
    background: "#EEB72A",
    font: "#000000"
  },
  {
    name: "salmon",
    background: "#EF6C6C",
    font: "#000000"
  },
  {
    name: "electric-mint",
    background: "#81EFB4",
    font: "#000000"
  },
  {
    name: "cornflower-blue",
    background: "#98B2DA",
    font: "#000000"
  }
];

let memoize = function(factory, ctx) {
  var cache = {};
  return function(key) {
    if (!(key in cache)) {
      cache[key] = factory.call(ctx, key);
    }
    return cache[key];
  };
};

export const colorToRGBA = (function() {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  var ctx = canvas.getContext('2d');

  return memoize(function(col) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = col;
    var computed = ctx.fillStyle;
    ctx.fillStyle = '#fff';
    ctx.fillStyle = col;
    if (computed !== ctx.fillStyle) {
      return; // invalid color
    }
    ctx.fillRect(0, 0, 1, 1);
    return [ ...ctx.getImageData(0, 0, 1, 1).data ];
  });
})();
