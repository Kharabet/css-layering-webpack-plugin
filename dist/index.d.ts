import { Compiler } from "webpack";
export interface Layer {
    path?: string;
    name: string;
}
export interface Options {
    layers: Layer[];
    nonce?: string;
    injectOrderAs?: "link" | "style" | "none";
    publicPath?: string;
}
export declare class CSSLayeringPlugin {
    private layers;
    private nonce?;
    private injectOrderAs;
    private linkHref;
    constructor(options: Options);
    private getOrderDeclaration;
    private injectOrder;
    private emitLinkAsset;
    private addLayeringLoader;
    apply(compiler: Compiler): void;
}
export default CSSLayeringPlugin;
