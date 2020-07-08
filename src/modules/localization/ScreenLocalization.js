/**
 * Created by GSN on 7/9/2015.
 */





// Game
var ScreenLocalization = cc.Layer.extend({
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

        var score = ccui.TextField(this.score);
        score.setColor(cc.color(0,0,0,1));
        score.setPosition(cc.p(0, 0));

        this.addChild(score);
    },
});