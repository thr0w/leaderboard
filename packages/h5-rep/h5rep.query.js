h5rep.query = {
    subscriptions() {
        return h5rep.db.subscription.find({});
    },
    message(pubId, nodeId, msgId) {
        console.log({ pubId, nodeId, msgId })
        return h5rep.db.message.findOne({
            pubId, nodeId, msgId
        });
    },
    messageByNode(pubId, nodeId) {
        console.log({ pubId, nodeId })

        console.log('messageByNode-')
        h5rep.db.message.find(
            {}
        ).forEach(function (m) {
            console.dir(m)
        });


        return h5rep.db.message.find(
            {
                pubId, nodeId
            },
            {
                sort: { msgId: 1 }
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