import { version, copyright, rights } from "./constants.js"

export const mainMenuText = {
    color: 0x000000,
    width: 640,
    height: 480,
    size: 22,
    lineOffset: -7,
    colOffset: -2,
    text: [
        {
            text: "Play",
            color: 0x000000,
            highlight: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Settings",
            color: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Achievements",
            color: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Credits",
            color: 0xffffff
        },
        "endl",
        {
            text: " ".repeat(43 - version.length) + version,
            color: 0xffffff
        },
        "endl",
        {
            text: " ".repeat(43 - copyright.length) + copyright,
            color: 0x7f7f7f
        }
    ]
}

export const settingsText = {
    color: 0x000000,
    width: 504, // 36 chars (32)
    height: 330, // 11 lines (9)
    size: 22,
    lineOffset: -1,
    colOffset: -2,
    text: [
        {
            text: "Master Volume",
            color: 0x000000,
            highlight: 0xffffff
        },
        {
            text: "               "
        },
        {
            text: "100%",
            color: 0xffffff
        },
        "endl",
        {
            text: "Controls",
            color: 0xffffff
        },
        "endl",
        {
            text: "Fullscreen",
            color: 0xffffff
        },
        {
            text: "                   "
        },
        {
            text: "OFF",
            color: 0xffffff
        },
        "endl",
        {
            text: "Save Data",
            color: 0xffffff
        },
        "endl",
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Back",
            color: 0xffffff
        },
        "endl"
    ]
}

export const achievText = {
    color: 0x000000,
    width: 640,
    height: 480,
    size: 22,
    lineOffset: -1,
    colOffset: -2,
    text: [
        {
            text: "No achievements yet",
            color: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Press [" + "placeholder" + "] to go back",
            color: 0xffffff
        },
        "endl",
        {
            text: "destroyerofbraincells"
        }
    ]
}

export const controlsText = {
    color: 0x000000,
    width: 504, // 36 chars (32)
    height: 330, // 11 lines (9)
    size: 22,
    lineOffset: -1,
    colOffset: -2,
    text: [
        {
            text: "Up",
            highlight: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Down",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Left",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Right",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Confirm",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Cancel",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            text: "Menu",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        {
            text: "",
            color: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Back",
            color: 0xffffff
        }
    ]
}

export const savedataText = {
    color: 0x000000,
    width: 504, // 36 chars (32)
    height: 330, // 11 lines (9)
    size: 22,
    lineOffset: -1,
    colOffset: -2,
    text: [
        {
            text: "Import data",
            highlight: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Export data",
            color: 0xffffff
        },
        "endl",
        "endl",
        {
            text: "Erase all data",
            color: 0xff0000
        }
    ]
}

export const creditsText = {
    color: 0x000000,
    width: 644,
    height: 480,
    size: 22,
    lineOffset: 0,
    colOffset: -2,
    text: [
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "              - NULLSPACE -",
            color: 0xffffff,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "              By ImIcterine",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "        and destroyerofbraincells",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",

        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "             - Game Design -",
            color: 0x7f7f7f,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "                ImIcterine",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "           destroyerofbraincells",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "             - Programming -",
            color: 0x7f7f7f,
            bold: true,
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "                ImIcterine",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "              Art & Visuals",
            color: 0x7f7f7f,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "                ImIcterine",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "           destroyerofbraincells",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "            - Audio & Music -",
            color: 0x7f7f7f,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "                ImIcterine",
            color: 0xffffff
        },
        "endl",
        "endl",
        
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "             - Playtesters -",
            color: 0x7f7f7f
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "                ImIcterine",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "           destroyerofbraincells",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "             - Inspirations -",
            color: 0x7f7f7f,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: '         "DELTARUNE" by Toby Fox',
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "          The Backrooms Wikidot",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "           The Backrooms Fandom",
            color: 0xffffff
        },
        "endl",
        "endl",
        
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "              - Tools used -",
            color: 0x7f7f7f,
            bold: true
        },
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "          Rendering: PixiJS v.8",
            color: 0xffffff
        },
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "          Seeding: SeedGoat v1.1",
            color: 0xffffff
        },
        {
            //     123456789 123456789 || 987654321 987654321
            //text: "           Data Storing: idb 8",
            text: "",
            color: 0xffffff
        },
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",

        
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",

        
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        {
            //     123456789 123456789 || 987654321 987654321
            text: "            To be continued...",
            color: 0xffffff,
            bold: true
        },
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
        "endl",
    ]
}