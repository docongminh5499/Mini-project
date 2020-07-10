/**
 * Created by GSN on 7/6/2015.
 */


var ScreenMenu = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor: function() {
        this._super();
        var size = cc.director.getVisibleSize();

        var background = cc.Sprite.create(res.base.menu.background);
        background.setPosition(cc.p(size.width / 2, size.height * 0.65));
        this.addChild(background, 0);

        var logo = cc.Sprite.create(res.base.menu.logo);
        var scale_logo  = (0.55 * size.width) / (logo.getContentSize().width * 0.1);
        logo.setScale(0.1, 0.1);
        logo.setPosition(cc.p(size.width / 2, size.height * 0.8));
        this.addChild(logo, 1);

        var scale_logo_animation = cc.scaleBy(scale_logo, scale_logo);
        scale_logo_animation.setDuration(1.5);
        logo.runAction(scale_logo_animation);

        var plane = cc.Sprite.create(res.base.menu.pack, cc.rect(0, 1268, 100, 100));
        plane.setPosition(size.width * 0.8, -100);
        plane.setScale(0.8, 0.8);
        this.addChild(plane, 1);

        var plane_move = cc.MoveTo(3, cc.p(size.width * 0.8, size.height + 100));
        plane.runAction(cc.repeatForever(cc.sequence(
            plane_move,
            cc.delayTime(1),
            cc.callFunc(() => plane.setPosition(size.width * 0.8, -100))
        )));

        var plane_2 = cc.Sprite.create(res.base.menu.pack, cc.rect(0, 1268, 100, 100));
        plane_2.setPosition(size.width * 0.3, -100);
        plane_2.setScale(0.5, 0.5);
        this.addChild(plane_2, 1);

        var plane_2_move = cc.MoveTo(2, cc.p(size.width * 0.3, size.height + 100));
        plane_2.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(1.5),
            plane_2_move,
            cc.delayTime(1),
            cc.callFunc(() => plane_2.setPosition(size.width * 0.3, -100))
        )));

        //var btnExit = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2, "Exit");
        //this.addChild(btnExit);
        //btnExit.addClickEventListener(this.onSelectExit.bind(this));
        //
        //var btnOptions = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2 + 75, "Options");
        //this.addChild(btnOptions);
        //btnOptions.addClickEventListener(this.onSelectOptions.bind(this));
        //
        //var btnNewGame = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.2 + 75 * 2, "New Game");
        //this.addChild(btnNewGame);
        //btnNewGame.addClickEventListener(this.onSelectNewGame.bind(this));

        var new_game = cc.Sprite.create(res.base.menu.button, cc.rect(0, 0, 120, 36));
        new_game.setPosition(cc.p(cc.winSize.width/2, size.height * 0.5));
        new_game.setScale(1.6, 1.6);
        //new_game.addClickEventListener(this.onSelectNewGame.bind(this));
        this.addChild(new_game);

        cc.audioEngine.playMusic(res.base.menu.music, true);
    },
    onSelectExit:function(sender) {
        cc.director.end();
    },
    onSelectOptions:function(sender) {
        fr.view(ScreenLocalization);
    },
    onSelectNewGame:function(sender) {
        fr.view(ScreenDragonbones);
    },
});