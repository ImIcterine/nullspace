import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8.21.0/dist/pixi.min.mjs'
import { sound as pixisound } from 'https://cdn.jsdelivr.net/npm/@pixi/sound/+esm'

export const assetsPrefix = "../assets/"
    
const assetpaths = {
    logo: "textures/logo.png",
    nineslicebox: "textures/nine-slice-box2.png",
    lvl0wallpaper: "textures/lvl0/wallpaper32.png",
    lvl0carpet: "textures/lvl0/carpet16.png",
    lvl0wallstain: "textures/lvl0/wallstain32.png",
    lvl0wallshadow: "textures/lvl0/wallshadow.png",
}

const assetpack = {}

export async function getAsset(name) {
    if (assetpack[name]) return assetpack[name]
    
    const tex = await PIXI.Assets.load(assetsPrefix + assetpaths[name])
    tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
    assetpack[name] = tex
    return tex
}



// Sound loading
const soundpaths = {
    goback: "sounds/goback.wav",
    selectfail: "sounds/selectfail.wav",
    uimove: "sounds/uimove.wav",
    select: "sounds/select.wav",
}

export function initSound() {
    for (const key in soundpaths) {
        pixisound.add(key, assetsPrefix + soundpaths[key])
    }
}
