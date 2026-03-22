// ============================================
// Импорт/Экспорт настроек таблицы схем
// ============================================

/**
 * Экспорт настроек таблицы схем в ZIP архив
 */
exports.exportSchematicsTable = function(outputFile) {
    try {
        // Создаём временную директорию
        const tmpDirectory = Core.files.local("extended-ui-temp");
        if (!tmpDirectory.exists()) {
            tmpDirectory.mkdirs();
        }

        const exportDir = tmpDirectory.child("schematics-export");
        if (exportDir.exists()) {
            exportDir.deleteDirectory();
        }
        exportDir.mkdirs();

        // 1. Собираем все настройки в JSON
        const settings = {
            rows: Core.settings.getInt("eui-SchematicsTableRows", 4),
            columns: Core.settings.getInt("eui-SchematicsTableColumns", 5),
            buttonSize: Core.settings.getInt("eui-SchematicsTableButtonSize", 30),
            // X/Y - строковые настройки (textPref)
            positionX: parseInt(Core.settings.getString("eui-SchematicsTableX", "10")) || 10,
            positionY: parseInt(Core.settings.getString("eui-SchematicsTableY", "160")) || 160,
            alpha: Core.settings.getInt("eui-SchematicsTableAlpha", 100),
            showPreview: Core.settings.getBool("eui-ShowSchematicsPreview", true),
            categories: []
        };

        for (let i = 0; i < 10; i++) {
            const categoryName = Core.settings.getString("category" + i + "name", "");
            const categoryImage = Core.settings.getString("category" + i + "image", "");
            if (categoryName || categoryImage) {
                settings.categories.push({ id: i, name: categoryName, image: categoryImage });
            }
        }

        settings.schematics = [];
        for (let cat = 0; cat < 10; cat++) {
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 10; col++) {
                    const schematicName = Core.settings.getString("schematic" + cat + "." + col + "." + row, "");
                    const schematicImage = Core.settings.getString("schematic" + cat + "." + col + "." + row + "image", "");
                    if (schematicName || schematicImage) {
                        settings.schematics.push({ category: cat, column: col, row: row, schematicName: schematicName, schematicImage: schematicImage });
                    }
                }
            }
        }

        // 2. Сохраняем JSON
        const settingsFile = exportDir.child("settings.json");
        settingsFile.writeString(JSON.stringify(settings, null, 2));

        // 3. Копируем схемы
        const schemesDir = exportDir.child("schemes");
        schemesDir.mkdirs();

        const exportedSchematics = [];
        let exportedCount = 0;
        let notFoundCount = 0;

        for (let schematic of settings.schematics) {
            if (schematic.schematicName && exportedSchematics.indexOf(schematic.schematicName) === -1) {
                let found = false;
                Vars.schematics.all().each(s => {
                    if (s.name() && s.name() === schematic.schematicName) {
                        try {
                            const schemeFile = schemesDir.child(schematic.schematicName + ".msch");
                            Vars.schematics.write(s, schemeFile);
                            exportedSchematics.push(schematic.schematicName);
                            exportedCount++;
                            found = true;
                        } catch (e) {
                        }
                    }
                });
                if (!found) notFoundCount++;
            }
        }

        // 4. Создаём ZIP
        const fos = outputFile.write(false, 2048);
        const zos = new Packages.java.util.zip.ZipOutputStream(fos);
        let fileCount = 0;

        function addFilesToZip(dir, zipPath) {
            const files = dir.list();
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                try {
                    const relativePath = zipPath + f.name();
                    if (f.isDirectory()) {
                        zos.putNextEntry(new Packages.java.util.zip.ZipEntry(relativePath + "/"));
                        zos.closeEntry();
                        addFilesToZip(f, relativePath + "/");
                    } else {
                        zos.putNextEntry(new Packages.java.util.zip.ZipEntry(relativePath));
                        const bytes = f.readBytes();
                        zos.write(bytes, 0, bytes.length);
                        zos.closeEntry();
                        fileCount++;
                    }
                } catch (e) {
                }
            }
        }

        addFilesToZip(exportDir, "");
        zos.close();
        fos.close();

        // 5. Очищаем
        exportDir.deleteDirectory();

    } catch (e) {
        throw e;
    }
};

