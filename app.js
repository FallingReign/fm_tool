(function() {

  // complete app API reference can be found at
  // http://developer.zendesk.com/documentation/rest_api/apps.html

  var database = require('load.js');

  return {



    requests: {
      'fetchUser': function(id) {
        return {
          url: helpers.fmt('/api/v2/users/%@.json?include=groups,organizations', id),
          dataType: 'json',
          type: 'GET'
        };
      }
    },

    events: {
      'app.activated'         : 'init',
      'ticket.save'           : 'ticketSaveHandler',
      'fetchUser.done'        : 'onFetchUserDone',

      'show .my_modal'        : 'onShow',
      'click .toggle_modal'   : 'displayModal',
      'click .save_button'    : 'showSavedMessage',

      'ticket.postSaveAction.changed' : 'onPostSaveActionChange'
    },

    init: function() {
      this.switchTo('modal');
      this.ajax('fetchUser', this.currentUser().id()); // Nick is 465739980

      //show output for the external data for example
      console.log(database);


    },

    onFetchUserDone: function(data) {
        //disable fields
        this.applyActionOnFields(this.setting('disabled_fields'), 'disable');
        //hidden fields
        this.applyActionOnFields(this.setting('hidden_fields'), 'hide');
    },

    //save hook and throw error message
    ticketSaveHandler: function() {
      var msg = this.checkRequiredFields(this.setting('required_fields'));

      return msg;
    },

    // Capture the show modal event.
    onShow: function() {
      //services.notify('loading FM Tool');
    },

    displayModal: function() {
      this.$('.my_modal').modal({
        backdrop: true,
        keyboard: false
      });
    },

    showSavedMessage: function() {
      this.$('.my_modal').modal('hide');
      // Print modal body text.
      this.switchTo('modal', {
        modal_body: this.$('.modal-body p').text()
      });
    },

    onPostSaveActionChange: function() {
      //this.ticket().postSaveAction();
      //next_ticket
      //close_tab
      //stay_on_ticket
    },

    applyActionOnFields: function(fields, action) {
      var splitFields = fields.split(',');
      splitFields.forEach(function(field) {
        if (field){
          this.ticketFields(field)[action]();
        }
      }, this);
    },

    checkRequiredFields: function(fields) {
      var msg = '';
      var splitFields = fields.split(',');
      
      splitFields.forEach(function(field) {
        if (!this.ticket().customField(field)){
          msg += '<br /> - ' + this.ticketFields(field).label();
        }
      }, this);

      if (msg !== '') {
        msg = '<b>Missing Ticket Fields</b>' + msg;
        return msg;
      } else {
        return true;
      }
    },
  };

}());
