const path = require('path');
const glob = require('glob');
const webPaths = {
    app: 'app',
    dist: 'dist'
};
const nameJson = {
    'js': 'script',
    'css': 'less',
    'html': 'views',
    'tpl': 'template'
};




module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take.
    // Can help when optimizing build times
    require('time-grunt')(grunt);

    let files = grunt.file.expand(webPaths.app + '/Static/script/page/*.js'); //读取要打包的js入口
    let requirejsOptions = {};  //创建一个空对象，用来装requirejs的配置
    files.forEach(function(file) {
        let filenameList = file.split('/');
        let num = filenameList.length;
        let filename = filenameList[num - 1].replace(/\.js$/,'');


        requirejsOptions[filename] = {
            options: {
                baseUrl: webPaths.app + '/Static/script',  //js根目录
                mainConfigFile: webPaths.app + '/Static/script/components/config.js',  //requirejs的配置文件
                optimizeAllPluginResources: true,  //优化所有插件资源
                name: 'page/' + filename,  //待压缩的模块名
                out: webPaths.dist + '/static/script/' + filename + '.js',  //输出的压缩文件
                include: 'require.js'  //额外引入的模块，和 name 定义的模块一起压缩合并；
            }
        };
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // configurable paths
        paths: webPaths,
        //Clean files and folders
        clean: {
            build: ['<%= paths.dist %>/**','<%= paths.app %>/Static/script/template']
        },
        //Copy files and folders
        copy: {
            main: {
                expand: true,
                cwd: '<%= paths.app %>/Static/images',
                src: ['**'],
                dest: '<%= paths.dist %>/Static/images'
            }
        },
        //less configurable
        less: {
            development: {
                options: {
                    compress: true,
                    banner: '/*! Created by <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: getEntry(webPaths.app+"/Static/less/**/*.*.less", webPaths.dist+"/Static/css/",nameJson.css)
            }
        },
        processhtml: {
            development: {
                options: {
                    process: true,
                    data: {
                        stylePath: '../Static/css',
                        imagesPath: '../Static/images',
                        scriptPath: '../Static/script'
                    }
                },
                files: getEntry(webPaths.app+'/views/**/*.index.html', webPaths.dist+'/views/','views')
            }
        },
        // 通过watch任务，来监听文件是否有更改
        watch: {
            options: {
                livereload: true
            },
            files: [
                '<%= paths.app %>/Static/script/**/*.js',
                '<%= paths.app %>/Static/less/**/*.less',
                '<%= paths.app %>/Static/images/**/*.{png,jpg,gif}',
                '<%= paths.app %>/views/**/*.html'
            ],
            tasks: ['build']
        },
        // 通过connect任务，创建一个静态服务器
        connect: {
            options: {
                open: true,
                port: 9002,
                hostname: 'localhost',
                base: '<%= paths.dist %>'
            },
            livereload: {
                options: {
                    middleware: function(connect, options) {
                        return [
                            require('connect-livereload')({ port: 35729 }),
                            require('serve-static')(options.base[0]),
                            require('serve-index')(options.base[0])
                        ];
                    }
                }
            }
        },
        requirejs: requirejsOptions,
        //Minify JavaScript files with UglifyJS
        uglify: {
            options: {
                banner: '/*! Created by <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist %>/Static/script',
                    src: ['**/*.js'],
                    dest: '<%= paths.dist %>/Static/script'
                }]
            }
        },
        //Minify images using imagemin
        imagemin:{
            build:{
                options: {
                    optimizationLevel: 3
                },
                files:[{
                    expand: true,
                    cwd: '<%= paths.app %>/Static/images',
                    src: ['**/*.{jpg,png,gif}'],
                    dest: '<%= paths.dist %>/Static/images'
                }]
            }
        },
        //给js和css加上MD5后缀
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            prod: {
                src: [
                    '<%= paths.dist %>/Static/css/**/*.css',
                    '<%= paths.dist %>/Static/script/*.js'
                ]
            }
        },
        //filerev辅助工具, 更换页面中对脚本和样式文件的引用为加上md5后缀后的引用
        filerev_replace: {
            prod: {
                options: {
                    assets_root: '<%= paths.dist %>/Static/', //匹配的路径前缀
                    views_root: '<%= paths.dist %>/Static/'  //相对路径转换成绝对路径来进行匹配
                },
                src: ['<%= paths.dist %>/views/*.html']
            }
        },
        //arTtemplate
        cptpl: {
            test: {
                options: {
                    engine: 'arTtemplate',
                    introduced: 'art-template',
                    context: '{CMD}'
                },
                files: getEntry(webPaths.app+'/template/**/*.html', webPaths.app+'/Static/script/template/','template')
            }
        }


    });

    grunt.registerTask('build',['clean:build', 'imagemin', 'less', 'cptpl', 'requirejs', 'processhtml']);  //init

    grunt.registerTask('dev', 'development', function(){  //开发者模式
        grunt.task.run(['build', 'connect', 'watch']);
    });

    grunt.registerTask('prod', [ 'uglify', 'filerev', 'filerev_replace']);  //线上模式

};



function getEntry(globPath, pathDir, name) {
    let files = glob.sync(globPath);
    let entries = {},
        entry, dirname, basename, pathname, extname, entryArr = [],cache = null;
    files.forEach(function(filepath) {
        entry = filepath;
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);

        let lessIndex = filepath.indexOf(name);
        let nameLen = name.length + 1;
        let paths = filepath.slice(lessIndex + nameLen);
        let pathsArr = paths.split("/");

        switch (name){
            case nameJson.css:
                pathname = path.join(pathDir + pathsArr[0], basename + ".css");
                entries[pathname] = entry;
                break;
            case nameJson.html:
                pathname = path.join(pathDir, basename + ".html");
                entries[pathname] = [entry];
                break;
            case  nameJson.tpl:
                pathname = path.join(pathDir, pathsArr[0]);
                (pathsArr[0] != cache) ? entryArr = [] : true;
                cache = pathsArr[0];
                entryArr.push(entry);
                entries[pathname] = entryArr;
                break;
            default :
                break;
        }
    });
    return entries;
}