/**
 * Импорт настроек таблицы схем из ZIP архива
 */
exports.importSchematicsTable = function(inputFile, createBackup) {
    try {
        // 1. Создаём backup
        if (createBackup) {
            try {
                const timestamp = new Date().getTime();
                const backupFile = Core.files.local("extended-ui-schematics-backup-" + timestamp + ".zip");
                exports.exportSchematicsTable(backupFile);
            } catch (e) {
            }
        }

        // 2. Распаковываем ZIP
        const dest = Core.files.local("extended-ui-import.zip");
        inputFile.copyTo(dest);

        if (!dest.exists()) {
            dest.delete();
            throw new Error("Failed to copy ZIP file.");
        }

        const zipped = new Packages.arc.files.ZipFi(dest);

        // 3. Читаем settings.json
        const settingsFile = zipped.child("settings.json");
        if (!settingsFile.exists()) {
            dest.delete();
            throw new Error("Invalid export - settings.json missing.");
        }

        const jsonText = settingsFile.readString();
        const settings = JSON.parse(jsonText);

        // 4. Восстанавливаем настройки через Java Reflection
        const settingsObj = Core.settings;
        const putMethod = settingsObj.getClass().getMethod("put", [java.lang.String, java.lang.Object]);

        // Конвертируем числа в Integer через Java
        // JSON.parse возвращает числа как JavaScript Number (Double), поэтому используем Math.floor + new Integer
        putMethod.invoke(settingsObj, ["eui-SchematicsTableRows", new java.lang.Integer(Math.floor(settings.rows || 4))]);
        putMethod.invoke(settingsObj, ["eui-SchematicsTableColumns", new java.lang.Integer(Math.floor(settings.columns || 5))]);
        putMethod.invoke(settingsObj, ["eui-SchematicsTableButtonSize", new java.lang.Integer(Math.floor(settings.buttonSize || 30))]);
        // X/Y - строковые настройки (textPref)
        putMethod.invoke(settingsObj, ["eui-SchematicsTableX", String(Math.floor(settings.positionX || 10))]);
        putMethod.invoke(settingsObj, ["eui-SchematicsTableY", String(Math.floor(settings.positionY || 160))]);
        putMethod.invoke(settingsObj, ["eui-SchematicsTableAlpha", new java.lang.Integer(Math.floor(settings.alpha || 100))]);
        putMethod.invoke(settingsObj, ["eui-ShowSchematicsPreview", java.lang.Boolean.valueOf(settings.showPreview !== undefined ? settings.showPreview : true)]);

        if (settings.categories) {
            let catCount = 0;
            for (let cat of settings.categories) {
                if (cat.name) Core.settings.put("category" + cat.id + "name", cat.name);
                if (cat.image) Core.settings.put("category" + cat.id + "image", cat.image);
                catCount++;
            }
        }

        // 5. Импортируем схемы с проверкой дубликатов
        const schemesDir = zipped.child("schemes");
        let importedCount = 0;
        let failedCount = 0;
        let duplicateCount = 0;

        if (schemesDir.exists()) {
            // Сначала получаем все существующие схемы для проверки дубликатов
            let existingSchematics = {};
            Vars.schematics.all().each(s => {
                if (s && s.name()) {
                    existingSchematics[s.name()] = true;
                }
            });

            schemesDir.walk(f => {
                if (f.extEquals("msch")) {
                    try {
                        const schematic = Vars.schematics.read(f);
                        if (schematic && schematic.name()) {
                            // Проверяем, есть ли уже схема с таким именем
                            let exists = false;
                            Vars.schematics.all().each(s => {
                                if (s && s.name() && s.name() === schematic.name()) {
                                    exists = true;
                                }
                            });

                            if (!exists) {
                                // Добавляем схему
                                Vars.schematics.add(schematic);
                                importedCount++;
                            } else {
                                duplicateCount++;
                            }
                        }
                    } catch (e) {
                        failedCount++;
                    }
                }
            });
        }

        // 6. Восстанавливаем привязки
        if (settings.schematics) {
            let bindCount = 0;
            for (let s of settings.schematics) {
                if (s.schematicName) {
                    Core.settings.put("schematic" + s.category + "." + s.column + "." + s.row, s.schematicName);
                    bindCount++;
                }
                if (s.schematicImage) {
                    Core.settings.put("schematic" + s.category + "." + s.column + "." + s.row + "image", s.schematicImage);
                }
            }
        }

        // 7. Сохраняем все схемы в файл
        try {
            Vars.schematics.save();
        } catch (e) {
        }

        // 8. Обновляем UI таблицы схем если она есть
        try {
            if (global.eui && global.eui.schematicsTableUI && global.eui.schematicsTableUI.rebuildTable) {
                global.eui.schematicsTableUI.rebuildTable();
            }
        } catch (e) {
        }

        // 9. Очищаем
        dest.delete();

    } catch (e) {
        throw e;
    }
};

