exports.powerToString = function(currentNetPower, graphs) {
    let num = Math.round(currentNetPower*60);

    let graphString = graphs.length > 1 ? " (sep " + graphs.length + ')' : '';
    let sign = num > 0 ? '+' : '';
    let color = num >= 0 ? '[stat]' : '[red]';

    let powerString = exports.numberToString(num, 1);
    return color + sign + powerString + '[white]' + graphString;
}

exports.numberToString = function(num, triplets) {
    triplets = triplets || 0;
    
    // Обработка edge cases
    if (num === 0) return '0';
    if (!isFinite(num)) return num.toString(); // NaN, Infinity
    
    let absNum = Math.abs(num);
    let power = Math.floor(Math.log(absNum) / Math.log(1000)) - triplets;
    
    if (power > 0) {
        try {
            let numStr = num.toString();
            let sliceIndex = -3 * power + 1;
            
            // Проверка на корректность индекса
            if (sliceIndex <= 0 || sliceIndex > numStr.length) {
                return num.toString();
            }
            
            // Используем substring вместо splice (которого нет у String)
            let integerPart = numStr.substring(0, sliceIndex);
            let decimalPart = numStr.substring(sliceIndex, sliceIndex + 1);
            
            return integerPart + '.' + decimalPart + 'k'.repeat(power);
        } catch (e) {
            return num.toString();
        }
    } else {
        return num.toString();
    }
}

// Форматирование больших чисел с разделителями
exports.formatLargeNumber = function(num) {
    if (!isFinite(num)) return num.toString();
    if (num === 0) return '0';
    
    let absNum = Math.abs(num);
    let suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    let suffixIndex = Math.floor(Math.log(absNum) / Math.log(1000));
    
    if (suffixIndex >= suffixes.length) {
        return num.toExponential(2);
    }
    
    let scaledNum = absNum / Math.pow(1000, suffixIndex);
    let formatted = scaledNum.toFixed(scaledNum >= 100 ? 0 : scaledNum >= 10 ? 1 : 2);
    
    // Убираем лишние нули после запятой
    formatted = formatted.replace(/\.?0+$/, '');
    
    return (num < 0 ? '-' : '') + formatted + suffixes[suffixIndex];
}
