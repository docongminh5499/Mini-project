/**
 * Created by GSN on 7/9/2015.
 */


var Plane = function(img_url, x, y, rect_crop) {
    this.x = x;
    this.y = y;

    if (rect_crop) {
        this.img = cc.Sprite.create(img_url, rect_crop);
    } else this.img = cc.Sprite.create(img_url);

    this.img.setPosition(this.x, this.y);
};




var ScreenDragonbones = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,
    score: 0,

    ctor:function() {
        this._super();
        this.loadGui();

    },
    loadGui:function()
    {
        // this.removeAllChildren();
        var size = cc.director.getVisibleSize();

        var background = cc.Sprite.create(res.base.game_background, cc.rect(0, 0, 220, 525));
        var background_size = background.getContentSize();
        background.setPosition(cc.p(size.width / 2, size.height / 2));
        background.setScale(size.width / background_size.width, size.height / background_size.height);
        this.addChild(background, 0);

        var textScore = ccui.TextField('SCORE: ');
        textScore.setColor(cc.color(255, 255, 255));
        textScore.setPosition(cc.p(textScore.getContentSize().width * 0.6, size.height * 0.95));
        this.addChild(textScore);

        var score = ccui.TextField(this.score);
        score.setColor(cc.color(255, 255, 255));
        score.setPosition(cc.p(textScore.getContentSize().width * 1.5  , size.height * 0.95));
        this.addChild(score);

        var plane = new Plane('myRes/textureTransparentPack.png', size.width / 2, size.height * 0.1, cc.rect(0, 570, 45, 33));
        this.addChild(plane.img);
    },
    background: function() {
        var size = cc.director.getVisibleSize();

        var background = cc.Sprite.create(res.base.game_background, cc.rect(0, 0, 220, 525));
        var background_size = background.getContentSize();
        background.setPosition(cc.p(size.width / 2, size.height / 2));
        background.setScale(size.width / background_size.width, size.height / background_size.height);
        this.addChild(background, 0);
    }

});