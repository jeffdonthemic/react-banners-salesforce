/** @jsx React.DOM */
var React         = require('react');
var Reflux        = require('reflux');
// routing
var Router        = require('react-router');
var RouteHandler  = Router.RouteHandler;
var Route         = Router.Route;
var DefaultRoute  = Router.DefaultRoute;
// view components
var ViewBanner    = require('./components/view');
var AddBanner     = require('./components/add');
var Banners       = require('./components/banners');
// store
var BannersStore = require('./stores/bannersStore');

var routes = (
  <Route handler={ BannerManager }>
    <Route name="banner" path="/banner/:id" handler={ ViewBanner } />
    <Route name="add" path="/add" handler={ AddBanner } />
    <DefaultRoute name="home" handler={ Banners } />
  </Route>
);

var BannerManager = React.createClass({
  render: function() {
    return (
      <RouteHandler/>
    );
  }
});

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.getElementById('app'));
});
