h5rep.sincronizar_bancos_dados = function () {
    console.log('sincronizar_bancos_dados');
    console.log('TODO: evitar paralalismo');

    h5rep.query.subscriptions().forEach(function (sub) {
        console.log('conectando com ', sub.nodeId)
        var conn = DDP.connect('http://localhost:3100');
        console.log('conectado com ', conn.call('h5rep.whoami'))
        verificar_versao_do_banco_e_da_app();
        receber();
        enviar();
        function enviar() {
            console.log('enviando', sub.message_sent - sub.confirm_sent, 'mensagens para ', sub.nodeId);
            var next_msgId = sub.confirm_sent;
            if (sub.message_sent > next_msgId) {
                while (sub.message_sent > next_msgId) {
                    next_msgId++;
                    console.log('enviando mensagem ', next_msgId)
                    var message = h5rep.query.message(sub.pubId, sub.nodeId, next_msgId);
                    executar_rep_msg(conn, message)
                    h5rep.db.message.remove({ _id: message._id });
                }
                h5rep.db.subscription.update(
                    {
                        _id: sub._id
                    },
                    {
                        $set: {
                            confirm_sent: next_msgId
                        }
                    }
                )
            }
        }
        function receber() {
            var last_msgid = sub.confirm_received;
            var msgs = conn.call('h5rep.receiveMessage', sub.pubId, process.env.h5rep_me, last_msgid)
            console.log('receber', msgs);
            while (msgs.length) {
                msgs.forEach(function (msg) {
                    executar_rep_msg(Meteor, msg);
                    last_msgid = msg.msgId;
                });
                h5rep.db.subscription.update(
                    {
                        _id: sub._id
                    },
                    {
                        $set: {
                            last_sync: new Date(),
                            confirm_received: last_msgid
                        }
                    }
                )
                msgs = conn.call('h5rep.receiveMessage', sub.pubId, sub.nodeId, last_msgid);
            }
        }
        function verificar_versao_do_banco_e_da_app() { }
        function executar_rep_msg(w, msg) {
            console.log('executando ', msg.pubId, msg.nodeId, msg.msgId, msg.args[0]);
            if (msg.op != 1) throw new Error('method invalido');
            w.call('nolog_Jogadores.soa.givePoints', msg.args[0]);
        }
    });

    // ddp connect - OK
    // 1. LAN enviar para Cloud - for messagem
    // 2. LAN receber de Cloud
}
// if (process.env.h5rep_me == 'LAN') {
//     Meteor.setTimeout(h5rep.sincronizar_bancos_dados, 1000);
//     Meteor.setInterval(h5rep.sincronizar_bancos_dados, 60000);
// }

Meteor.methods(
    {
        'h5rep.sync': function () {
            h5rep.sincronizar_bancos_dados();
        },
        'h5rep.receiveMessage': function (pubId, nodeId, last_msgid) {
            console.log('method-h5rep.receiveMessage', pubId, nodeId, last_msgid);
            h5rep.db.message.remove({ pubId, nodeId, msgId: { $lte: last_msgid } });
            h5rep.db.subscription.update(
                {
                    pubId, nodeId
                },
                {
                    $set: {
                        last_sync: new Date(),
                        confirm_received: last_msgid
                    }
                }
            )
            var msgs = h5rep.query.messageByNode(pubId, nodeId).fetch();
            return msgs;
        }
    },
);

Meteor.publish('h5-rep.subscriptions', function () {
    return h5rep.query.subscriptions();
})
