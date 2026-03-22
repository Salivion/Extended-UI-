// ============================================
// Улучшенная система иконок для Extended UI
// Поддерживает: UI иконки, спрайты контента, команды, моды
// ============================================

// ClientLoadEvent доступен глобально в Mindustry
const spriteStorage = [];
let allIcons = Object.create(null, {});
let allSprites = Object.create(null, {});
let teamIcons = Object.create(null, {});
let modIcons = Object.create(null, {});

// Флаги кэширования для оптимизации
let iconsCached = false;
let spritesCached = false;
let unitSpritesCached = false;
let teamIconsCached = false;
let modIconsCached = false;

// ============================================
// Публичные API функции
// ============================================

/** Получить все доступные иконки (объединённые) */
exports.getAll = function() {
    return Object.assign({}, allIcons, allSprites, teamIcons, modIcons);
}

/** Получить UI иконки (Icon.icons) */
exports.getIcons = function() {
    if (!iconsCached) {
        if (Icon.icons.size > 0) {
            Icon.icons.each((name, icon) => {
                allIcons[name] = new TextureRegionDrawable(icon);
            });
        }
        iconsCached = true;
    }
    return allIcons;
}

/** Получить спрайты контента (items, liquids, units, blocks, statuses) */
exports.getSprites = function() {
    if (!spritesCached) {
        setupSprites();
        spritesCached = true;
    }
    return allSprites;
}

/** Получить спрайты юнитов */
exports.getUnitSprites = function() {
    if (!unitSpritesCached) {
        setupSprites();
        unitSpritesCached = true;
    }
    return spriteStorage[2];
}

/** Получить все юниты включая моды (использует Vars.content) */
exports.getAllUnits = function() {
    if (!Vars.content) {
        return [];
    }

    const units = Vars.content.units();
    if (!units || units.size === 0) {
        return [];
    }

    return units;
}

/** Получить иконку по имени (быстрый поиск) */
exports.getByName = function(name) {
    if (!name || typeof name !== 'string') {
        return new TextureRegionDrawable(Icon.pencil);
    }
    
    // Проверяем кэши в порядке приоритета
    if (allIcons[name]) return allIcons[name];
    if (allSprites[name]) return allSprites[name];
    if (teamIcons[name]) return teamIcons[name];
    if (modIcons[name]) return modIcons[name];
    
    // Если не найдено - создаём новую
    return new TextureRegionDrawable(Icon.pencil);
}

/** Получить иконку команды */
exports.getTeamIcon = function(teamName) {
    if (!teamIconsCached) {
        setupTeamIcons();
    }
    return teamIcons[teamName] || null;
}

/** Получить все иконки команд */
exports.getAllTeamIcons = function() {
    if (!teamIconsCached) {
        setupTeamIcons();
    }
    return teamIcons;
}

/** Получить иконки из модов */
exports.getModIcons = function() {
    if (!modIconsCached) {
        setupModIcons();
    }
    return modIcons;
}

/** Получить Drawable иконки по имени (основная функция для UI) */
exports.getIconDrawable = function(iconName) {
    if (!iconName || typeof iconName !== 'string') {
        return new TextureRegionDrawable(Icon.pencil);
    }

    try {
        // 1. Проверяем UI иконки (Icon.icons)
        if (Icon.icons.containsKey(iconName)) {
            // Возвращаем как в старой версии
            return new TextureRegionDrawable(Icon.icons.get(iconName));
        }

        // 2. Проверяем спрайты контента
        if (!spritesCached) setupSprites();
        if (allSprites[iconName] != null) {
            return allSprites[iconName];
        }

        // 3. ПРОВЕРЯЕМ ИКОНКИ КОМАНД (с префиксом team- или без)
        // Важно: должно быть ПЕРЕД поиском в атласе!
        if (iconName.startsWith("team-")) {
            return getTeamIconDrawable(iconName);
        }
        
        // Проверяем является ли имя названием команды (sharded, crux, malis, и т.д.)
        if (isTeamName(iconName)) {
            return getTeamIconDrawable("team-" + iconName);
        }

        // 4. Проверяем иконки модов
        if (!modIconsCached) setupModIcons();
        if (modIcons[iconName] != null) {
            return modIcons[iconName];
        }

        // 5. Проверяем Tex (текстуры UI)
        const texDrawable = Tex[iconName];
        if (texDrawable != null && !(texDrawable instanceof Function)) {
            return texDrawable;
        }

        // 6. СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ РАКЕТ (missile)
        // Ракеты типа scathe-missile, quell-missile, disrupt-missile - скрытые юниты
        // У них есть uiIcon но они не загружаются в UnitTypes
        if (isMissileUnit(iconName)) {
            const missileIcon = getMissileIcon(iconName);
            if (missileIcon) {
                return missileIcon;
            }
        }

        // 7. Пробуем найти в атласе напрямую
        const region = Core.atlas.find(iconName);
        if (region != null && region.found()) {
            return new TextureRegionDrawable(region);
        }

        // 8. Пробуем с префиксом unit- (для скрытых юнитов)
        const unitRegion = Core.atlas.find("unit-" + iconName + "-ui");
        if (unitRegion != null && unitRegion.found()) {
            return new TextureRegionDrawable(unitRegion);
        }

        // 9. Иконка не найдена - возвращаем карандаш
        return new TextureRegionDrawable(Icon.pencil);
    } catch (e) {
        return new TextureRegionDrawable(Icon.pencil);
    }
}

