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
            while (sub.message_sent > next_msgId) {
                next_msgId++;
                console.log('enviando mensagem ', next_msgId)
                var message = h5rep.query.message(sub.pubId, sub.nodeId, next_msgId);

                if (message.op != 1) throw new Error('method invalido');

                conn.call('nolog_Jogadores.soa.givePoints', message.args[0]);
                h5rep.db.message.remove({ _id: message._id });
            }
            h5rep.db.subscriptions.update(
                {
                    _id: sub._id
                },
                {
                    $set: {
                        message_sent: next_msgId
                    }
                }
            )
        }
        function receber() { }
        function verificar_versao_do_banco_e_da_app() { }
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
        }
    }
);

Meteor.publish('h5-rep.subscriptions', function () {
    return h5rep.query.subscriptions();
})
