"use strict";
const through = require("through2");
const fs = require("fs");

module.exports = function (file, opts) {
    let xmlRegex = /<\?xml(?:.*?)>/i;
    let imgRegex = /<img(?:.*?)>/gi;
    let attributesRegex = /\s([\w:_-]+)(?:=(["'])(.*?)\2)?/i;

    function getAttributes(tag) {
        let attributes = {};
        let attrs = tag.replace("<img", "").replace(/\/?>/, "").split(attributesRegex);

        for (let i = 1; i < attrs.length; i+=4) {
            attributes[attrs[i]] = {
                name: attrs[i],
                value: attrs[i+2],
                separator: attrs[i+1]
            };
        }

        return attributes;
    }

    function getAttributeString(attribute) {
        return attribute.name + (isDefined(attribute.value) ? "=" + attribute.separator + attribute.value + attribute.separator : "");
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

                for (let i = 0; i < imgSvg.length; i++) {
                    attributes = getAttributes(imgSvg[i]);

                    filePath = opts.basePath + attributes["src"].value;
                    fileContent = fs.readFileSync(filePath, "utf8").replace(xmlRegex, "");

                    for (let name in attributes) {
                        if (!attributes.hasOwnProperty(name) || name === "src" || name === "data-isvg")
                            continue;

                        fileContent = fileContent.replace("<svg", "<svg " + getAttributeString(attributes[name]) + " ");
                    }

                    content = content.replace(imgSvg[i], fileContent.trim());
                }
            }
        }

        this.push(content);
        next();
    });
};
