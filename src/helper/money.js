function isInteger(num) {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
        return false;
    }
    return num << 0 === num;
}

export const isValidMoneyCent = isInteger;

function count(n, digits) {
    if (digits === 2) {
        const remainder = n % 100;
        if (remainder >= 10) {
            return `${((n / 100) << 0)}.${remainder}`;
        }
        return `${((n / 100) << 0)}.0${remainder}`;
    } else if (digits === 1) {
        if (n % 10 !== 0) {
            throw new Error(`centToYuan Convert ${n} cents to 1 digits yuan will lose precision`);
        }
        const m = (n / 10) << 0;
        return `${(m / 10) << 0}.${m % 10}`;
    } else if (digits === 0) {
        if (n % 100 !== 0) {
            throw new Error(`centToYuan Convert ${n} cents to 0 digits yuan will lose precision`);
        }
        return `${(n / 100) << 0}`;
    }
    throw new Error('centToYuan only accept 0, 1, 2 digits');
}



export function centToYuan(n, digits) {
    if (!isInteger(n)) {
        throw new Error(`centToYuan only accept integers as input`);
    }
    if(n < 0) {
        return `-${count(Math.abs(n), digits)}`
    } else {
        return count(n, digits)
    }
}

export function refundRountCent(cent) {
    if (!isInteger(cent)) {
        throw new Error('roundRefundCent only accept integers as input');
    }
    let n = cent;
    if (n % 10 !== 0) {
        n = n - (n % 10) + 10;
    }
    return n;
}

export function refundRountCentPercentToCent(centPercent) {
    if (!isInteger(centPercent)) {
        throw new Error('roundRefundCentPercentToCent only accept integers as input');
    }
    let n = centPercent;
    if (n % 1000 !== 0) {
        n = n - (n % 1000) + 1000;
    }
    return (n / 100) << 0;
}

export function getDisplayPrice(cent, digits) {
    return (Math.floor(Number(cent)) / 100).toFixed(digits || 2);
}