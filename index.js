"use strict";
const through = require("through2");
const fs = require("fs");

module.exports = function (file, opts) {
    let xmlRegex = /<\?xml(?:.*?)>/i;
    let imgRegex = /<img(?:.*?)>/gi;
    let attributesRegex = /\s([\w:_-]+)(?:=["'](.*?)["'])?/i;

    function getAttributes(tag) {
        let attributes = {};
        let attrs = tag.replace("<img", "").replace(">", "").split(attributesRegex);

        for (let i = 1; i < attrs.length; i+=3) {
            attributes[attrs[i]] = attrs[i+1];
        }

        return attributes;
    }

    function isDefined(value) {
        return typeof value !== "undefined" && value !== null;
    }

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
                if (img[i].indexOf("data-isvg") !== -1)
                    imgSvg.push(img[i]);
            }

            if (imgSvg && imgSvg.length > 0) {
                let filePath;
                let fileContent;
                let attributes;
                let value;

                for (let i = 0; i < imgSvg.length; i++) {
                    attributes = getAttributes(imgSvg[i]);

                    filePath = opts.basePath + attributes["src"];
                    fileContent = fs.readFileSync(filePath, "utf8").replace(xmlRegex, "");

                    for (let name in attributes) {
                        if (!attributes.hasOwnProperty(name) || name === "src" || name === "data-isvg")
                            continue;

                        value = isDefined(attributes[name]) ? "=\"" + attributes[name] + "\"" : "";
                        fileContent = fileContent.replace("<svg", "<svg " + name + value + " ");
                    }

                    content = content.replace(imgSvg[i], fileContent.trim());
                }
            }
        }

        this.push(content);
        next();
    });
};
