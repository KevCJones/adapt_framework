module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var outputdir = grunt.option('outputdir') || '',
        theme = grunt.option('theme') || '';

    if (outputdir) {
        if (outputdir.substring(outputdir.length - 1, outputdir.length) !== '/') {
            // Append a slash if required
            outputdir = outputdir + '/';
        }
        
        grunt.log.writeln('** Building to ' + outputdir); 
    }

    if (theme) {
        grunt.log.writeln('** Using theme ' + theme);
    }
    
    grunt.initConfig({
        outputdir: outputdir,
        theme: theme,
        pkg: grunt.file.readJSON('package.json'),
        jsonlint: {
            src: [ 'src/course/**/*.json' ]
        },
        copy: {
            index: {
                files: [
                    {
                        expand: true, 
                        src: ['src/index.html'], 
                        dest: '<%= outputdir %>build/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                ]
            },
            courseJson: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*.json'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*','!**/*.json'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    },
                    {
                        expand: true, 
                        src: ['src/core/js/scriptLoader.js'], 
                        dest: '<%= outputdir %>build/adapt/js/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true, 
                        src: [
                            'src/core/js/libraries/require.js', 
                            'src/core/js/libraries/modernizr.js',
                            'src/core/js/libraries/json2.js',
                            'src/core/js/libraries/consoles.js',
                            'src/core/js/libraries/swfObject.js'
                        ], 
                        dest: '<%= outputdir %>build/libraries/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= theme %>/**/fonts/**'],
                        dest: '<%= outputdir %>build/adapt/css/fonts/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= theme %>/**/assets/**'],
                        dest: '<%= outputdir %>build/adapt/css/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/components/**/assets/**'],
                        dest: '<%= outputdir %>build/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/extensions/adapt-contrib-spoor/required/*'],
                        dest: '<%= outputdir %>build/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        concat: {
            less: {
                src: [
                    'src/core/less/*.less', 
                    'src/theme/<%= theme %>/**/*.less', 
                    'src/menu/**/*.less', 
                    'src/components/**/*.less', 
                    'src/extensions/**/*.less'
                ],
                dest: 'src/less/adapt.less'
            }
        },
        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    '<%= outputdir %>build/adapt/css/adapt.css' : 'src/less/adapt.less'
                }
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace:"Handlebars.templates",
                    processName: function(filePath) {
                        var newFilePath = filePath.split("/");
                        newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, "");
                        return  newFilePath;
                    },
                    partialRegex: /.*/,
                    partialsPathRegex: /\/partials\//
                },
                files: {
                    'src/templates/templates.js': 'src/**/*.hbs'
                }
            }
        },
        bower: {
            target: {
                rjsConfig: './config.js',
                options: {
                    baseUrl: 'src'
                }
            }
        },
        'requirejs-bundle': {
            components: {
                src: 'src/components',
                dest: 'src/components/components.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'components/components'
                }
            },
            extensions: {
                src: 'src/extensions/',
                dest: 'src/extensions/extensions.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'extensions/extensions'
                }
            },
            menu: {
                src: 'src/menu/',
                dest: 'src/menu/menu.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'menu/menu'
                }
            },
            theme: {
                src: 'src/theme/',
                dest: 'src/theme/theme.js',
                options: {
                    baseUrl: "src",
                    include: theme,
                    moduleName: 'themes/themes'
                }
            }
        },
        requirejs: {
            dev: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "<%= outputdir %>build/adapt/js/adapt.min.js",
                    generateSourceMaps: true,
                    preserveLicenseComments:false,
                    optimize: "none"
                }
            },
            compile: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "<%= outputdir %>build/adapt/js/adapt.min.js",
                    optimize:"uglify2"
                }
            }
        },
        watch: {
            less: {
                files: ['src/**/*.less'],
                tasks: ['concat', 'less']
            },
            handlebars: {
                files: ['src/**/*.hbs'],
                tasks: ['handlebars', 'compile']
            },
            courseJson: {
                files: [
                    'src/course/**/*.json',
                    '!src/course/*/structure/**/*.json'
                ],
                tasks : ['jsonlint', 'copy:courseJson']
            },
            courseAssets: {
                files: [
                    'src/course/**/*', '!src/course/**/*.json',"!src/course/*/structure/**/*.html"
                ],
                tasks : ['copy:courseAssets']
            },
            js: {
                files: [
                    'src/**/*.js', 
                    '!src/extensions/extensions.js',
                    '!src/menu/menu.js',
                    '!src/theme/theme.js',
                    '!src/templates/templates.js',
                ],
                tasks: ['compile']
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index']
            },
            assets: {
                files: [
                    'src/theme/<%= theme %>/**/fonts/**',
                    'src/theme/<%= theme %>/**/assets/**',
                    'src/components/**/assets/**'
                ],
                tasks: ['copy:main']
            },
            structure: { // NB : Mavericks limit is low - terminal $ launchctl limit maxfiles 2048 2048 && ulimit -n 2048 if you get the limit warning
                files: [
                    'src/course/*/structure/**/*.{html,json}',
                ],
                tasks: ['create-json-from-structure']
            }
        },
        
        open: {
            server: {
                path: 'http://localhost:<%= connect.server.options.port %>/'
            },
            spoor: {
                path: 'http://localhost:<%= connect.server.options.port %>/main.html'
            }
        },

        concurrent: {
            server: ['connect:server', 'open:server'],
            spoor: ['connect:spoorOffline', 'open:spoor'],
            selenium: ['connect:spoorOffline', 'nightwatch']
        },

        connect: {
            server: {
              options: {
                port: 9001,
                base: 'build',
                keepalive:true
              }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: 'build',
                    keepalive:true
                }
            }
        },
        
        adapt_insert_tracking_ids: {
          options: {
              courseFile: "src/course/en/course.json",
              blocksFile: "src/course/en/blocks.json"
          }
        },

        nightwatch: {
            options: {
                standalone: true,
                jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');

    // This is a simple function to take the course's config.json and append the theme.json
    grunt.registerTask('create-json-from-structure', 'Creating json files', function() {

        var _ = require('underscore');
        var path = require('path');
        var contentObjectArray = [];
        var articlesArray = [];
        var blocksArray = [];
        var componentsArray = [];

        //regular expressions - we assume a folder naming convention, as in adapts demo
        var contentObj_re = new RegExp("^co-", "i");
        var article_re = new RegExp("^a-", "i");
        var block_re = new RegExp("^b-", "i");
        var component_re = new RegExp("^c-", "i");
        var all_re = [contentObj_re,article_re,block_re,component_re];
        
        //recurse through the structure folder
        //track the folder name and detect type, read the json file and build the final ones
        var isValidFolderName = function(folderName) {
            
            var match = false;
            for(var i; i <all_re.length; i++)
                if(re.test(str))
                {
                    match = true;
                    break;
                }
            
            return match?i:-1;
        }

        //walk backwards in the directories for a valid folder, allows for sub foldering certain elements later
        var getValidParent = function(folderArray)
        {
            for(var i = folderArray.length-1; i >= 0; i--)
            {
                var folder = folderArray[i];
                if(isValidFolderName(folder))
                    return folder;
            }

            return "course";

        }

        //replaces a JSON inject with the the file it asked us to inject e.g !inject:body.html! will 
        //load, minify and replace that line with the html content of body.html
        var runInjects = function(obj,subdir){

            var inject_re = /\!inject:(.*)\!/;
            //called with every property and it's value
            function process(innerObj,key,value) {
                if(_.isString(value))
                {
                    var file = value.match(inject_re);
                    if(file && file[1])
                    {
                        var str = grunt.file.read(subdir+file[1])
                        if(str)
                            innerObj[key] = str.replace(/\n|\t/g, ''); //remove white spacing characters 
                        else
                            grunt.fail.fatal("Oops, i tried to inject a file that was missing? " + subdir+file[1]);
                    }
                }
            }

            function traverse(o,func) {
                for (var i in o) {
                    func.apply(this,[o,i,o[i]]);  
                    if (o[i] !== null && typeof(o[i])=="object") {
                        //going on step down in the object tree!!
                        traverse(o[i],func);
                    }
                }
            }

            traverse(obj,process);

        };

        //make sure we're using the current default language then recurse the folder we built up
        var configJson = grunt.file.readJSON('src/course/config.json');
        var language = configJson._defaultLanguage;
        grunt.file.recurse('src/course/'+language+'/structure', function(abspath, rootdir, subdir, filename) {
            
            //only care about JSON stubs 
            if(path.extname(filename) == ".json")
            {
                var folders = subdir.split('/'),
                    parentName = null,
                    myName = null;

                if(folders.length > 1) // has a parent
                    parentName = folders[folders.length-2];
                myName = getValidParent(folders);
                    
                //Get the json now so we can edit as needed
                var jsonObject = grunt.file.readJSON(abspath);

                //update my parent and id as its assumed i'm in the folder of my name
                jsonObject["_parentId"] = parentName || "course"; // root nodes are course nodes
                jsonObject["_id"] = myName;

                //check for any injects
                runInjects(jsonObject,rootdir+'/'+subdir+'/');

                if(contentObj_re.test(myName)) contentObjectArray.push(jsonObject);
                else if(article_re.test(myName)) articlesArray.push(jsonObject);
                else if(block_re.test(myName)) blocksArray.push(jsonObject); 
                else if(component_re.test(myName)) componentsArray.push(jsonObject); 
            }
                

        });

        var outputArray = [];
        
        //Content Object Array Saved to JSON
        contentObjectArray.forEach(function(item){
            outputArray.push(JSON.stringify(item,null,3));
        });
        grunt.file.write('src/course/en/contentObjects.json', "[\n"+outputArray+"\n]");

        //Articles Object Array Saved
        outputArray = [];
        articlesArray.forEach(function(item){
            outputArray.push(JSON.stringify(item,null,3));
        });
        grunt.file.write('src/course/en/articles.json', "[\n"+outputArray+"\n]");

        //Save Block Array to JSON
        outputArray = [];
        blocksArray.forEach(function(item){
            outputArray.push(JSON.stringify(item,null,3));
        });
        grunt.file.write('src/course/en/blocks.json', "[\n"+outputArray+"\n]");

        //Save Components Array to JSON
        outputArray = [];
        componentsArray.forEach(function(item){
            outputArray.push(JSON.stringify(item,null,3));
        });
        grunt.file.write('src/course/en/components.json', "[\n"+outputArray+"\n]");


    });

    // This is a simple function to take the course's config.json and append the theme.json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {

        var themeJsonFile = '';

        // As any theme folder may be used, we need to first find the location of the
        // theme.json file
        grunt.file.recurse('src/theme/', function(abspath, rootdir, subdir, filename) {
            if (filename == 'theme.json') {
                themeJsonFile = rootdir + subdir + '/' + filename;
            }
        });

        if (themeJsonFile == '') {
            grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");
        }

        var configJson = grunt.file.readJSON('src/course/config.json');
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // This effectively combines the JSON   
        for (var prop in themeJson) {           
            configJson[prop] = themeJson[prop];
        }

        grunt.file.write('build/course/config.json', JSON.stringify(configJson));
    });

    grunt.registerTask('check-json', 'Checking course.json', function() {

        var _ = require('underscore');

        var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];

        var currentJsonFile;

        var storedIds = [];

        var storedFileParentIds = {};

        var storedFileIds = {};

        var hasOrphanedParentIds = false;
        
        var orphanedParentIds = [];

        // method to check json ids
        function checkJsonIds() {
            var currentCourseFolder;
            // Go through each course folder inside the src/course directory
            grunt.file.expand({filter: "isDirectory"}, "src/course/*").forEach(function(path) {
                // Stored current path of folder - used later to read .json files
                currentCourseFolder = path;
                
                // Go through each list of declared course files
                listOfCourseFiles.forEach(function(jsonFileName) {
                    // Make sure course.json file is not searched
                    if (jsonFileName !== "course") {
                        storedFileParentIds[jsonFileName] = [];
                        storedFileIds[jsonFileName] = [];
                        // Read each .json file
                        var currentJsonFile = grunt.file.readJSON(currentCourseFolder + "/" + jsonFileName + ".json");
                        currentJsonFile.forEach(function(item) {
                            // Store _parentIds and _ids to be used by methods below
                            storedFileParentIds[jsonFileName].push(item._parentId);
                            storedFileIds[jsonFileName].push(item._id);
                            storedIds.push(item._id);
                        });

                    }
                    
                });
                
                checkDuplicateIds();

                checkEachElementHasParentId();

            });
        }

        function checkDuplicateIds() {
            // Change _ids into an object of key value pairs that contains _ids as keys and a number count of same _ids
            var countIdsObject = _.countBy(storedIds);
            var hasDuplicateIds = false;
            var duplicateIds = [];
            _.each(countIdsObject, function(value, key) {
                // Check value of each _ids is not more than 1
                if (value > 1) {
                    hasDuplicateIds = true;
                    duplicateIds.push(key);
                }
            });

            // Check if any duplicate _ids exist and return error
            if (hasDuplicateIds) {
                grunt.fail.fatal("Oops, looks like you have some duplicate _ids: " + duplicateIds);
            }
        }

        function checkIfOrphanedElementsExist(value, parentFileToCheck) {
            _.each(value, function(parentId) {
                if (parentId === "course") {
                    return;
                }
                if (_.indexOf(storedFileIds[parentFileToCheck], parentId) === -1) {
                    hasOrphanedParentIds = true;
                    orphanedParentIds.push(parentId);
                };
                
            });
        }

        function checkEachElementHasParentId() {
            
            _.each(storedFileParentIds, function(value, key) {
                switch(key){
                    case "contentObjects":
                        return checkIfOrphanedElementsExist(value, "contentObjects");
                    case "articles":
                        return checkIfOrphanedElementsExist(value, "contentObjects");
                    case "blocks":
                        return checkIfOrphanedElementsExist(value, "articles");
                    case "components":
                        return checkIfOrphanedElementsExist(value, "blocks");
                }

            });

            if (hasOrphanedParentIds) {
                grunt.fail.fatal("Oops, looks like you have some orphaned objects: " + orphanedParentIds);
            }
        }

        checkJsonIds();

    });

    grunt.registerTask('default', ['less', 'handlebars', 'watch']);
    grunt.registerTask('compile', ['bower', 'requirejs-bundle', 'requirejs:dev']);
    grunt.registerTask('server', ['concurrent:server']);
    grunt.registerTask('server-scorm', ['concurrent:spoor']);

    grunt.registerTask('build', ['create-json-from-structure','jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile', 'create-json-config']);
    grunt.registerTask('server-build', ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile']);
    grunt.registerTask('dev', ['create-json-from-structure','jsonlint', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev', 'create-json-config', 'watch']);
    
    grunt.registerTask('acceptance',['compile', 'concurrent:selenium']);

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.registerTask('tracking-insert', 'adapt_insert_tracking_ids');
};