# Browserify isvg

A Browserify transform to replace `img` tag with inline svg.

*This code is based on [browserify-inline-svg by Ashton Harris](https://github.com/aharris/browserify-inline-svg).*

## Usage

Add the Browserify transform and pass in the `basePath`:
```javascript
var browserify = require("browserify");
var isvg       = require("browserify-isvg");

browserify("index.js")
    .transform(isvg, {basePath: "./app"})
    .bundle()
    .pipe(process.stdout);
```

This transform targets img tags with `data-isvg` attribute:

```html
<img src="path/to/my.svg" class="my-svg" data-isvg />
```
After the transform, the `img` tag is replaced by the content of the svg file.

All attributes are transfered to the new `svg` tag except `src` and `data-isvg`.
