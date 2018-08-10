import { Component, ElementRef, Input, OnInit, Renderer2, SimpleChanges } from "@angular/core";
import * as kjua from "kjua";

const default_config: KjuaConfig = {
    // render method: 'canvas' or 'image'
    render: "image",

    // render pixel-perfect lines
    crisp: true,

    // minimum version: 1..40
    minVersion: 1,

    // error correction level: 'L', 'M', 'Q' or 'H'
    ecLevel: "L",

    // size in pixel
    size: 200,

    // pixel-ratio, null for devicePixelRatio
    ratio: null,

    // code color
    fill: "#333",

    // background color
    back: "#fff",

    // content
    text: "no text",

    // roundend corners in pc: 0..100
    rounded: 0,

    // quiet zone in modules
    quiet: 0,

    // modes: 'plain', 'label' or 'image'
    mode: "plain",

    // label/image size and pos in pc: 0..100
    mSize: 30,
    mPosX: 50,
    mPosY: 50,

    // label
    label: "no label",
    fontname: "sans",
    fontcolor: "#333",
};
type KjuaConfig = {
    render: "canvas" | "image";
    crisp: boolean;
    minVersion: number;
    ecLevel: "L" | "M" | "Q" | "H";
    size: number;
    ratio: number | null;
    fill: string;
    back: string;
    text: string;
    rounded: number;
    quiet: number;
    mode: "plain" | "label" | "image";
    mSize: number;
    mPosX: number;
    mPosY: number;
    label: string;
    fontname: string;
    fontcolor: string;
    image?: HTMLImageElement;
};
type KjuaOptions = { [key in keyof KjuaConfig]?: KjuaConfig[key] };

@Component({
    selector: "kjua-qrcode",
    templateUrl: "kjua-qrcode.html",
})
export class KjuaQrcodeComponent implements OnInit {
    @Input("render") render: any;
    @Input("crisp") crisp: any;
    @Input("minVersion") minVersion: any;
    @Input("ecLevel") ecLevel: any;
    @Input("size") size: any;
    @Input("ratio") ratio: any;
    @Input("fill") fill: any;
    @Input("back") back: any;
    @Input("text") text: any;
    @Input("rounded") rounded: any;
    @Input("quiet") quiet: any;
    @Input("mode") mode: any;
    @Input("mSize") mSize: any;
    @Input("mPosX") mPosX: any;
    @Input("mPosY") mPosY: any;
    @Input("label") label: any;
    @Input("fontname") fontname: any;
    @Input("fontcolor") fontcolor: any;
    _config: KjuaOptions = {};
    @Input()
    get config() {
        return this._config;
    }
    set config(v) {
        this._config = Object.assign({}, v, default_config);
        if (this._el) {
            this.update();
        }
    }
    constructor(public eleRef: ElementRef, public render2: Renderer2) {}
    ngOnInit() {
        this.update();
    }
    ngOnChanges(changes: SimpleChanges) {
        let is_config_changed = false;
        [
          "render",
          "crisp",
          "minVersion",
          "ecLevel",
          "size",
          "ratio",
          "fill",
          "back",
          "text",
          "rounded",
          "quiet",
          "mode",
          "mSize",
          "mPosX",
          "mPosY",
          "label",
          "fontname",
          "fontcolor",
        ].forEach(key => {
          if (key in changes) {
            is_config_changed = true;
            this.config[key] = this[key];
          }
        });
        if (is_config_changed) {
          this.update();
        }
      }
    private _el: HTMLImageElement | HTMLCanvasElement;
    update() {
        if (this._el) {
            this.render2.removeChild(this.eleRef.nativeElement, this._el);
        }
        this._el = kjua(this.config);
        this.render2.appendChild(this.eleRef.nativeElement, this._el);
    }
}
