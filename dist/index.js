"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSLayeringPlugin = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = require("webpack");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const loader_1 = require("./loader");
const LAYER_ASSET_PATH = "/static/css/layers.css";
const PLUGIN_NAME = "CssLayeringPlugin";
const OPTIONS_SCHEMA = {
    type: "object",
    required: ["layers"],
    properties: {
        ...loader_1.OPTIONS_SCHEMA.properties,
        nonce: {
            description: "Nonce used for style tag when layer order declaration is injected into html using style tag.",
            type: "string",
        },
        publicPath: {
            description: "Public path",
            type: "string",
        },
        injectOrderAs: {
            description: "Determines how layer order declaration is injected into html.",
            enum: ["link", "style", "none"],
        },
    },
};
class CSSLayeringPlugin {
    constructor(options) {
        var _a, _b;
        (0, webpack_1.validateSchema)(OPTIONS_SCHEMA, options, { name: PLUGIN_NAME });
        this.layers = options.layers;
        this.nonce = options.nonce;
        this.injectOrderAs = (_a = options.injectOrderAs) !== null && _a !== void 0 ? _a : "style";
        this.linkHref = path_1.default.join((_b = options.publicPath) !== null && _b !== void 0 ? _b : "", LAYER_ASSET_PATH);
    }
    getOrderDeclaration() {
        const order = this.layers.map((layer) => layer.name).join(", ");
        return `@layer ${order};`;
    }
    injectOrder(compilation) {
        html_webpack_plugin_1.default.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
            if (this.injectOrderAs === "style") {
                const nonceAttribute = this.nonce ? `nonce="${this.nonce}"` : "";
                const styleTag = `<style ${nonceAttribute}>${this.getOrderDeclaration()}</style>`;
                data.html = data.html.replace("<head>", `<head>${styleTag}`);
                cb(null, data);
            }
            else {
                const linkTag = `<link rel="stylesheet" type="text/css" href="${this.linkHref}">`;
                data.html = data.html.replace("<head>", `<head>${linkTag}`);
                cb(null, data);
            }
        });
    }
    emitLinkAsset(compilation) {
        compilation.hooks.processAssets.tap({
            name: PLUGIN_NAME,
            stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        }, () => {
            const order = this.getOrderDeclaration();
            compilation.emitAsset(LAYER_ASSET_PATH, new webpack_1.sources.RawSource(order));
        });
    }
    addLayeringLoader(compiler) {
        compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
            const layeringLoaderRule = {
                test: /\.(sa|sc|c)ss$/,
                use: {
                    loader: path_1.default.resolve(__dirname, "loader.js"),
                    options: { layers: this.layers },
                },
            };
            compiler.options.module.rules = compiler.options.module.rules || [];
            compiler.options.module.rules.push(layeringLoaderRule);
        });
    }
    apply(compiler) {
        this.addLayeringLoader(compiler);
        if (this.injectOrderAs !== "none") {
            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
                this.injectOrder(compilation);
                if (this.injectOrderAs === "link") {
                    this.emitLinkAsset(compilation);
                }
            });
        }
    }
}
exports.CSSLayeringPlugin = CSSLayeringPlugin;
exports.default = CSSLayeringPlugin;
