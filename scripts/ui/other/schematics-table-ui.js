const iconsUtil = require("extended-ui/utils/icons");
const iconConfig = require("extended-ui/ui/other/icon-categories-config");

const USE_ICON_CATEGORIES = iconConfig.useIconCategories;
const ICONS_PER_ROW = iconConfig.iconsPerRow || 10;

// Используем улучшенную функцию getIconDrawable из iconsUtil
// Она поддерживает: UI иконки, спрайты контента, все команды (включая green/blue), иконки модов
const getIconDrawable = iconsUtil.getIconDrawable;

let isBuilded = false;
let contentTable;
let previewTable;
let setCategoryNameDialog;

let currentCategory = 0;
let lastCategory = 0;

let schematicButtonSize;
let categoryButtonSize;

let rows;
let columns;

let oldRows;
let oldColumns;
let oldSize;

let hovered = null;

//for mobile version
let lastTaped;
let lastTapTime;

// Для сохранения позиции скролла в диалоге выбора иконок (как в ModsDialog.java)
var iconScrollY = 0;

Events.on(ClientLoadEvent, () => {
    // Создаём контейнер для превью схем
    Vars.ui.hudGroup.fill(null, t => {
        previewTable = t.table(Styles.black3).get();
        previewTable.visibility = () => previewTableVisibility();
        // Применяем прозрачность из настроек
        previewTable.update(() => {
            let alpha = Core.settings.getInt("eui-SchematicsTableAlpha", 100) / 100;
            previewTable.color.a = alpha;
        });
        t.center();
        t.pack();
    });

    setCategoryNameDialog = new BaseDialog(Core.bundle.get("schematics-table.dialog.change-cathegory-name.title"));
    setCategoryNameDialog.addCloseButton();
    setCategoryNameDialog.cont.pane(table => {
        table.field(null, text => {
            if (!text) return;

            Core.settings.put("category" + currentCategory + "name", text);
            rebuildTable();
        }).growX();
    }).size(320, 320);
});

// Используем центральный обработчик вместо Events.run
global.eui.registerUpdate(() => {
    if (!Core.settings.getBool("eui-ShowSchematicsTable", true)) {
        if (isBuilded) {
            clearTable();
        }
        return;
    }

    rows = Core.settings.getInt("eui-SchematicsTableRows", 4);
    columns = Core.settings.getInt("eui-SchematicsTableColumns", 5);
    schematicButtonSize = Core.settings.getInt("eui-SchematicsTableButtonSize", 30);
    categoryButtonSize = schematicButtonSize + 2;

    if (!contentTable) {
        setMarker();
    }

    if (isRebuildNeeded()) {
        rebuildTable();
    }

    // Обновляем позицию таблицы при изменении настроек
    updatePosition();

    if (hovered && contentTable.hasMouse()) {
        rebuildPreviewTable();
    } else {
        hovered = null;
    }
});

function showEditSchematicButtonDialog(currentCategory, column, row) {
    const size = Vars.mobile ? 320 : 560
    const schematicString = getSchematicString(currentCategory, column, row);
    const editSchematicButtonDialog = new BaseDialog(Core.bundle.get("schematics-table.dialog.edit-schematic-button.title"));
    editSchematicButtonDialog.addCloseButton();

    addEditImageTable(editSchematicButtonDialog, schematicString + "image", size);
    editSchematicButtonDialog.cont.row();
    addEditSchematicTable(editSchematicButtonDialog, schematicString);

    editSchematicButtonDialog.show();
}

function showEditImageDialog(name) {
    const size = Vars.mobile ? 320 : 640
    const editImageDialog = new BaseDialog(Core.bundle.get("schematics-table.dialog.change-image.title"));
    editImageDialog.addCloseButton();

    addEditImageTable(editImageDialog, name, size);

    editImageDialog.show();
}

