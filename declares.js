if (Meteor.isServer) {
    if (!process.env.h5rep_me) throw new Error("falta configurar nó (me)")
    if (!process.env.h5rep_remote) throw new Error("falta configurar nó (remote)")


    console.log('TESTE DE REPLICAÇÃO')
    console.log('me =', process.env.h5rep_me)
    console.log('remote =', process.env.h5rep_remote)

}
Jogadores = {
    db: {
        Players: new Mongo.Collection("players")
    },
    query: {
        todosJogadores() {
            return Jogadores.db.Players
                .find({}, { sort: { score: -1, name: 1 } });
        },
        porNome(id) {
            return Jogadores.db.Players.find({ _id: id });
        }
    }
};

if (Meteor.isServer) {
    h5rep.soa.me = process.env.h5rep_me,
        h5rep.soa.publications = [
            {
                _id: 'leaderboard'
            }
        ]
    Meteor.publish('todosJogadores', function () {
        return Jogadores.query.todosJogadores();
    });
    Meteor.methods({
        'Jogadores.soa.givePoints': function (id) {
            console.log('(com log) Jogadores.soa.givePoints', id)
            h5rep.soa.message.log(
                Jogadores.methods.givePoints,
                Meteor.userId,
                arguments
            )
            Jogadores.soa.givePoints(id)
        },
        'nolog_Jogadores.soa.givePoints': function (id) {
            console.log('nolog_Jogadores.soa.givePoints', id)
            Jogadores.soa.givePoints(id)
        }
    })
    Jogadores.methods = {
        givePoints: 1
    }
    Jogadores.soa = {
        givePoints(id) {
            console.log('givePoints: ', id);
            console.dir(Jogadores.db.Players.find().fetch()[0]);
            Jogadores.db.Players.update({ _id: id }, { $inc: { score: 5 } });
        }
    }
    Meteor.startup(function () {
        h5rep.soa.subscription.subscribe('leaderboard', process.env.h5rep_remote)
        if (Jogadores.db.Players.find().count() === 0) {
            var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
            _.each(names, function (name, idx) {
                Jogadores.db.Players.insert({
                    _id: ['jogador', idx].join(''),
                    name: name,
                    score: idx * 5
                });
            });
        }
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('todosJogadores');
}