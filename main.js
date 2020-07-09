
var gv = gv || {};

var DESIGN_RESOLUTION_WIDTH = 640;
var DESIGN_RESOLUTION_HEIGHT = 1136;
var DISPLAY_FPS = true;

cc.game.onStart = function () {
    if (!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));
    // Pass true to enable retina display, disabled by default to improve performance
    cc.view.enableRetina(true);
    // Adjust viewport meta
    cc.view.adjustViewPort(true);
    // jsb: the main class which manages interaction with JavaScript environment
    jsb.fileUtils.addSearchPath(fr.NativeService.getFolderUpdateAssets(), true);
    jsb.fileUtils.addSearchPath(fr.NativeService.getFolderUpdateAssets() + "/res", true);

    cc.loader.resPath = "res";
    cc.LoaderScene.preload(g_resources, function () {
        //hide fps
        cc.director.setDisplayStats(DISPLAY_FPS);
        // Setup the resolution policy and design resolution size
        var frameSize = cc.view.getFrameSize();
        var ratio = frameSize.width/frameSize.height;
        if(ratio < 2){
            // Portrait
            cc.view.setDesignResolutionSize(DESIGN_RESOLUTION_WIDTH, DESIGN_RESOLUTION_HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
        }else {
            // Landscape
            cc.view.setDesignResolutionSize(DESIGN_RESOLUTION_HEIGHT, DESIGN_RESOLUTION_HEIGHT / 2, cc.ResolutionPolicy.SHOW_ALL);
        }

        // The game will be resized when browser size change --> web
        cc.view.resizeWithBrowserSize(true);
        //socket
        gv.gameClient = new GameClient();
        gv.poolObjects = new PoolObject();
        //modules
        testnetwork.connector = new testnetwork.Connector(gv.gameClient);

        fr.view(ScreenMenu);
    }, this);
};
cc.game.run();

// test