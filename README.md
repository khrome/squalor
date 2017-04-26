squalor.js
==========

squalor is an ultra-light SQL generation framework that (given an ID column)
will take care of Create, Update and Delete, leaving you with only Read.

Static Use
----------

    var sql = require('squalor');


    sql.save(object);

    sql.remove(object);

Dynamic Use
-----------

    var Update = require('squalor');

    var change = new Update('my_table', {});
    change.data.mycolumn = 'new_value';

    somedatabase.query(change)
    somedatabase.query(change.remove())
