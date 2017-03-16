
Mongo.Collection.prototype.findAndModify = function (args, rawResult) {
    validate(this, args);

    var q = {};
    q.query = args.query || {};
    q.sort = args.sort || [];
    if (args.update)
        q.update = args.update;

    q.options = {};
    if (args.new !== undefined)
        q.options.new = args.new;
    if (args.remove !== undefined)
        q.options.remove = args.remove;
    if (args.upsert !== undefined)
        q.options.upsert = args.upsert;
    if (args.fields !== undefined)
        q.options.fields = args.fields;
    if (args.writeConcern !== undefined)
        q.options.w = args.writeConcern;
    if (args.maxTimeMS !== undefined)
        q.options.wtimeout = args.maxTimeMS;
    if (args.bypassDocumentValidation != undefined)
        q.options.bypassDocumentValidation = args.bypassDocumentValidation;

    // If upsert, assign a string Id to $setOnInsert unless otherwise provided
    if (q.options.upsert) {
        q.update = q.update || {};
        q.update.$setOnInsert = q.update.$setOnInsert || {};
        q.update.$setOnInsert._id = q.update.$setOnInsert._id || Random.id(17);
    }

    // Use rawCollection object introduced in Meteor 1.0.4.
    var collectionObj = this.rawCollection();

    var wrappedFunc = Meteor.wrapAsync(collectionObj.findAndModify,
        collectionObj);
    var result = wrappedFunc(
        q.query,
        q.sort,
        q.update,
        q.options
    );
    return rawResult ? result : result.value;
};

function validate(collection, args) {
    if (!collection._name)
        throw new Meteor.Error(405,
            "findAndModify: Must have collection name.");

    if (!args)
        throw new Meteor.Error(405, "findAndModify: Must have args.");

    if (!args.query)
        throw new Meteor.Error(405, "findAndModify: Must have query.");

    if (!args.update && !args.remove)
        throw new Meteor.Error(405,
            "findAndModify: Must have update or remove.");
};