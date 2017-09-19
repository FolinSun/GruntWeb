require(['page/list/hello', 'page/list/test'], function(hello, test) {
    console.log(hello);
    console.log( test.decs );
    test.method1();
    test.method2();
});
