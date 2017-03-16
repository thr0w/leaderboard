h5rep.db = {
    node: new Mongo.Collection("h5rep_node"),
    subscription: new Mongo.Collection("h5rep_subscription"),
    message: new Mongo.Collection("h5rep_message"),
}