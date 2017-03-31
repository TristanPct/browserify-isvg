# Browserify isvg

A Browserify transform to replace `img` tag with inline svg.

*This code is based on [browserify-inline-svg by Ashton Harris](https://github.com/aharris/browserify-inline-svg).*

## Usage

Add the Browserify transform and pass in the `basePath`:
```javascript
var browserify = require("browserify");
var inlineSvg  = require("browserify-inline-svg");

browserify("index.js")
    .transform(inlineSvg, {basePath: "./app"})
    .bundle()
    .pipe(process.stdout);
```

This transform targets img tags with `data-inline-svg` attrubute:

```html
<img src="path/to/my.svg" class="my-svg" data-inline-svg />
```
After the transform, the `img` tag is replace by the content of the svg file.
