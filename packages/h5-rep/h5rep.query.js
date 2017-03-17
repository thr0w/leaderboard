h5rep.query = {
    subscriptions() {
        return h5rep.db.subscription.find({});
    },
    message(pubId, nodeId, msgId) {
        console.log({ pubId, nodeId, msgId })
        return h5rep.db.message.findOne({
            pubId, nodeId, msgId
        });
    }
}

Meteor.methods(
    {
        'h5rep.whoami': function () {
            return process.env.h5rep_me;
        }
    }
);