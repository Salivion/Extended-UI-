// ============================================
// КОНФИГУРАЦИЯ ИКОНОК ПО КАТЕГОРИЯМ
// ============================================
// Формат: названия БЕЗ префиксов (copper вместо itemCopper)
// 
// ИСТОЧНИКИ ИКОНОК:
// - Icon.java — иконки интерфейса (power, menu, settings, edit, cancel и т.д.)
// - Tex.java — текстуры UI (alphaaaa, underline, whiteui, pane и т.д.)
// - items/*.png — предметы (copper, lead, silicon, thorium и т.д.)
// - units/*.png — юниты (dagger, mace, fortress, alpha, aegires и т.д.)
// - blocks/*/ — блоки (conveyor, router, turret, wall и т.д.)
// - liquids/*.png — жидкости (water, oil, cryofluid, slag и т.д.)
// - statuses/*.png — эффекты (burning, freezing, shocked и т.д.)
// - teams/*.png — команды (sharded, foundation, sharded, malachite и т.д.)
// ============================================

exports.iconCategories = [
    // ========================================
    // ИНТЕРФЕЙС И UI
    // ========================================
    {
        name: "Interface",
        icon: "settings",
        icons: [
            // Основные
            "menu", "settings", "edit", "save", "load", "cancel", "ok", "add", "remove",
            "copy", "paste", "trash", "info", "warning", "error", "search", "filter",
            // Навигация
            "left", "right", "up", "down", "home", "back", "forward",
            "leftOpen", "rightOpen", "upOpen", "downOpen",
            // Действия
            "refresh", "refresh1", "undo", "redo", "rotate", "move", "resize",
            "play", "pause", "stop", "list", "terminal",
            // Статусы
            "lock", "lockOpen", "eye", "eyeOff", "star", "image",
            // Прочее
            "wrench", "hammer", "file", "fileText", "fileImage", "folder",
            "link", "upload", "download", "export", "import", "zoom"
        ]
    },
    {
        name: "UI Textures",
        icon: "alphaaaa",
        icons: [
            // Фон и панели
            "alphaaaa", "alphaBg", "alphaBgLine", "pane", "pane2", "paneSolid",
            "paneTop", "paneLeft", "paneRight", "whitePane", "whiteui",
            // Кнопки
            "button", "buttonDown", "buttonOver", "buttonDisabled", "buttonRed",
            "buttonSelect", "buttonSelectTrans", "buttonTrans",
            "buttonRight", "buttonRightDown", "buttonRightOver", "buttonRightDisabled",
            // Чекбоксы
            "checkOn", "checkOnOver", "checkOnDisabled", "checkOff", "checkDisabled", "checkOver",
            // Линии и разделители
            "underline", "underline2", "underlineOver", "underlineWhite", "underlineRed", "underlineDisabled",
            "sideline", "sidelineOver",
            // Прочее UI
            "bar", "barTop", "inventory", "cursor", "selection", "clear",
            "logo", "cat", "crater", "logicNode", "scroll", "slider"
        ]
    },
    // ========================================
    // РЕСУРСЫ И ПРЕДМЕТЫ
    // ========================================
    {
        name: "Resources",
        icon: "copper",
        icons: [
            // Базовые ресурсы
            "copper", "lead",  "coal", "sand", "scrap", "graphite", "silicon", "metaglass", 
            // Продвинутые ресурсы
            "titanium", "thorium", "plastanium", "phase-fabric", "surge-alloy", "spore-pod", "pyratite", "blast-compound",
            // Ресурсы Erekir
            "beryllium", "tungsten", "oxide", "carbide",
            // Особые
            "fissile-matter", "dormant-cyst"
        ]
    },
    {
        name: "Liquids",
        icon: "water",
        icons: [
            // Базовые жидкости
            "water", "oil", "slag",
            // Продвинутые жидкости
            "cryofluid",
            // Жидкости Erekir
            "arkycite", "hydrogen", "ozone", "nitrogen", "cyanogen", "gallium", "neoplasm"
        ]
    },
    // ========================================
    // ЮНИТЫ
    // ========================================
    {
        name: "Units",
        icon: "dagger",
        icons: [
            // Serpulo
            "dagger", "mace", "fortress", "scepter", "reign",
            "crawler", "atrax", "spiroct", "arkyid", "toxopid",
            "nova", "pulsar", "quasar", "vela", "corvus", 

            "flare", "horizon", "zenith", "antumbra", "eclipse",
            "mono", "poly", "mega", "quad", "oct",

            "risso", "minke", "bryde", "sei", "omura",
            "retusa", "oxynoe", "cyerce", "aegires", "navanax",
            
            // Erekir
            "stell", "locus", "precept", "vanquish", "conquer",
            "merui", "cleroi", "anthicus", "tecta", "collaris",
            "elude", "avert", "obviate", "quell", "disrupt", "quell-missile", "disrupt-missile",
            "scathe-missile", "scathe-missile-phase", "scathe-missile-surge", "scathe-missile-surge-split",
            "renale", "latum",                  
            // Special
            "alpha", "beta", "gamma",
            "evoke", "incite", "emanate",
            
            // Factory
            // Serpulo 
            "ground-factory", "air-factory", "naval-factory",
            "additive-reconstructor", "multiplicative-reconstructor", "exponential-reconstructor", "tetrative-reconstructor", 

            // Erekir
            "tank-fabricator", "ship-fabricator", "mech-fabricator", 
            "tank-refabricator", "ship-refabricator", "mech-refabricator", "prime-refabricator",
            "tank-assembler", "ship-assembler", "mech-assembler", "basic-assembler-module",

            // Other 
            "repair-point", "repair-turret", "unit-repair-tower", "payload-conveyor", "payload-router", "reinforced-payload-conveyor", "reinforced-payload-router", "payload-loader", "payload-unloader", 
            "payload-mass-driver", "large-payload-mass-driver", "small-deconstructor", "deconstructor", "constructor", "large-constructor", "payload-source", "payload-void"
        ]
    },
    // ========================================
    // БЛОКИ - РАСПРЕДЕЛЕНИЕ
    // ========================================
    {
        name: "Conveyors",
        icon: "conveyor",
        icons: [
            // Serpulo
            "conveyor", "titanium-conveyor", "plastanium-conveyor", "armored-conveyor",
            "junction", "bridge-conveyor", "phase-conveyor", "sorter", "inverted-sorter", "router",  "distributor", "overflow-gate", "underflow-gate",  "unloader", "mass-driver", 
            // Erekir
            "duct", "armored-duct", "duct-router", "overflow-duct", "underflow-duct", "duct-bridge", "duct-unloader", 
            "surge-conveyor", "surge-router", "unit-cargo-loader", "unit-cargo-unload-point", 
            // Special
            "item-source", "item-void"
        ]
    },
    {
        name: "Pipes",
        icon: "conduit",
        icons: [
            // Serpulo
            "mechanical-pump", "rotary-pump", "impulse-pump", 
            "conduit", "pulse-conduit", "plated-conduit",
            "liquid-router", "liquid-tank", "liquid-container",
            "liquid-junction", "bridge-conduit", "phase-conduit", 
            // Erekir
            "reinforced-pump", "reinforced-conduit", "reinforced-liquid-junction", "reinforced-bridge-conduit", "reinforced-liquid-router", "reinforced-liquid-container", "reinforced-liquid-tank",
            // Special
            "liquid-source", "liquid-void"
        ]
    },
    // ========================================
    // БЛОКИ - ПРОИЗВОДСТВО
    // ========================================
    {
        name: "Fabric",
        icon: "silicon-smelter",
        icons: [
            // Serpulo
            "graphite-press", "multi-press", "silicon-smelter", "silicon-crucible", "kiln",
            "plastanium-compressor", "phase-weaver", "surge-smelter", "cryofluid-mixer", "pyratite-mixer", "blast-mixer", "melter", "separator",
            "disassembler", "spore-press", "pulverizer", "coal-centrifuge", "incinerator",
            // Erekir
            "silicon-arc-furnace", "electrolyzer", "atmospheric-concentrator", "oxidation-chamber", "electric-heater", "phase-heater", "slag-heater", "small-heat-redirector",
            "heat-redirector", "heat-router", "slag-incinerator", "carbide-crucible", "slag-centrifuge", "surge-crucible", "phase-synthesizer", "cyanogen-synthesizer",  "heat-reactor",  "heat-source"
         ]
    },

    // ========================================
    // БЛОКИ - ДОПОЛНИТЕЛЬНОЕ
    // ========================================
    {
        name: "Utility",
        icon: "mend-projector",
        icons: [
            "mender", "mend-projector", "overdrive-projector", "overdrive-dome", "force-projector", "shock-mine", "radar", "build-tower", "regen-projector",
            "shockwave-tower", "shield-projector", "large-shield-projector", "core-shard", "core-foundation", "core-nucleus", "core-bastion", "core-citadel", "core-acropolis",
            "container", "vault", "reinforced-container", "reinforced-vault", "illuminator", "launch-pad", "advanced-launch-pad", "landing-pad", "interplanetary-accelerator"
         ]
    },

    // ========================================
    // БЛОКИ - ЭНЕРГИЯ
    // ========================================
    {
        name: "Power",
        icon: "battery",
        icons: [
            // Serpulo
            "power-node", "power-node-large", "surge-tower", "diode", "battery", "battery-large", "combustion-generator", "thermal-generator", "steam-generator", 
            "differential-generator", "rtg-generator", "solar-panel", "solar-panel-large", "thorium-reactor", "impact-reactor",
            // Erekir
            "beam-node", "beam-tower", "beam-link", "turbine-condenser", "chemical-combustion-chamber", "pyrolysis-generator", "flux-reactor", "neoplasia-reactor",
            "power-source", "power-void"
        ]
    },
    // ========================================
    // БЛОКИ - ЗАЩИТА
    // ========================================
    {
        name: "Defense",
        icon: "duo",
        icons: [
            // Башни
            // Serpulo
            "duo", "scatter", "scorch", "hail", "wave", "lancer", "arc", "parallax", "swarmer",
            "salvo", "segment", "tsunami", "fuse", "ripple", "cyclone", "foreshadow", "spectre", "meltdown",
            // Erekir
            "breach", "diffuse", "sublimate", "titan", "disperse", "afflict", "lustre", "scathe", "smite", "malign",

            // Стены 
            // Serpulo
            "copper-wall", "copper-wall-large", "titanium-wall", "titanium-wall-large", "plastanium-wall", "plastanium-wall-large", "thorium-wall", "thorium-wall-large", "phase-wall",
            "phase-wall-large", "surge-wall", "surge-wall-large", "door", "door-large", "scrap-wall", "scrap-wall-large", "scrap-wall-large", "scrap-wall-gigantic",
            "thruster", 
            // Erekir
            "beryllium-wall", "beryllium-wall-large", "tungsten-wall", "tungsten-wall-large", "blast-door", "reinforced-surge-wall", "reinforced-surge-wall-large", "carbide-wall", "carbide-wall-large", "shielded-wall"
        ]
    },

    // ========================================
    // БЛОКИ - БУРЫ
    // ========================================
    {
        name: "Production",
        icon: "blast-drill",
        icons: [
            // Serpulo
            "mechanical-drill", "pneumatic-drill", "laser-drill", "blast-drill", "water-extractor", "cultivator", "oil-extractor", 
            // Erekir
            "vent-condenser", "cliff-crusher", "large-cliff-crusher", "plasma-bore", "large-plasma-bore", "impact-drill", "eruption-drill"
        ]
    },

    // ========================================
    // БЛОКИ - ЛОГИКА
    // ========================================
    {
        name: "Logic",
        icon: "logic-processor",
        icons: [
            "micro-processor", "logic-processor", "hyper-processor", "memory-cell", "memory-bank", "message", "reinforced-message", "canvas",
            "tile-logic-display", "logic-display", "large-logic-display", "world-processor", "world-cell", "world-message", "world-switch"
        ]
    },

    // ========================================
    // ЭФФЕКТЫ И СТАТУСЫ
    // ========================================
    {
        name: "Status Effects",
        icon: "burning",
        icons: [
            "burning", "freezing", "unmoving", "slow", "wet", "muddy", "melting", "sapped", "electrified",
            "spore-slowed", "tarred", "overdrive", "overclock", "shielded", "boss", "shocked", "blasted", "corroded",
            "disarmed", "invincible"
        ]
    },
    {
        name: "Teams",
        icon: "sharded",
        icons: [
            // Базовые команды (используем названия БЕЗ префикса team-)
            // Формат: name|texture (из icons.properties)
            "sharded", "crux", "malis", "derelict",
            // Команды без спрайтов в icons.properties - будут цветными квадратами
            "green", "blue",
            // Neoplastic (специальная команда)
            "neoplastic"
        ]
    },
    // ========================================
    // ПРОЧЕЕ (все иконки которые не попали в другие категории)
    // ========================================
    {
        name: "Other",
        icon: "menu",
        icons: [
            // Социальные сети и платформы (из Links.java)
            "discord", "github", "redditAlien", "trello", "steam", "googleplay",
            "itchio", "android", "f-droid", "dev-builds",
            // Дополнительные UI иконки
            "book", "bookOpen", "list", "add", "wrench", "link",
        ]  // Остальные иконки добавляются автоматически функцией getOtherIcons()
    },
    // ========================================
    // МОДЫ (иконки из модов)
    // ========================================
    {
        name: "Mods",
        icon: "github",
        icons: []  // Заполняется автоматически функцией getModIconsCategory()
    },
    // ========================================
    // ОШИБКИ
    // ========================================
    {
        name: "Error",
        icon: "none",
        icons: ["none"]  // Только для обработки ошибок!
    }
];

