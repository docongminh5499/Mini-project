/**
 * Created by GSN on 7/6/2015.
 */

var ScreenMenu = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor:function() {
        this._super();
        var size = cc.director.getVisibleSize();

        var background = cc.Sprite.create(res.base.menu_background);
        var background_size = background.getContentSize();
        background.setPosition(cc.p(size.width / 2, size.height / 2));
        background.setScale(size.width / background_size.width, size.height / background_size.height);
        this.addChild(background, 0);

        var logo = cc.Sprite.create(res.base.logo);
        logo.setPosition(cc.p(size.width / 2, size.height * 0.7));
        this.addChild(logo, 0);

        var btnExit = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2, "Exit");
        this.addChild(btnExit);
        btnExit.addClickEventListener(this.onSelectExit.bind(this));

        var btnOptions = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2 + 75, "Options");
        this.addChild(btnOptions);
        btnOptions.addClickEventListener(this.onSelectOptions.bind(this));

        var btnNewGame = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2 + 75 * 2, "New Game");
        this.addChild(btnNewGame);
        btnNewGame.addClickEventListener(this.onSelectNewGame.bind(this));
    },
    onSelectExit:function(sender)
    {
        cc.Director.getInstance().end();
    },
    onSelectOptions:function(sender)
    {
        fr.view(ScreenLocalization);
    },
    onSelectNewGame:function(sender)
    {
        fr.view(ScreenDragonbones);
    }
});