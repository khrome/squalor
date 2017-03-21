(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define(['extended-emitter', 'async-arrays'], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('extended-emitter'), require('async-arrays'));
    }else{
        root.EventedArray = factory(root.ExtendedEmitter, root.AsyncArrays);
    }
}(this, function(emitter, asyncarrays){

    var types = {};

    function SQL(type){

    }

    function typedValue(value){
        return typeof value == 'Number'?value.toString():'"'+value+'"';
    }

    SQL.prototype.toString = function(){

    }

    SQL.primaryKey = 'id';

    SQL.save = function(caselessTable, object){
        var table = Object.keys(types).filter(function(item){
            return item.toLowerCase() == caselessTable.toLowerCase()
        })[0] || caselessTable;
        var list = SQL.normalizeValues(object, types[table]);
        var columns = Object.keys(list);
        var sql;
        if(object[SQL.primaryKey]){
            sql = 'UPDATE '+table+' SET '+columns.map(function(name){
                return '`'+name+'` = '+typedValue(object[name]);
            }).join(', ')+ ' WHERE `'+
                SQL.primaryKey+'` = '+typedValue(object[SQL.primaryKey])
        }else{
            sql = 'INSERT INTO `'+table+'`('+columns.map(function(name){
                return '`'+name+'`';
            }).join(', ')+') VALUES('+columns.map(function(name){
                return typedValue(object[name]);
            })+')';
        }
        return sql;
    };

    SQL.normalizeValues = function(values, config, includeAll){
        var vals = {};
        if(config && !includeAll){
            (config.columns || Object.keys(config)).forEach(function(name){
                vals[name] = values[name] || config[name];
            })
        }else{
            vals = values;
        }
        return vals;
    };

    return SQL;

}));