// Использовать категории (true) или показать всё вместе (false)
exports.useIconCategories = true;

// Количество иконок в ряду
exports.iconsPerRow = 16;

// ============================================
// Вспомогательные функции
// ============================================

// Функция для получения всех иконок из конфига (кроме Other и Error)
exports.getAllCategoryIcons = function() {
    let allIcons = [];
    for (let category of exports.iconCategories) {
        // Пропускаем категории Other и Error
        if (category.name === "Other" || category.name === "Error") continue;
        allIcons = allIcons.concat(category.icons);
    }
    return allIcons;
};

// Функция для получения всех иконок которые не попали в другие категории
exports.getOtherIcons = function() {
    const iconsUtil = require("extended-ui/utils/icons");
    
    // Принудительно инициализируем ВСЕ иконки включая моды
    iconsUtil.getIcons();  // UI иконки (discord, github, и т.д.)
    iconsUtil.getSprites();  // Спрайты контента
    iconsUtil.getAllTeamIcons();  // Команды
    iconsUtil.getModIcons();  // Иконки из модов
    
    const allAvailableIcons = iconsUtil.getAll();
    const categorizedIcons = exports.getAllCategoryIcons();
    const modIcons = exports.getModIconsCategory();
    
    let otherIcons = [];
    for (let iconName in allAvailableIcons) {
        // Если иконка не в категориях и не модовая - добавляем в Other
        if (categorizedIcons.indexOf(iconName) === -1 && modIcons.indexOf(iconName) === -1) {
            otherIcons.push(iconName);
        }
    }
    
    // Сортируем по алфавиту
    otherIcons.sort();

    return otherIcons;
};