/** Проверить является ли имя ракетой (скрытым юнитом) */
function isMissileUnit(name) {
    const missileUnits = [
        "scathe-missile", "scathe-missile-phase", "scathe-missile-surge", "scathe-missile-surge-split",
        "quell-missile", "disrupt-missile", "anthicus-missile"
    ];
    return missileUnits.indexOf(name) !== -1;
}

/** Получить иконку ракеты */
function getMissileIcon(missileName) {
    // Пробуем найти через Core.atlas с полным именем
    const regionName = "unit-" + missileName + "-ui";
    const region = Core.atlas.find(regionName);
    if (region != null && region.found()) {
        return new TextureRegionDrawable(region);
    }
    return null;
}

/** Проверить является ли имя названием команды */
function isTeamName(name) {
    const teamNames = ["sharded", "crux", "malis", "derelict", "green", "blue", "neoplastic"];
    return teamNames.indexOf(name) !== -1;
}

// ============================================
// Внутренние функции
// ============================================

/** Настроить спрайты контента */
function setupSprites() {
    // Определяем spriteClasses внутри функции чтобы Items/UnitTypes и т.д. были загружены
    const spriteClasses = [Items, Liquids, UnitTypes, StatusEffects, Blocks];

    for (let spriteClass of spriteClasses) {
        let sprites = [];
        for (let key in spriteClass) {
            let item = spriteClass[key];
            if (!item || !item.uiIcon) continue;
            try {
                const drawable = new TextureRegionDrawable(item.uiIcon);
                sprites[item.name] = drawable;
                allSprites[item.name] = drawable;
            } catch (e) {
                // Игнорируем ошибки при загрузке спрайтов
            }
        }
        spriteStorage.push(sprites);
    }

    // ============================================
    // ЗАГРУЗКА ЮНИТОВ ЧЕРЕЗ Vars.content (включая моды)
    // ============================================

    if (Vars.content && Vars.content.units) {
        const units = Vars.content.units();

        if (units && units.size > 0) {
            let loadedCount = 0;
            let hiddenCount = 0;
            let errorCount = 0;

            // Создаём отдельный массив для юнитов (индекс 2)
            if (!spriteStorage[2]) {
                spriteStorage[2] = {};
            }

            for (let i = 0; i < units.size; i++) {
                try {
                    const unit = units.get(i);

                    if (!unit) continue;

                    // Пропускаем скрытые юниты (ракеты, специальные)
                    if (unit.hidden) {
                        hiddenCount++;
                        continue;
                    }

                    // Проверяем наличие uiIcon
                    if (!unit.uiIcon || !unit.uiIcon.found()) {
                        errorCount++;
                        continue;
                    }

                    // Извлекаем имя юнита без префикса "unit-"
                    let unitName = unit.name;
                    if (unitName.startsWith("unit-")) {
                        unitName = unitName.substring(5);
                    }
                    // Удаляем суффикс "-ui" если есть
                    if (unitName.endsWith("-ui")) {
                        unitName = unitName.substring(0, unitName.length - 3);
                    }

                    // Создаём спрайт
                    const drawable = new TextureRegionDrawable(unit.uiIcon);

                    // Сохраняем в общий массив и в массив юнитов
                    allSprites[unitName] = drawable;
                    spriteStorage[2][unitName] = drawable;
                    loadedCount++;

                } catch (e) {
                    errorCount++;
                }
            }
        }
    }

    // ============================================
    // ДОБАВЛЯЕМ СКРЫТЫЕ ЮНИТЫ (ракеты) которые нужны
    // ============================================

    const missileUnits = [
        "scathe-missile", "scathe-missile-phase", "scathe-missile-surge", "scathe-missile-surge-split",
        "quell-missile", "disrupt-missile", "anthicus-missile"
    ];

    for (let i = 0; i < missileUnits.length; i++) {
        let missileName = missileUnits[i];
        const regionName = "unit-" + missileName + "-ui";
        const region = Core.atlas.find(regionName);
        if (region != null && region.found()) {
            allSprites[missileName] = new TextureRegionDrawable(region);
            if (!spriteStorage[2]) spriteStorage[2] = {};
            spriteStorage[2][missileName] = new TextureRegionDrawable(region);
        }
    }
}

