Package.describe({
    name: 'h5-rep',
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
    api.use('jquery');
    api.use('less');

    api.addFiles([
        'h5rep.db.js',
        'h5rep.query.js',
    ]);

    api.addFiles([
        'h5rep.server.js',
        'h5rep.soa.js',
    ], 'server');
    api.addFiles([
        'h5rep.client.html',
        'h5rep.client.js'
    ], 'client');

    api.export(['h5rep', 'h5rep_status']);
});
