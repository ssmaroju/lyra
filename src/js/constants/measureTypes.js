'use strict';

var NOMINAL = 'nominal',
    ORDINAL = 'ordinal',
    QUANTITATIVE = 'quantitative',
    TEMPORAL = 'temporal';

var m = module.exports = [NOMINAL, QUANTITATIVE, TEMPORAL]; // ordinal not yet used
m.NOMINAL = NOMINAL;
m.ORDINAL = ORDINAL;
m.QUANTITATIVE = QUANTITATIVE;
m.TEMPORAL = TEMPORAL;