// Функция для получения иконок модов
exports.getModIconsCategory = function() {
    const iconsUtil = require("extended-ui/utils/icons");
    iconsUtil.getModIcons();
    
    const modIcons = iconsUtil.getModIcons();
    let modIconList = [];
    
    for (let iconName in modIcons) {
        modIconList.push(iconName);
    }
    
    // Сортируем по алфавиту
    modIconList.sort();
    return modIconList;
};

// Функция для получения названий всех категорий (кроме Other и Error)
exports.getCategoryNames = function() {
    return exports.iconCategories
        .filter(cat => cat.name !== "Other" && cat.name !== "Error")
        .map(cat => cat.name);
};

// Функция для получения иконок конкретной категории
exports.getIconsForCategory = function(categoryName) {
    for (let category of exports.iconCategories) {
        if (category.name === categoryName) {
            // Для категории Mods возвращаем автоматически собранные иконки модов
            if (categoryName === "Mods") {
                return exports.getModIconsCategory();
            }
            // Для категории Other возвращаем автоматически собранные иконки
            if (categoryName === "Other") {
                return exports.getOtherIcons();
            }
            return category.icons;
        }
    }
    return [];
};

// Функция для получения иконки категории
exports.getCategoryIcon = function(categoryName) {
    for (let category of exports.iconCategories) {
        if (category.name === categoryName) {
            return category.icon;
        }
    }
    return null;
};

// Функция для получения иконки ошибки (из категории Error)
exports.getErrorIcon = function() {
    const errorCategory = exports.iconCategories.find(cat => cat.name === "Error");
    if (errorCategory && errorCategory.icons.length > 0) {
        return errorCategory.icons[0];
    }
    return "none";
};

// Функция для проверки существует ли категория
exports.isErrorCategory = function(categoryName) {
    return categoryName === "Error";
};

// Функция для проверки является ли категория Other
exports.isOtherCategory = function(categoryName) {
    return categoryName === "Other";
};
