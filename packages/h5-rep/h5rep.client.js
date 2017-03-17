var _me = new ReactiveVar('?')
Meteor.call('h5rep.whoami', function (err, res) {
    _me.set(res);
});

Meteor.subscribe('h5-rep.subscriptions');

Template.h5rep_status.helpers({
    me() {
        return _me.get();
    },
    lan() {
        return _me.get() == 'LAN';
    },
    remotes() {
        return h5rep.query.subscriptions().map(function (sub) {
            return {
                nodeId: sub.nodeId,
                status:
                sub.last_sync && (sub.last_sync.getTime() + 120000 < new Date().getTime()()) ?
                    'ONLINE' : 'OFFLINE'
            }
        });
    }
})

Template.h5rep_status.events({
    'click BUTTON': function () {
        Meteor.call('h5rep.sync');
    }
})