function addEditImageTable(dialog, name, size) {
    // Получаем иконки из конфига
    const categories = iconConfig.iconCategories;

    dialog.cont.pane(table => {
        // Отображаем категории списком сверху вниз
        for (let category of categories) {
            // Пропускаем категорию Error — она только для обработки ошибок
            if (iconConfig.isErrorCategory(category.name)) continue;

            // Получаем иконки для категории (для Other и Mods - автоматически собранные)
            let iconsToDisplay;
            if (iconConfig.useIconCategories) {
                if (category.name === "Other") {
                    // Для категории Other получаем автоматически собранные иконки
                    iconsToDisplay = iconConfig.getOtherIcons();
                } else if (category.name === "Mods") {
                    // Для категории Mods получаем иконки из модов
                    iconsToDisplay = iconConfig.getModIconsCategory();
                } else {
                    iconsToDisplay = category.icons;
                }
            } else {
                iconsToDisplay = iconConfig.getAllCategoryIcons();
            }

            // Пропускаем категорию если в ней пусто (кроме Other и Mods - они могут быть заполнены динамически)
            if (iconsToDisplay.length === 0 && category.name !== "Other" && category.name !== "Mods") continue;

            // Загружаем состояние сворачивания из настроек
            const collapsedKey = "eui-iconCategory-collapsed-" + category.name;
            let isCollapsed = Core.settings.getBool(collapsedKey, false);

            // Создаём таблицу с иконками для collapser
            const iconsContent = new Table();
            let r = 0;

            for (let iconName of iconsToDisplay) {
                const iconDrawable = getIconDrawable(iconName);

                // Создаём кнопку с правильной областью видимости
                (function(currentIconName) {
                    let imageButton = iconsContent.button(iconDrawable, Styles.cleari, () => {
                        Core.settings.put(name, currentIconName);
                        Vars.ui.announce(Core.bundle.get("schematics-table.dialog.change-image.setted-announce-text") + " " + currentIconName);
                        rebuildTable();
                    }).size(48).pad(4).get();
                    imageButton.resizeImage(48 * 0.8);
                })(iconName);

                if (++r % ICONS_PER_ROW == 0) iconsContent.row();
            }

            // Заголовок категории с кнопкой сворачивания
            table.row();
            table.table(null, headerTable => {
                headerTable.left().defaults().left();

                // Таблица для иконки и названия
                headerTable.table(null, iconNameTable => {
                    const categoryIconName = category.icon || "info";
                    const categoryIcon = getIconDrawable(categoryIconName);
                    iconNameTable.image(categoryIcon).size(48).pad(4).padLeft(8);
                    iconNameTable.add(category.name).color(Color.lightGray).padLeft(8).padRight(8);
                });

                // Горизонтальная линия
                headerTable.image(Tex.whiteui).color(Color.gray).height(3).growX().pad(4);

                // Кнопка сворачивания
                headerTable.button(Icon.downOpen, Styles.emptyi, () => {
                    isCollapsed = !isCollapsed;
                    Core.settings.put(collapsedKey, isCollapsed);
                }).update(t => {
                    const img = t.getChildren().get(0);
                    if (img != null && img instanceof Image) {
                        img.setDrawable(isCollapsed ? Icon.upOpen : Icon.downOpen);
                    }
                    t.setChecked(isCollapsed);
                }).size(40).padLeft(8).padRight(8);
            }).growX().padTop(8).padBottom(4);

            // Collapser с иконками
            table.row();
            const wrapperTable = new Table();
            wrapperTable.collapser(collapserTable => {
                collapserTable.left().add(iconsContent);
            }, () => isCollapsed);

            table.add(wrapperTable).growX();
        }
    }).size(size*2, size).scrollX(false).update(s => {
        // Сохраняем позицию скролла в переменную (как в ModsDialog.java)
        iconScrollY = s.getScrollY();
    }).get().setScrollYForce(iconScrollY);
}

function addEditSchematicTable(dialog, name) {
    let text = Core.bundle.get("schematics-table.dialog.change-schematic.title")
    dialog.cont.pane(table => {
        table.labelWrap(text).growX();
        table.row();
        table.field(Core.settings.getString(name, ""), text => {
            Core.settings.put(name, text);
            rebuildTable();
        }).growX();
    }).size(Core.graphics.getWidth()/2, 80);
}

function setMarker() {
    // Создаём фиксированную таблицу схем в правом верхнем углу (зона мини-карты)
    // Таблица независима от мини-карты и работает даже если мини-карта выключена
    // Добавляем таблицу НА ЗАДНИЙ ПЛАН чтобы она НЕ перекрывала меню выбора построек (PlacementFragment)
    contentTable = new Table(Styles.black3);
    contentTable.name = "eui-schematics-table";
    // Таблица видна только когда включена в настройках И когда HUD не скрыт (клавиша C)
    contentTable.visibility = () => isBuilded && Vars.ui.hudfrag.shown;

    // Сначала добавляем таблицу в hudGroup (чтобы она получила сцену)
    Vars.ui.hudGroup.addChild(contentTable);
    // Затем перемещаем на задний план (нижний слой)
    contentTable.toBack();

    // Позиционируем таблицу в правом верхнем углу с учётом настроек
    updatePosition();
    contentTable.pack();
}

