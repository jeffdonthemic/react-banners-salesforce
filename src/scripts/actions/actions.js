/** @jsx React.DOM */
var Reflux = require('reflux');

var actions = Reflux.createActions({
    'toggleStatus': {},
    'addBanner': {}
});

module.exports = actions;
