/** @jsx React.DOM */
var Reflux = require('reflux');
var _ = require('lodash');
var actions = require('../actions/actions');

var bannersStore  = Reflux.createStore({

  data: { banners: [] },

  getInitialState: function() {
    return this.data;
  },

  init: function() {

    var salesforce = new RemoteObjectModel.Banner();
    // fetch 5 record from the Banner__c custom object
    salesforce.retrieve({ limit: 5 }, function(err, records, event){
      if (err) console.log('Darn error: ' + err);
      if (!err) {
        records.forEach(function(record) {
          var banner = {
            "id": record.get("Id"),
            "name": record.get("Name"),
            "imageUrl": record.get("Image_URL__c"),
            "targetUrl": record.get("Target_URL__c"),
            "active": record.get("Active__c")
          }
          this.data.banners.push(banner);
        }.bind(this));
        // set scope
        this.trigger();
      }
    }.bind(this));

    // register addBanner action & bind to addBanner function
    this.listenTo(actions.addBanner, this.addBanner);
    // register toggleStatus action & bind to togggle function
    this.listenTo(actions.toggleStatus, this.toggle);
  },

  // returns the array of banners from state
  getBanners: function() {
    return this.data.banners;
  },

  // returns a banner by id
  getBanner: function(bannerId) {
    return _.where(this.data.banners, { 'id': bannerId })[0];
  },

  // creates banner in sfdc & pushes it to the state of banners
  addBanner: function(banner) {
    // construct the object for salesforce
    var details = {
      Name: banner.name,
      Image_URL__c: banner.imageUrl,
      Target_URL__c: banner.targetUrl,
      Active__c: 'Yes'
    }

    var sfdcBanner = new RemoteObjectModel.Banner();
    sfdcBanner.create(details, function(err) {
      if (err) console.log('Darn error: ' + err);
      if (!err) {
        banner.id = sfdcBanner.get('Id');
        this.data.banners.push(banner);
        this.trigger();
      }
    }.bind(this));
  },

  // callback for toggle action to update in sfdc
  toggle: function(bannerId) {
    var banner = _.where(this.data.banners, { 'id': bannerId })[0];
    // toggle the banner status in the obect
    banner.active = banner.active === 'Yes' ? 'No' : 'Yes';
    // update the banner in sfdc
    var sfdcBanner = new RemoteObjectModel.Banner({
      Id: bannerId,
      Active__c: banner.active
    });
    sfdcBanner.update(function(err, ids) {
      if (err) console.log('Darn error: ' + err);
    });
    // pass the data on to any listeners -- see toggleStatus in view.js)
    this.trigger();
  }

});

module.exports = bannersStore;