function updatePosition() {
    if (!contentTable) return;

    // Получаем значения из настроек (могут быть int или String)
    let offsetXRaw = Core.settings.get("eui-SchematicsTableX", 10);
    let offsetYRaw = Core.settings.get("eui-SchematicsTableY", 160);

    // Преобразуем в строку если это число
    let offsetXStr = typeof offsetXRaw === 'number' ? String(offsetXRaw) : offsetXRaw;
    let offsetYStr = typeof offsetYRaw === 'number' ? String(offsetYRaw) : offsetYRaw;

    // Парсим числа, игнорируя "px" и другие символы
    let offsetX = parseInt(offsetXStr) || 10;
    let offsetY = parseInt(offsetYStr) || 160;

    // Ограничиваем значения
    offsetX = Math.max(0, Math.min(offsetX, 5000));
    offsetY = Math.max(0, Math.min(offsetY, 5000));

    // Позиционируем от правого верхнего угла (зона мини-карты)
    // offsetX - отступ справа, offsetY - отступ сверху (чтобы не перекрывать меню выбора построек)
    contentTable.setPosition(Core.graphics.width - offsetX, Core.graphics.height - offsetY, Align.topRight);
}

function isRebuildNeeded() {
    if (!isBuilded) return true;

    if (!oldColumns || !oldRows || !oldSize) {
        oldRows = rows;
        oldColumns = columns;
        oldSize = schematicButtonSize;
    }
    if (rows != oldRows || columns != oldColumns || oldSize != schematicButtonSize) {
        oldRows = rows;
        oldColumns = columns;
        oldSize = schematicButtonSize;
        return true;
    }

    if (lastCategory != currentCategory) {
        lastCategory = currentCategory;
        return true;
    }

    return false;
}

function rebuildTable() {
    if (!contentTable) return;
    clearTable();
    buildTable();
}

function buildTable() {
    if (!contentTable) return;
    
    const wrapped = contentTable.table().margin(3).get();
    let imageButton;

    const categoryButtonsTable = wrapped.table().get();
    for (let i = 0; i < columns; i++) {
        const index = i;
        imageButton = categoryButtonsTable.button(getCategoryImage(index), Styles.clearTogglei, ()=>{
            currentCategory = index;
        }).update(b => {
            b.setChecked(currentCategory == index);
        }).width(categoryButtonSize).height(categoryButtonSize).tooltip(getCategoryTooltip(index)).get();
        imageButton.resizeImage(categoryButtonSize*0.8);
        if (!Vars.mobile) {
            imageButton.clicked(Packages.arc.input.KeyCode.mouseRight, () => showEditImageDialog("category" + index + "image"));
        } else {
            imageButton.clicked(() => {
                if (mobileDoubleTap("category" + index + "image")) {
                    showEditImageDialog("category" + index + "image");
                    // Clicks on label from the phone impossible? so this is here
                    setCategoryNameDialog.show();
                }
            });
        }
    }

    wrapped.row();
    let categoryLabel = wrapped.labelWrap(getCategoryLabelText()).width(categoryButtonSize*columns).padTop(6).padBottom(6).get();
    categoryLabel.setAlignment(Align.center);
    if (!Vars.mobile) {
        categoryLabel.clicked(Packages.arc.input.KeyCode.mouseRight, () => setCategoryNameDialog.show());
    }

    wrapped.row();
    const schematicButtonsTable = wrapped.table().get();
    for (let i = 0; i < rows; i++) {
        const row = i;
        for (let j = 0; j < columns; j++) {
            const column = j;
            const schematic = findSchematic(currentCategory, column, row);

            imageButton = schematicButtonsTable.button(getSchematicImage(column, row), Styles.defaulti, ()=>{
                if (schematic) Vars.control.input.useSchematic(schematic);
            }).update(b => {
                b.setDisabled(false);
            }).width(schematicButtonSize).height(schematicButtonSize).pad(1).tooltip(getSchematicTooltip(schematic)).get();

            imageButton.resizeImage(schematicButtonSize*0.6);
            imageButton.hovered(() => {
                hovered = schematic;
            });
            if (!Vars.mobile) {
                imageButton.clicked(Packages.arc.input.KeyCode.mouseRight, () => showEditSchematicButtonDialog(currentCategory, column, row));
            } else {
                imageButton.clicked(() => {
                    if (mobileDoubleTap(getSchematicString(currentCategory, column, row))) {
                        showEditSchematicButtonDialog(currentCategory, column, row);
                    }
                });
            }
        }
        schematicButtonsTable.row();
    }

    contentTable.pack();
    isBuilded = true;
}

function clearTable() {
    if (!isBuilded || !contentTable) return;

    Vars.ui.hudGroup.removeChild(contentTable);
    contentTable = null;
    isBuilded = false;
}

