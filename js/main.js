
require.config({

    deps: ["main"],

    paths: {
        "jquery": "../bower_components/jquery/dist/jquery"
        , "jquery-ui": "../bower_components/jquery-ui/jquery-ui",
        "jquery.transit": "../bower_components/jquery.transit/jquery.transit",
        "builder": "builder",
        "impressConsole": "impressConsole",
        "impress": "impress",
        "FileSaver": "../bower_components/FileSaver/FileSaver"
    }

    // ,

    // shim: {
    //     "builder": { exports: "Builder", deps: ['jquery.transit','impress','jquery-ui','jquery']},
    //     "jquery": {
    //         exports: "$"}
    //         ,
    //     "jquery.transit": {
    //         exports: "$",
    //         deps: ['jquery']
    //     },
    //     "jquery-ui": {
    //         exports: "$",
    //         deps: ['jquery']
    //     }
    // }

});



requirejs(["builder","jquery","jquery-ui","jquery.transit"], function (builder,$) {
    console.log("loaded");
    
    $('#impressframe').ready(function () {

        // get iframe DOM element
        var $f = $('#impressframe')[0];
        
        
        var fwin = $f.contentWindow;
        var fdoc = fwin.document;
      
        // clone all builder styles into iframe document
        //TODO remove them again on export
        $.each($(document).children("html").children("head").children("link"), function () {
            $(this).clone().appendTo($("html", fdoc).children("head"));
        });



        var iAPI = fwin.impress();

      

        builder.init({
            win: fwin,
            doc: fdoc,
            iAPI: iAPI,
            "goto": iAPI['goto'], //it makes me feel better this way
            "creationFunction": iAPI['newStep'], //future API method that adds a new step
            redrawFunction: iAPI.initStep, //future API method that (re)draws the step
            setTransformationCallback: iAPI.setTransformationCallback //future API method that lets me know when transformations change
        });
    });
});