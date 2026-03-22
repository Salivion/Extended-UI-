// Центральный обработчик для всего мода
// Объединяет все Events.run(Trigger.update) и Events.run(Trigger.draw)
// Работает и в локальной игре, и в мультиплеере

global.eui._updateHandlers = [];
global.eui._drawHandlers = [];

// Функция для регистрации обработчика update
global.eui.registerUpdate = function(handler) {
    global.eui._updateHandlers.push(handler);
};

// Функция для регистрации обработчика draw
global.eui.registerDraw = function(handler) {
    global.eui._drawHandlers.push(handler);
};

// Единый обработчик для всех update
// Работает всегда (и на хосте, и на клиенте)
Events.run(Trigger.update, () => {
    if (global.eui._updateHandlers) {
        for (let i = 0; i < global.eui._updateHandlers.length; i++) {
            try {
                global.eui._updateHandlers[i]();
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
});

// Единый обработчик для всех draw
// Работает всегда (и на хосте, и на клиенте)
Events.run(Trigger.draw, () => {
    if (global.eui._drawHandlers) {
        for (let i = 0; i < global.eui._drawHandlers.length; i++) {
            try {
                global.eui._drawHandlers[i]();
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
});

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ МУЛЬТИПЛЕЕРА
// ============================================

// Проверка: запущен ли сервер (хост или выделенный сервер)
global.eui.isServer = function() {
    return Vars.netServer != null;
};

// Проверка: является ли игрок хостом (локальный сервер)
global.eui.isHost = function() {
    return Vars.host != null;
};

// Проверка: является ли игрок клиентом
global.eui.isClient = function() {
    return Vars.net != null && Vars.net.client != null;
};

// Проверка: работает ли в мультиплеере
global.eui.isMultiplayer = function() {
    return global.eui.isClient() || (Vars.netServer != null && Vars.netServer.active());
};