function rebuildPreviewTable() {
    previewTable.clearChildren();

    const requirements = hovered.requirements();
    const powerConsumption = hovered.powerConsumption() * 60;
    const powerProduction = hovered.powerProduction() * 60;
    const core = Vars.player.core();

    previewTable.add(new SchematicsDialog.SchematicImage(hovered)).maxSize(800);
    previewTable.row();

    previewTable.table(null, requirementsTable => {
        let i = 0;
        requirements.each((item, amount) => {
            requirementsTable.image(item.uiIcon).left();
            requirementsTable.label(() => {
                if (core == null || Vars.state.rules.infiniteResources || core.items.has(item, amount)) return "[lightgray]" + amount;
                return (core.items.has(item, amount) ? "[lightgray]" : "[scarlet]") + Math.min(core.items.get(item), amount) + "[lightgray]/" + amount;
            }).padLeft(2).left().padRight(4);

            if (++i % 4 == 0) {
                requirementsTable.row();
            }
        });
    });

    previewTable.row();
    
    if (powerConsumption || powerProduction) {
        previewTable.table(null, powerTable => {

            if (powerProduction) {
                powerTable.image(Icon.powerSmall).color(Pal.powerLight).padRight(3);
                powerTable.add("+" + Strings.autoFixed(powerProduction, 2)).color(Pal.powerLight).left();

                if (powerConsumption) {
                    powerTable.add().width(15);
                }
            }

            if (powerConsumption) {
                powerTable.image(Icon.powerSmall).color(Pal.remove).padRight(3);
                powerTable.add("-" + Strings.autoFixed(powerConsumption, 2)).color(Pal.remove).left();
            }
        });
    }
}

function previewTableVisibility() {
    return Core.settings.getBool("eui-ShowSchematicsPreview", true) && Boolean(contentTable) && contentTable.visible && Boolean(hovered);
}

function getCategoryTooltip(categoryId) {
    return Core.settings.getString("category" + categoryId + "name", Core.bundle.get("schematics-table.default-cathegory-tooltip"));
}

function getCategoryLabelText() {
    let defaultText;

    if (Vars.mobile) {
        defaultText = Core.bundle.get("schematics-table.default-cathegory-mobile-name");
    } else {
        defaultText = Core.bundle.get("schematics-table.default-cathegory-desktop-name");
    }

    return Core.settings.getString("category" + currentCategory + "name", defaultText);
}

function getCategoryImage(categoryId) {
    try {
        const imageName = Core.settings.getString("category" + categoryId + "image");
        if (!imageName) return new TextureRegionDrawable(Icon.pencil);
        
        const drawable = getIconDrawable(imageName);
        return drawable != null ? drawable : new TextureRegionDrawable(Icon.pencil);
    } catch (e) {
        return new TextureRegionDrawable(Icon.pencil);
    }
}

function getSchematicImage(column, row) {
    try {
        const imageName = Core.settings.getString(getSchematicString(currentCategory, column, row) + "image");
        if (!imageName) return new TextureRegionDrawable(Icon.pencil);
        
        const drawable = getIconDrawable(imageName);
        return drawable != null ? drawable : new TextureRegionDrawable(Icon.pencil);
    } catch (e) {
        return new TextureRegionDrawable(Icon.pencil);
    }
}

function getSchematicString(category, column, row) {
    return "schematic" + category + "." + column + "." + row;
}

function getSchematicTooltip(schematic) {
    if (schematic) {
        return Core.bundle.get("schematics-table.use-schematic") + " " + schematic.name();
    } else {
        return Core.bundle.get("schematics-table.default-cathegory-desktop-name");
    }
}

function findSchematic(category, column, row) {
    let name = Core.settings.getString(getSchematicString(category, column, row));
    let schem = null;
	Vars.schematics.all().each((s) => {
		if(s.name() == name) {
			schem = s;
		}
	});
    return schem;
}

function mobileDoubleTap(name) {
    if (lastTaped == name && Date.now() - lastTapTime < 250) {
        return true;
    } else {
        lastTaped = name;
        lastTapTime = Date.now();
        return false;
    }
}

// ============================================
// Экспорт функций для внешнего доступа
// ============================================

/**
 * Сбросить сохранённую позицию скролла для диалога выбора иконок
 * @param {string} name - имя настройки (например "schematic0.0.0image")
 */
exports.resetScrollPosition = function(name) {
    const scrollPosKey = "eui-iconScrollPos-" + name;
    Core.settings.remove(scrollPosKey);
}

/**
 * Сбросить все сохранённые позиции скролла
 */
exports.resetAllScrollPositions = function() {
    // Находим все ключи с позициями скролла
    const settings = Core.settings.getJson();
    for (let key in settings) {
        if (key.startsWith("eui-iconScrollPos-")) {
            Core.settings.remove(key);
        }
    }
}

/**
 * Перестроить таблицу схем (для использования после импорта)
 */
exports.rebuildTable = function() {
    try {
        // Вызываем локальную функцию rebuildTable
        if (isBuilded && contentTable) {
            rebuildTable();
        }
    } catch (e) {
    }
}
