Package.describe({
    name: 'h5-db',
    version: '1.0.0',
    summary: '',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.4.2.3');
    api.use('ecmascript');
    api.use('meteor-platform');
    api.use('reactive-var');

    api.addFiles([
        'mongo.utils.server.js'
        // 'hGetSystem.server.js',
    ], 'server');
    api.addFiles([
        'mongo.utils.client.js'
        // 'hGetSystem.client.js'
    ], 'client');

    api.export('h5');
});
