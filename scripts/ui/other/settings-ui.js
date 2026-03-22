Events.on(EventType.ClientLoadEvent, () => {
    // === МИГРАЦИЯ: конвертируем строки в Integer для sliderPref ===
    // Используем прямой вызов Java метода для гарантированной конвертации
    try {
        const intSettings = [
            "eui-UIOpacity", "eui-SchematicsTableAlpha", "eui-UnitsTableAlpha",
            "eui-SchematicsTableRows", "eui-SchematicsTableColumns", "eui-SchematicsTableButtonSize",
            "eui-EfficiencyTimer", "eui-playerCursorStyle", "eui-maxZoom", "eui-action-delay"
        ];
        intSettings.forEach(key => {
            let val = Core.settings.get(key, null);
            if (val !== null && typeof val === 'string') {
                let intVal = parseInt(val);
                if (!isNaN(intVal)) {
                    // Используем прямой вызов put с явным Integer
                    Core.settings.put(key, new java.lang.Integer(intVal));
                }
            }
        });
        
        // X/Y: конвертируем Integer в строки для textPref
        ["eui-SchematicsTableX", "eui-SchematicsTableY"].forEach(key => {
            let val = Core.settings.get(key, null);
            if (val !== null && typeof val === 'number') {
                Core.settings.put(key, String(val));
            }
        });
    } catch(e) {
        // Игнорируем ошибки
    }
    // === КОНЕЦ МИГРАЦИИ ===

    Vars.ui.settings.addCategory("@eui.name", t => {
        t.row();
        t.button(Core.bundle.get("eui.name"), Styles.defaultt, () => extendedUIDialogSettings.show()).width(240).height(50);
    })

    const extendedUIDialogSettings = new BaseDialog(Core.bundle.get("eui.settings"));
    extendedUIDialogSettings.addCloseButton();
    extendedUIDialogSettings.buttons.defaults().size(240, 60);

    // Используем модуль импорта/экспорта из global.eui (загружен в main.js)
    const schematicsIO = global.eui.schematicsIO;

    extendedUIDialogSettings.cont.pane((() => {

        let contentTable;
        // Используем актуальный класс для v7+
        contentTable = new SettingsMenuDialog.SettingsTable();

        contentTable.checkPref("eui-showPowerBar", true);
        contentTable.checkPref("eui-showFactoryProgress", true);
        contentTable.checkPref("eui-showUnitBar", true);
        contentTable.checkPref("eui-ShowUnitTable", true);
        contentTable.checkPref("eui-ShowBlockInfo", true);
        contentTable.checkPref("eui-ShowAlerts", true);
        contentTable.checkPref("eui-ShowAlertsBottom", false);
        contentTable.checkPref("eui-ShowResourceRate", false);
        contentTable.checkPref("eui-ShowSchematicsTable", true);
        contentTable.checkPref("eui-ShowSchematicsPreview", true);

        // Настройка мини-карты (по умолчанию включена)
        contentTable.checkPref("eui-showMinimap", true);

        // Настройка прозрачности UI элементов
        contentTable.sliderPref("eui-UIOpacity", 100, 20, 100, 5, i => i + "%");
        contentTable.sliderPref("eui-SchematicsTableAlpha", 100, 0, 100, 5, i => i + "%");
        contentTable.sliderPref("eui-UnitsTableAlpha", 100, 0, 100, 5, i => i + "%");

        contentTable.sliderPref("eui-SchematicsTableRows", 4, 2, 20, 1, i => i);
        contentTable.sliderPref("eui-SchematicsTableColumns", 5, 4, 16, 1, i => i);
        contentTable.sliderPref("eui-SchematicsTableButtonSize", 30, 20, 80, 2, i => i);

        // Конвертируем старые числовые настройки в строковые для textPref
        // По умолчанию таблица схем находится в правом верхнем углу (зона мини-карты)
        // offsetY=160 чтобы таблица не перекрывала меню выбора построек (PlacementFragment)
        let xValue = Core.settings.get("eui-SchematicsTableX", 10);
        let yValue = Core.settings.get("eui-SchematicsTableY", 160);
        if (typeof xValue === 'number') {
            Core.settings.put("eui-SchematicsTableX", String(xValue));
        }
        if (typeof yValue === 'number') {
            Core.settings.put("eui-SchematicsTableY", String(yValue));
        }

        contentTable.textPref("eui-SchematicsTableX", "10");
        contentTable.textPref("eui-SchematicsTableY", "160");
        contentTable.checkPref("eui-ShowEfficiency", false);
        contentTable.sliderPref("eui-EfficiencyTimer", 15, 10, 180, 5, i => i);
        contentTable.checkPref("eui-TrackPlayerCursor", false);
        contentTable.sliderPref("eui-playerCursorStyle", 7, 1, 7, 1, i => i);
        contentTable.checkPref("eui-ShowOwnCursor", false);
        contentTable.checkPref("eui-TrackLogicControl", false);
        contentTable.sliderPref("eui-maxZoom", 10, 1, 10, 1, i => i);
        contentTable.checkPref("eui-makeMineble", false);
        contentTable.checkPref("eui-showInteractSettings", true);
        contentTable.sliderPref("eui-action-delay", 500, 0, 3000, 25, i => i + " ms");
        if (!Vars.mobile) {
            contentTable.checkPref("eui-DragBlock", false);
            contentTable.checkPref("eui-DragPathfind", false);
        }

        // Кнопки импорта/экспорта таблицы схем
        contentTable.row();
        contentTable.add("@schematics-table.import-export").color(Pal.accent).fillX().pad(8);
        contentTable.row();
        contentTable.table(null, buttons => {
            buttons.defaults().size(200, 50).pad(4);
            buttons.button("@schematics-table.export", Icon.upload, () => schematicsIO.showExportDialog());
            buttons.button("@schematics-table.import", Icon.download, () => schematicsIO.showImportDialog());
        }).fillX();

        return contentTable;
    })());

    // Применяем настройку при загрузке
    applyMinimapSetting(Core.settings.getBool("eui-showMinimap", true));

    // Проверяем изменение настройки в update
    var lastMinimapSetting = Core.settings.getBool("eui-showMinimap", true);
    Events.run(Trigger.update, () => {
        const currentSetting = Core.settings.getBool("eui-showMinimap", true);
        if (currentSetting !== lastMinimapSetting) {
            applyMinimapSetting(currentSetting);
            lastMinimapSetting = currentSetting;
        }
    });

    global.eui.settings = extendedUIDialogSettings;
});

// Функция для применения настройки мини-карты
// Используем встроенную настройку игры "minimap"
function applyMinimapSetting(show) {
    // Если show = true (включено в настройках) - включаем мини-карту
    // Если show = false (отключено) - выключаем мини-карту
    Core.settings.put("minimap", show);
}
