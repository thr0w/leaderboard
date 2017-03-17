h5rep.soa = {
    me: 'local',
    publications: [

    ],
    node: {
        add(name) {
            h5rep.db.node.upsert({
                name
            }, {
                    active: true
                })

        },
        activate(name) {
            h5rep.db.node.update({
                name
            }, {
                    active: true
                })
        },
        dectivate(name) {
            h5rep.db.node.update({
                name
            }, {
                    active: false
                })
        },
    },
    subscription: {
        subscribe(pubId, nodeId) {
            if (
                h5rep.db.subscription.find({
                    pubId, nodeId
                }).count() == 0
            )
                h5rep.db.subscription.insert(
                    {
                        pubId,
                        nodeId,
                        message_sent: 0,
                        confirm_sent: 0,
                        last_sync: null,
                        message_received: 0,
                        confirm_received: 0,
                    }
                );
        },
        unsubscribe(pubId, nodeId) {
            h5rep.db.subscription.remove({
                pubId, nodeId
            });
            h5rep.db.message.remove({
                pubId, nodeId
            });
        }
    },
    message: {
        log(op, user, args) {
            h5rep.soa.publications.forEach(function (pub) {

                h5rep.db.subscription.find(
                    {
                        pubId: pub._id
                    }
                ).fetch().forEach(function (sub) {
                    var r = h5rep.db.subscription.findAndModify(
                        {
                            query: {
                                _id: sub._id
                            },
                            update: {
                                $inc: { message_sent: 1 }
                            },
                            new: true
                        }
                    );

                    console.dir(r);
                    h5rep.db.message.insert({
                        pubId: sub.pubId,
                        nodeId: sub.nodeId,
                        msgId: r.message_sent,
                        ts: new Date,
                        op, user, args
                    });
                })

            })
        }
    }
}



// // https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md

// /*

// rodar mesma aplicacao mas em duas instancias e dois bancos de dados

// Cloud - localhost:3100
// LAN - localhost:3200

// ao iniciar o Cloud
//    -p 3100
//    h5rep_me=Cloud
//    h5rep_remote=LAN


// ao iniciar o LAN
//    -p 3200
//    h5rep_me=LAN
//    h5rep_remote=Cloud

//    if (h5rep_me=LAN)
//     setTimeout(atualizar replicação)

//         var remote=DDP.connect('localhost:3100');
//         for h5rep.db.messages()
//           remote.call('Jogadores.soa.givePoints', args[0])
