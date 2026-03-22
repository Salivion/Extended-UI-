// Предотвращаем повторную загрузку мода
if (global.eui && global.eui._loaded) {
    return;
}

if (!global.eui) {
    global.eui = {};
}
global.eui._loaded = true;

// Загружаем центральный обработчик ПЕРВЫМ
require("extended-ui/utils/event/central-handler");

// Импортируем Java классы для работы с ZIP
global.eui.ZipFi = Packages.java.util.zip.ZipFile;
global.eui.ZipOutputStream = Packages.java.util.zip.ZipOutputStream;
global.eui.ZipEntry = Packages.java.util.zip.ZipEntry;

// Загружаем зависимости
global.eui.relativeValue = require("extended-ui/utils/relative-value");
global.eui.drawTasks = require("extended-ui/utils/draw/draw-tasks");
global.eui.iconsUtil = require("extended-ui/utils/icons");

// Загружаем модуль schematics-table-ui для экспорта функций сброса скролла
const schematicsTableUI = require("extended-ui/ui/other/schematics-table-ui");
global.eui.schematicsTableUI = schematicsTableUI;

// Загружаем модуль импорта/экспорта таблицы схем
const schematicsIO = require("extended-ui/ui/other/schematics-import-export");
global.eui.schematicsIO = schematicsIO;

// Базовые модули
const coreModules = [
    "utils/polyfill",
    "utils/event/drag",
    "utils/event/events",
    "utils/draw/build-plan",
    "utils/formatting",

    "input/core-drag",
    "input/conveyor",

    "interact/auto-fill",
    "interact/auto-unit",
    "interact/schematic-selector",
    "interact/interact-timer",

    "ui/other/settings-ui",
    "ui/other/bottom-panel-ui",
    "ui/other/schematics-table-ui",
    "ui/other/power-ui",
    "ui/other/resource-rate-ui",
    "ui/blocks/block-info-ui",
    "ui/blocks/efficiency",
    "ui/blocks/progress-bar",
    "ui/units/draw-cycle",
    "ui/units/units-table-ui",
    "ui/alerts/losing-support",
    "ui/alerts/under-attack",

    "other/extend-zoom",
    "other/mine",
];

// Загрузка всех модулей
for (let module of coreModules) {
    require("extended-ui/" + module);
}