/** Настроить иконки команд (все 6 базовых + кастомные) */
function setupTeamIcons() {
    // Базовые команды из Team.java
    const baseTeams = [
        { name: "derelict", color: Color.valueOf("4d4e58") },
        { name: "sharded", color: Pal.accent },
        { name: "crux", color: Color.valueOf("f25555") },
        { name: "malis", color: Color.valueOf("a27ce5") },
        { name: "green", color: Color.valueOf("54d67d") },
        { name: "blue", color: Color.valueOf("6c87fd") }
    ];

    for (let teamData of baseTeams) {
        const teamName = teamData.name;
        const regionName = "team-" + teamName;

        // Пробуем найти спрайт команды в атласе
        const region = Core.atlas.find(regionName);
        
        if (region != null && region.found()) {
            // Спрайт найден в атласе
            teamIcons[teamName] = new TextureRegionDrawable(region);
            teamIcons[regionName] = new TextureRegionDrawable(region);
        } else {
            // Если спрайт не найден - создаём цветной квадрат
            const drawable = new TextureRegionDrawable(Tex.whiteui);
            drawable.setTint(teamData.color);
            teamIcons[teamName] = drawable;
            teamIcons[regionName] = drawable;
        }
    }

    // Добавляем neoplastic (специальная команда)
    const neoplasticRegion = Core.atlas.find("team-neoplastic");
    if (neoplasticRegion != null && neoplasticRegion.found()) {
        teamIcons["neoplastic"] = new TextureRegionDrawable(neoplasticRegion);
        teamIcons["team-neoplastic"] = new TextureRegionDrawable(neoplasticRegion);
    }

    teamIconsCached = true;
}

/** Получить Drawable иконки команды */
function getTeamIconDrawable(iconName) {
    if (!teamIconsCached) {
        setupTeamIcons();
    }

    const teamName = iconName.substring(5); // убираем "team-"

    // Проверяем кэш
    if (teamIcons[teamName]) {
        return teamIcons[teamName];
    }
    if (teamIcons[iconName]) {
        return teamIcons[iconName];
    }

    // Пробуем найти команду через Team.all (Team.getByName не существует!)
    const team = getTeamByName(teamName);
    if (team != null) {
        const region = Core.atlas.find("team-" + teamName);
        if (region != null && region.found()) {
            const drawable = new TextureRegionDrawable(region);
            teamIcons[teamName] = drawable;
            teamIcons[iconName] = drawable;
            return drawable;
        }

        // Создаём цветной квадрат с цветом команды
        const drawable = new TextureRegionDrawable(Tex.whiteui);
        drawable.setTint(team.color);
        teamIcons[teamName] = drawable;
        teamIcons[iconName] = drawable;
        return drawable;
    }

    // Команда не найдена - возвращаем карандаш
    return new TextureRegionDrawable(Icon.pencil);
}

/** Получить команду по имени (аналог несуществующего Team.getByName) */
function getTeamByName(name) {
    // Ищем в Team.all
    for (let i = 0; i < Team.all.length; i++) {
        let team = Team.all[i];
        if (team != null && team.name === name) {
            return team;
        }
    }
    return null;
}

