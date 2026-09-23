import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8.21.0/dist/pixi.min.mjs'

// World mask
export function lvl0cmask(roomdata) {
    const mask = new PIXI.Graphics()

    mask.beginFill(0xffffff)

    for (const room of roomdata.rooms) {
        mask.drawRect(room.x, room.y - roomdata.wallheight, room.w, room.h)
    }

    mask.endFill()

    return mask
}