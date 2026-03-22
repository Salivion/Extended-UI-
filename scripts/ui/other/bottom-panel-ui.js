const iconsUtil = require("extended-ui/utils/icons");
const coreUnits = require("extended-ui/units/core-units");
const blacklist = require("extended-ui/units/blacklist");
const euiEvents = require("extended-ui/utils/event/events");

// ============================================
// КАТЕГОРИИ ЮНИТОВ (как в icon-categories-config)
// ============================================
const unitCategories = [
    {
        name: "Mech", // Кинжалы 
        units: ["dagger", "mace", "fortress", "scepter", "reign"]
    },
    {
        name: "Mech2", // Кинжалы зелёнка 
        units: ["nova", "pulsar", "quasar", "vela", "corvus"]
    },
    {
        name: "Legs", // Пауки серпуло 
        units: ["crawler", "atrax", "spiroct", "arkyid", "toxopid"]
    },
    {
        name: "Air", // Флаеры
        units: ["flare", "horizon", "zenith", "antumbra", "eclipse"]
    },
    {
        name: "Air2", // Флаеры зелёнка
        units: ["mono", "poly", "mega", "quad", "oct"]
    },
    {
        name: "Naval", // Морские 
        units: ["risso", "minke", "bryde", "sei", "omura"]
    },
    {
        name: "Naval", // Морские зелёнка
        units: ["retusa", "oxynoe", "cyerce", "aegires", "navanax"]
    },
    {
        name: "Tank", // Танки эрекир
        units: ["stell", "locus", "precept", "vanquish", "conquer"]
    },
    {
        name: "Hover", // Летучки эрекир 
        units: ["elude", "avert", "obviate", "quell", "disrupt"]
    },
    {
        name: "spider", // Пауки эрекир 
        units: ["merui", "cleroi", "anthicus", "tecta", "collaris"]
    },
    {
        name: "Neoplasm",
        units: ["renale", "latum"]
    },
    {
        name: "Core Units",
        units: ["alpha", "beta", "gamma", "evoke", "incite", "emanate"]
    }
];

let selectUnitDialog;
let contentTable = null;
let isBuilded = false;
let showSettings = false;
let schemSelection = false;
let interactCore = Core.settings.getBool("eui-interact-core", false);
let fillBuildings = Core.settings.getBool("eui-auto-fill", false);
let selectedUnit = Core.settings.getString("eui-auto-unit");

euiEvents.on(euiEvents.eventType.schemSelectionEnd, () => schemSelection = false);

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (должны быть объявлены ПЕРЕД использованием)
// ============================================

// Проверка должен ли юнит отображаться
function shouldShowUnit(unitName) {
    if (unitName == "block") return false;
    if (coreUnits.includes(unitName)) return false;
    if (blacklist.includes(unitName)) return false;
    return true;
}

function isRebuildNeeded() {
    if (!isBuilded) return true;
    return false;
}

function rebuildTable() {
    clearTable();
    buildTable();
}

function buildTable() {
    if (!contentTable) return;
    isBuilded = true;

    contentTable.button(Icon.upOpen, Styles.selecti, () => {
        showSettings = !showSettings;
        rebuildTable();
    }).width(64).height(16).marginBottom(3);
    if (!showSettings) return;

    contentTable.row();
    const buttonTable = contentTable.table().get();
    buttonTable.defaults().size(32);
    buttonTable.button(iconsUtil.getByName("core-nucleus"), Styles.clearTogglei, () => {
        interactCore = !interactCore;
        Core.settings.put("eui-interact-core", interactCore);
    }).update(b => {
        b.setChecked(interactCore);
    }).get().resizeImage(32*0.8);

    buttonTable.button(Icon.box, Styles.clearTogglei, () => {
        fillBuildings = !fillBuildings;
        Core.settings.put("eui-auto-fill", fillBuildings);
    }).update(b => {
        b.setChecked(fillBuildings);
    }).get().resizeImage(32*0.8);

    buttonTable.button(iconsUtil.getByName(selectedUnit), Styles.cleari, () => {
        selectUnitDialog.show();
    }).get().resizeImage(32*0.8);

    if (!Vars.mobile) {
        buttonTable.button(Icon.save, Styles.clearTogglei, () => {
            schemSelection = !schemSelection;
            euiEvents.emit(euiEvents.eventType.schemSelectionButtonPressed, schemSelection);
        }).update(b => {
            b.setChecked(schemSelection);
        }).get().resizeImage(32*0.8);
    }
}

