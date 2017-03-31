"use strict";
const through = require("through2");
const fs = require("fs");

module.exports = function (file, opts) {
    let xmlRegex = /<\?xml(?:.*?)>/;
    let imgRegex = /<img(?:.*?)>/g;
    let srcRegex = /src=(?:"|\\'|')/;
    let classRegex = /class=(?:"|\\'|')/;
    let endRegex = /(?:"|\\'|')/;

    opts.basePath = opts.basePath || "";
    if (opts.basePath.substr(opts.basePath.length - 1) !== "/") {
        opts.basePath += "/";
    }

    return through(function (buf, enc, next) {
        let content = buf.toString("utf8");
        let img = content.match(imgRegex);

        if (img) {
            let imgSvg = [];
            for (let i = 0; i < img.length; i++) {
                if (img[i].indexOf("data-inline-svg") !== -1)
                    imgSvg.push(img[i]);
            }

            if (imgSvg && imgSvg.length > 0) {
                let filePath;
                let fileContent;
                let classes;
                for (let i = 0; i < imgSvg.length; i++) {
                    filePath = opts.basePath + imgSvg[i].split(srcRegex)[1].split(endRegex)[0];
                    fileContent = fs.readFileSync(filePath, "utf8").replace(xmlRegex, "");

                    if (imgSvg[i].indexOf("class=") !== -1) {
                        classes = imgSvg[i].split(classRegex)[1].split(endRegex)[0];
                        fileContent = fileContent.replace("<svg", "<svg class=\"" + classes + "\" ");
                    }

                    content = content.replace(imgSvg[i], fileContent.trim());
                }
            }
        }

        this.push(content);
        next();
    });
};
