


if (Meteor.isClient) {
  Template.leaderboard.helpers({
    players: function () {
      return Jogadores.query.todosJogadores()
    },
    selectedName: function () {
      var player = Jogadores.query.porNome(Session.get("selectedPlayer")).fetch()[0];
      return player && player.name;
    }
  });

  Template.leaderboard.events({
    'click .inc': function () {
      Meteor.call('Jogadores.soa.givePoints', Session.get("selectedPlayer"));
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selectedPlayer", this._id);
    }
  });
}
