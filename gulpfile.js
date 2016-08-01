/*jslint node: true */

var gulp = require('gulp'),
    remover = require('del'),
    HTMLValidator = require('gulp-html'),
    CSSCompiler = require('gulp-sass'),
    CSSValidator = require('gulp-w3c-css'),
    browserSpecificPrefixGenerator = require('gulp-autoprefixer'),
    config = require('./config.json'),
    color = config.colors,
    folders = config.folders,
    contentLayer = config.content_layer,
    settingsLayer = config.settings_layer,
    layer = null,
    pathToHTMLFile = null,
    pathToSassFile = null,
    pathToCSSFolder = null,
    pathToCSSFile = null;

/**
 * SET THE LAYER IN WHICH YOU’RE WORKING
 *
 * Calling either of the following three tasks simply sets the layer variable
 * according to the objects defined in the config.json file.
 */
gulp.task('setLayerToContent', function () {
    'use strict';

    layer = folders.layers.content;
});

gulp.task('setLayerToSettings', function () {
    'use strict';

    layer = folders.layers.settings;
});

gulp.task('setLayerToBackend', function () {
    'use strict';

    layer = folders.layers.backend;
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

    return gulp.src(pathToHTMLFile)
        .pipe(new HTMLValidator());
});

/**
 * VALIDATE CSS
 *
 * The task layer must first be set in order for both the compileCSS and this task
 * to run. Call this task as such:
 *
 *      gulp setLayerToContent validateCSS
 *      gulp setLayerToSettings validateCSS
 */
gulp.task('validateCSS', ['compileCSS'], function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToCSSFile =
            config.folders.development +
            config.folders.layers.content +
            config.content_layer.styles.source;

        break;

    case 'settings-layer/':
        pathToCSSFile =
            config.folders.development +
            config.folders.layers.settings +
            config.settings_layer.styles.source;

        break;

    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent or the ' +
                'setLayerToSettings task to set\n\tit. For example, to ' +
                'validate the main.css file in the content-layer\n\tfolder, ' +
                'type\n\n\t\tgulp setLayerToContent validateCSS' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToCSSFile)
        .pipe(new CSSValidator())
        .pipe(gulp.dest(folders.validator_results));
});

/**
 * COMPILE CSS
 *
 * Using Sass, compile the file pathToSassFile and write the final CSS document to
 * the pathToCSSFolder. The final CSS file will be formatted with 2-space
 * indentations. Any floating-point calculations will be carried out 10 places, and
 * browser-specific prefixes will be added to support 2 browser versions behind all
 * current browsers’ versions.
 *
 * Like the validateHTML task, this task too cannot be run on its own. A layer must
 * be set first, as such:
 *
 *      gulp setLayerToContent compileCSS
 *      gulp setLayerToSettings compileCSS
 */
gulp.task('compileCSS', function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToSassFile =
            config.folders.development +
            config.folders.layers.content +
            config.content_layer.styles.source;

        pathToCSSFolder =
            config.folders.development +
            config.folders.layers.content;

        break;

    case 'settings-layer/':
        pathToSassFile =
            config.folders.development +
            config.folders.layers.settings +
            config.settings_layer.styles.source;

        pathToCSSFolder =
            config.folders.development +
            config.folders.layers.settings;

        break;

    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent or the ' +
                'setLayerToSettings task to set\n\tit. For example, to ' +
                'compile the main.css file in the content-layer\n\tfolder, ' +
                'type\n\n\t\tgulp setLayerToContent compileCSS' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToSassFile)
        .pipe(new CSSCompiler({
            outputStyle: 'expanded',
            precision: 10
        }).on('error', CSSCompiler.logError))
        .pipe(browserSpecificPrefixGenerator({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(pathToCSSFolder));
});

/**
 * CLEAN
 *
 * This task deletes the removable files and folders created during development and
 * production. A report is generated regarding files/folders that exist and can be
 * removed, and those that do not exist.
 */
gulp.task('clean', function () {
    'use strict';

    var fileSystem = require('fs'),
        index,
        removableFolders = [
            folders.validator_results,
            folders.development +
                folders.layers.content +
                contentLayer.styles.target,
            folders.development +
                folders.layers.settings +
                settingsLayer.styles.target
        ];

    for (index = 0; index < removableFolders.length; index += 1) {
        try {
            fileSystem.accessSync(removableFolders[index], fileSystem.F_OK);
            process.stdout.write('\n\t' + color.green + removableFolders[index] +
                color.default + ' was found and ' + color.green + 'will' +
                color.default + ' be deleted.\n');
            remover(removableFolders[index]);
        } catch (error) {
            if (error) {
                process.stdout.write('\n\t' + color.red + removableFolders[index] +
                    color.default + ' does ' + color.red + 'not' + color.default +
                    ' exist or is ' + color.red + 'not' + color.default +
                    ' accessible.\n');
            }
        }
    }

    process.stdout.write('\n');
});
