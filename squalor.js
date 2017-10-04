var sqldelete = function(caselessTable, object, primaryKey, post){
    var table = Object.keys(types).filter(function(item){
        return item.toLowerCase() == caselessTable.toLowerCase()
    })[0] || caselessTable;
    var list = normalizeValues(object, types[table], post);
    var columns = Object.keys(list);
    var sql;
    if(object[primaryKey]){
        sql = 'DELETE * FROM '+table+ ' WHERE `'+
            primaryKey+'` = '+typedValue(object[primaryKey])
    } //otherwise, it's not yet saved
    return sql;
};

var sqlselect = function(caselessTable, object, primaryKey, post){
    var table = Object.keys(types).filter(function(item){
        return item.toLowerCase() == caselessTable.toLowerCase()
    })[0] || caselessTable;
    var list = normalizeValues(object, types[table], post);
    var columns = Object.keys(list);
    var sql = 'SELECT * FROM `'+table+'` WHERE '+columns.map(function(name){
        return '`'+name+'` = '+typedValue(object[name]);
    }).join(' and ')+';';
    return sql;
};

var normalizeValues = function(values, config, includeAll, post){
    var vals = {};
    if(config && !includeAll){
        (config.columns || Object.keys(config)).forEach(function(name){
            vals[name] = values[name] || config[name];
            if(post) vals[name] = post(vals[name]);
        })
    }else{
        vals = values;
    }
    return vals;
};

var types = {};
var typedValue = function(value){
    if(typeof value === 'object' && value instanceof Date){
        //todo: support moment + timezone if available
        return '"'+value.toISOString().slice(0, 19).replace('T', ' ')+'"';
    }
    return typeof value == 'Number'?value.toString():'"'+value+'"';
}

var sqlsave = function(caselessTable, object, primaryKey, post){
    var table = Object.keys(types).filter(function(item){
        return item.toLowerCase() == caselessTable.toLowerCase()
    })[0] || caselessTable;
    var list = normalizeValues(object, types[table], post);
    var columns = Object.keys(list);
    var sql;
    if(object[primaryKey]){
        sql = 'UPDATE '+table+' SET '+columns.map(function(name){
            return '`'+name+'` = '+typedValue(object[name]);
        }).join(', ')+ ' WHERE `'+
            primaryKey+'` = '+typedValue(object[primaryKey])
    }else{
        sql = 'INSERT INTO `'+table+'`('+columns.map(function(name){
            return '`'+name+'`';
        }).join(', ')+') VALUES('+columns.map(function(name){
            return typedValue(object[name]);
        })+')';
    }
    return sql;
};

(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define(['extended-emitter', 'async-arrays', 'sqlstring'], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('extended-emitter'), require('async-arrays'), require('sqlstring'));
    }else{
        root.EventedArray = factory(root.ExtendedEmitter, root.AsyncArrays, root.SQLString);
    }
}(this, function(emitter, asyncarrays, sqlstring){

    function SQL(type, data){
        this.type = type;
        this.data = data || {};
    }

    SQL.prototype.toString = function(){
        return sqlsave(this.type, this.data, this.primaryKey);
    }

    SQL.prototype.delete = function(){
        return sqldelete(this.type, this.data, this.primaryKey);
    }

    SQL.prototype.similar = function(){
        return sqlselect(this.type, this.data, this.primaryKey);
    }

    SQL.prototype.set = function(key, value){
        data[key] = value;
    }

    SQL.prototype.get = function(key){
        return data[key];
    }

    SQL.prototype.preprocess = function(str){
        return str;
    }

    SQL.prototype.postprocess = function(str){
        return str;
    }

    SQL.prototype.injectionPrevention = function(on){
        if(on){
            if(!this.old) this.old = {};
            this.old.preprocess = this.preprocess;
            this.old.postprocess = this.postprocess;
            this.preprocess = function(str){
                return sqlstring.escape(str);
            }
        }else{
            if(this.old.preprocess) this.preprocess = this.old.preprocess;
            if(this.old.postprocess) this.postprocess = this.old.postprocess;
            this.old = {};
        }
    }

    var staticObject = new SQL();
    staticObject.primaryKey = 'id';

    SQL.injectionPrevention = function(val){
        return staticObject.injectionPrevention(val);
    }

    SQL.save = function(caselessTable, object){
        staticObject.data = object;
        staticObject.type = caselessTable;
        return staticObject.toString();
    };

    SQL.delete = function(caselessTable, object){
        staticObject.data = object;
        staticObject.type = caselessTable;
        return staticObject.delete();
    };

    SQL.select = function(caselessTable, object){
        staticObject.data = object;
        staticObject.type = caselessTable;
        return staticObject.similar();
    };

    SQL.escapeIfNeeded = function(str){
        return staticObject.postprocess(staticObject.preprocess(str));
    };

    SQL.encode = function(str){
        return staticObject.preprocess(str);
    };

    return SQL;

}));