/**
 * Показать диалог экспорта
 */
exports.showExportDialog = function() {
    try {
        Vars.platform.showFileChooser(false, "zip", file => {
            try {
                exports.exportSchematicsTable(file);
                Vars.ui.showInfoFade("@schematics-table.export.success");
            } catch (e) {
                Vars.ui.showErrorMessage("Export failed\n" + e.message);
            }
        });
    } catch (e) {
        Vars.ui.showErrorMessage("Failed: " + e.message);
    }
};

/**
 * Получить текст для диалога перезагрузки на текущем языке
 */
function getRestartTexts() {
    let lang = Core.settings.getString("locale", "en");
    
    if (lang === "ru") {
        return {
            title: "Таблица схем успешно импортирована!",
            message: "Для применения изменений необходимо перезагрузить игру.\n\n[orange]Перезагрузить сейчас?[]",
            restart: "Перезагрузить",
            later: "Позже"
        };
    } else if (lang === "uk") {
        return {
            title: "Таблицю схем успішно імпортовано!",
            message: "Для застосування змін необхідно перезавантажити гру.\n\n[orange]Перезавантажити зараз?[]",
            restart: "Перезавантажити",
            later: "Пізніше"
        };
    } else if (lang === "de") {
        return {
            title: "Entwurfstabelle erfolgreich importiert!",
            message: "Du musst das Spiel neu starten, um die Änderungen zu übernehmen.\n\n[orange]Jetzt neu starten?[]",
            restart: "Neu starten",
            later: "Später"
        };
    } else if (lang === "it") {
        return {
            title: "Tabella delle schematiche importata con successo!",
            message: "Devi riavviare il gioco per applicare le modifiche.\n\n[orange]Riavviare ora?[]",
            restart: "Riavvia",
            later: "Dopo"
        };
    } else {
        // English default
        return {
            title: "Schematics table imported successfully!",
            message: "You need to restart the game to apply changes.\n\n[orange]Restart now?[]",
            restart: "Restart",
            later: "Later"
        };
    }
}

/**
 * Показать диалог импорта с подтверждением
 */
exports.showImportDialog = function() {
    try {
        Vars.ui.showConfirm("@confirm", "@schematics-table.import.confirm", () => {
            Vars.platform.showFileChooser(true, "zip", file => {
                try {
                    exports.importSchematicsTable(file, true);
                    
                    // Отключено: показ диалога о необходимости перезагрузки
                    /*
                    let texts = getRestartTexts();
                    let restartDialog = new BaseDialog(texts.title);
                    restartDialog.cont.add(texts.message).width(400).wrap();
                    restartDialog.cont.row();
                    restartDialog.cont.table(Tex.button, t => {
                        t.defaults().size(200, 50);
                        t.button(texts.restart, Icon.exit, () => {
                            Vars.platform.exit();
                        });
                        t.button(texts.later, Icon.cancel, () => {
                            restartDialog.hide();
                        });
                    });
                    restartDialog.addCloseButton();
                    restartDialog.show();
                    */
                    
                    // Просто показываем уведомление об успехе
                    Vars.ui.showInfoFade("@schematics-table.import.success");
                } catch (e) {
                    Vars.ui.showErrorMessage("Import failed\n" + e.message);
                }
            });
        });
    } catch (e) {
        Vars.ui.showErrorMessage("Failed: " + e.message);
    }
};
