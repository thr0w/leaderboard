Mongo.Collection.prototype.findAndModify = function (args) {
    validate(this, args);

    var findOptions = {};
    if (args.sort !== undefined)
        findOptions.sort = args.sort;
    if (args.fields !== undefined)
        findOptions.fields = args.fields;
    if (args.skip !== undefined)
        findOptions.skip = args.skip;

    var ret = this.findOne(args.query, findOptions);
    if (args.remove) {
        if (ret) this.remove({ _id: ret._id });
    }

    else {
        if (args.upsert && !ret) {
            var writeResult = this.upsert(args.query, args.update);
            if (writeResult.insertedId && args.new)
                return this.findOne({ _id: writeResult.insertedId }, findOptions);
            else if (findOptions.sort)
                return {};
            return null;
        }

        else if (ret) {

            // If we're in a simulation, it's safe to call update with normal
            // selectors (which is needed, e.g., for modifiers with positional
            // operators). Otherwise, we'll have to do an _id only update to
            // get around the restriction that lets untrusted (e.g. client)
            // code update collections by _id only.
            var enclosing = DDP._CurrentInvocation.get();
            var alreadyInSimulation = enclosing && enclosing.isSimulation;
            if (alreadyInSimulation) {
                // Add _id to query because Meteor's update doesn't include certain
                // options that the full findAndModify does (like sort). Create
                // shallow copy before update so as not to mess with user's
                // original query object
                var updatedQuery = {};
                for (var prop in args.query) {
                    updatedQuery[prop] = args.query[prop];
                }
                updatedQuery._id = ret._id;
                this.update(updatedQuery, args.update);
            }

            else {
                this.update({ _id: ret._id }, args.update);
            }

            if (args.new)
                return this.findOne({ _id: ret._id }, findOptions);
        }
    }

    return ret;
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