function clearTable() {
    if (!isBuilded) return;
    contentTable.clearChildren();
    isBuilded = false;
}

function tableVisibility() {
    return Vars.ui.hudfrag.shown && isBuilded;
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

global.eui.registerUpdate(() => {
    if (!Core.settings.getBool("eui-showInteractSettings", true)) {
        if (isBuilded) {
            clearTable();
        }
        return;
    };
    if (isRebuildNeeded()) rebuildTable();
});

Events.on(ClientLoadEvent, () => {
    Vars.ui.hudGroup.fill(null, t => {
        contentTable = t.table().get();
        t.center().bottom();
        t.pack();
    });
    contentTable.visibility = () => tableVisibility();

    const size = 568;

    selectUnitDialog = new BaseDialog(Core.bundle.get("schematics-table.dialog.change-image.title"));
    selectUnitDialog.addCloseButton();

    // Получаем иконки юнитов
    const unitSprites = iconsUtil.getUnitSprites();
    unitSprites['cancel'] = iconsUtil.getByName("cancel");

    // Таблица для юнитов (будет инициализирована в ScrollPane)
    let unitTable = null;

    // Функция для отображения юнитов категории
    function showCategory(categoryIndex) {
        if (!unitTable) return;

        unitTable.clear();

        let r = 0;
        let unitsToShow = [];

        // Собираем юнитов для отображения
        if (categoryIndex === -1) {
            // Все юниты
            for (let [unitName, unitImage] of Object.entries(unitSprites)) {
                if (shouldShowUnit(unitName)) {
                    unitsToShow.push({ name: unitName, image: unitImage });
                }
            }
            // Сортируем по алфавиту
            unitsToShow.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Юниты конкретной категории
            const categoryUnits = unitCategories[categoryIndex].units;
            for (let unitName of categoryUnits) {
                if (unitSprites[unitName] && shouldShowUnit(unitName)) {
                    unitsToShow.push({ name: unitName, image: unitSprites[unitName] });
                }
            }
        }

        // Создаём кнопки
        for (let unitData of unitsToShow) {
            const setted_name = unitData.name;
            let imageButton = unitTable.button(unitData.image, Styles.cleari, () => {
                Core.settings.put("eui-auto-unit", setted_name);
                selectedUnit = setted_name;
                rebuildTable();
                selectUnitDialog.hide();
            }).size(48).pad(4).get();
            imageButton.resizeImage(48*0.8);

            // Тултипы не поддерживаются в этой версии Mindustry
            // imageButton.setTextTooltip(unitData.name); // ❌ Не существует

            if (++r % 10 == 0) unitTable.row();
        }
    }

    // ScrollPane с прокруткой - используем конструктор напрямую БЕЗ стиля
    const scrollPane = new ScrollPane(null);
    selectUnitDialog.cont.add(scrollPane).size(size, size);

    // Таблица внутри ScrollPane
    const scrollContent = new Table();
    scrollPane.setWidget(scrollContent);

    // Таблица для категорий
    const categoryTable = scrollContent.table().get();
    categoryTable.defaults().size(40).pad(2);

    // Кнопка "Все"
    categoryTable.button(Icon.list, Styles.cleari, () => showCategory(-1))
        .get().resizeImage(40*0.8);

    // Кнопки категорий
    for (let i = 0; i < unitCategories.length; i++) {
        let cat = unitCategories[i];
        let catIndex = i;

        // Находим иконку для категории
        let catIcon = iconsUtil.getByName(cat.units[0] || "cancel");

        categoryTable.button(catIcon, Styles.cleari, () => showCategory(catIndex))
            .get().resizeImage(40*0.8);

        if ((i + 1) % 5 == 0) categoryTable.row();
    }

    categoryTable.row();

    // Разделитель
    scrollContent.add().height(8).row();

    // Таблица для юнитов
    unitTable = scrollContent.table().get();

    // Показываем все юниты по умолчанию
    showCategory(-1);
});