/** Настроить иконки из модов */
function setupModIcons() {
    if (!Vars.mods || !Vars.mods.list) {
        modIconsCached = true;
        return;
    }

    // Проходим по всем включённым модам
    Vars.mods.list().each(mod => {
        // Используем mod.enabled вместо mod.isEnabled()
        if (!mod.enabled || !mod.meta) return;

        const modName = mod.meta.name.replace(/\s+/g, "").toLowerCase();

        // Пробуем найти иконку мода
        const modIconRegion = Core.atlas.find("icon-" + modName);
        if (modIconRegion != null && modIconRegion.found()) {
            modIcons["mod-" + modName] = new TextureRegionDrawable(modIconRegion);
        }

        // Регистрируем контент модов через Vars.content
        // Ищем блоки этого мода
        Vars.content.blocks().each(block => {
            if (block.minfo && block.minfo.mod === mod && block.uiIcon && block.uiIcon.found()) {
                const blockName = block.name.replace("block-", "").replace("-ui", "");
                modIcons[blockName] = new TextureRegionDrawable(block.uiIcon);
                modIcons["block-" + blockName] = new TextureRegionDrawable(block.uiIcon);
            }
        });

        // Ищем предметы этого мода
        Vars.content.items().each(item => {
            if (item.minfo && item.minfo.mod === mod && item.uiIcon && item.uiIcon.found()) {
                const itemName = item.name.replace("item-", "").replace("-ui", "");
                modIcons[itemName] = new TextureRegionDrawable(item.uiIcon);
                modIcons["item-" + itemName] = new TextureRegionDrawable(item.uiIcon);
            }
        });

        // Ищем юнитов этого мода
        Vars.content.units().each(unit => {
            if (unit.minfo && unit.minfo.mod === mod && unit.uiIcon && unit.uiIcon.found()) {
                const unitName = unit.name.replace("unit-", "").replace("-ui", "");
                modIcons[unitName] = new TextureRegionDrawable(unit.uiIcon);
                modIcons["unit-" + unitName] = new TextureRegionDrawable(unit.uiIcon);
            }
        });
    });

    modIconsCached = true;
}

// ============================================
// Инициализация при загрузке
// ============================================

// Не инициализируем спрайты сразу - контент ещё не загружен!
// Инициализация произойдёт при первом вызове getUnitSprites() или getSprites()

// ============================================
// Отложенная инициализация после загрузки контента
// ============================================

// Инициализируем спрайты после ClientLoadEvent когда контент готов
Events.on(ClientLoadEvent, () => {
    exports.getSprites();
});

// ============================================
// Отладочная функция (для проверки в консоли)
// ============================================
exports.debugTeamIcons = function() {
    if (!teamIconsCached) {
        setupTeamIcons();
    }

    // Проверяем атлас
    ["team-sharded", "team-crux", "team-malis", "team-derelict", "team-green", "team-blue"].each(function(name) {
        let region = Core.atlas.find(name);
    });

    // Проверяем Team.getByName
    ["sharded", "crux", "malis", "derelict", "green", "blue"].each(function(name) {
        let team = Team.getByName(name);
    });
}

/** Отладочная функция для проверки иконок юнитов */
exports.debugUnitSprites = function() {
    // Проверяем spriteStorage
    if (spriteStorage[2]) {
        let count = 0;
        for (let key in spriteStorage[2]) {
            if (count >= 20) break;
            count++;
        }
    }

    // Проверяем allSprites для юнитов
    let unitCount = 0;
    for (let key in allSprites) {
        // Проверяем является ли это юнитом (по ключевым словам)
        if (key.indexOf("dagger") >= 0 || key.indexOf("flare") >= 0 ||
            key.indexOf("mono") >= 0 || key.indexOf("alpha") >= 0) {
            unitCount++;
        }
    }

    // Проверяем Vars.content
    if (Vars.content && Vars.content.units) {
        const units = Vars.content.units();
        if (units && units.size > 0) {
            for (let i = 0; i < Math.min(10, units.size); i++) {
                const unit = units.get(i);
            }
        }
    }

    // Проверяем UnitTypes
    let unitTypesCount = 0;
    for (let key in UnitTypes) {
        try {
            const type = UnitTypes[key];
            if (type && type instanceof UnitType) {
                unitTypesCount++;
            }
        } catch (e) {
            // Игнорируем
        }
    }
}
