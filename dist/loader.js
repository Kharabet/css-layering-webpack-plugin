"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONS_SCHEMA = void 0;
exports.default = default_1;
const schema_utils_1 = require("schema-utils");
const minimatch_1 = require("minimatch");
exports.OPTIONS_SCHEMA = {
    type: "object",
    required: ["layers"],
    properties: {
        layers: {
            type: "array",
            items: {
                type: "object",
                required: ["name"],
                properties: {
                    path: {
                        description: "Files matching this pattern (via minimatch) will be wrapped with this layer. If undefined, the layer will only be included in the layer order declaration.",
                        type: "string",
                    },
                    name: {
                        description: "Name of the CSS layer.",
                        type: "string",
                    },
                },
            },
        },
    },
};
function default_1(source) {
    const options = this.getOptions();
    (0, schema_utils_1.validate)(exports.OPTIONS_SCHEMA, options, { name: "CSS Layering Loader" });
    const layersWithPaths = options.layers.filter((layer) => layer.path);
    const layers = `@layer ${options.layers
        .map((layer) => layer.name)
        .join(", ")};`;
    for (const layer of layersWithPaths) {
        const { path, name } = layer;
        if (path && (0, minimatch_1.minimatch)(this.resourcePath, path)) {
            return wrapSourceInLayer(source, name, layers);
        }
    }
    return source;
}
function wrapSourceInLayer(source, layerName, layers) {
    const lines = source.split("\n");
    const useLines = lines.filter((line) => line.trim().startsWith("@use"));
    const otherLines = lines.filter((line) => !line.trim().startsWith("@use"));
    const useLinesString = useLines.join("\n");
    const otherLinesString = otherLines.join("\n");
    return `${useLinesString}\n${layers}\n@layer ${layerName} {\n${otherLinesString}\n}`;
}
