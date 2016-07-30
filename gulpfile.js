/*jslint node: true */

var gulp = require('gulp'),
    HTMLValidator = require('gulp-html'),
    config = require('./config.json'),
    color = config.colors,
    layer = null,
    pathToHTMLFile = null;

/**
 * SET THE LAYER IN WHICH YOU’RE WORKING
 *
 * Calling either of the following three tasks simply sets the layer variable
 * according to the objects defined in the config.json file.
 */

gulp.task('setLayerToContent', function () {
    'use strict';

    layer = config.folders.layers.content;
});

gulp.task('setLayerToSettings', function () {
    'use strict';

    layer = config.folders.layers.settings;
});

gulp.task('setLayerToBackend', function () {
    'use strict';

    layer = config.folders.layers.backend;
});

/**
 * VALIDATE HTML
 *
 * This task cannot be run on its own; it must be run after setting a working layer
 * using either the setLayerToContent or the setLayerToSettings task, as such:
 *
 *      gulp setLayerToContent validateHTML
 *      gulp setLayerToSettings validateHTML
 */
gulp.task('validateHTML', function () {
    'use strict';

    switch (layer) {
        case 'content-layer/':
            pathToHTMLFile =
                config.folders.development +
                config.folders.layers.content +
                config.content_layer.views.main;

            break;

        case 'settings-layer/':
            pathToHTMLFile =
                config.folders.development +
                config.folders.layers.settings +
                config.settings_layer.views.main;

            break;

        default:
            process.stdout.write(
                '\n\t' +
                    color.red +
                    'The layer in which you’re working has not been set. Precede ' +
                    'this task\n\twith either the setLayerToContent or the ' +
                    'setLayerToSettings task to set\n\tit. For example, to ' +
                    'validate the index.html file in the content-layer\n\tfolder, ' +
                    'type\n\n\t\tgulp setLayerToContent validateHTML' +
                    color.default + '\n\n'
            );

            return;
    }

    process.stdout.write(pathToHTMLFile);

    return gulp.src(pathToHTMLFile)
        .pipe(new HTMLValidator());
});




