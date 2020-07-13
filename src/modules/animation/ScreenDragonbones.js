/**
 * Created by GSN on 7/9/2015.
 */


function extend(subClass, superClass) {
    var F = function () { };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;

    subClass.superClass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor)
        superClass.prototype.constructor = superClass;
}

var UFO = (function() {
    var singleton = null;

    var constructor = function () {
        cc.spriteFrameCache.addSpriteFrames(res.base.plist.ufo);
        this.frame = [null, null, null, null];

        this.createUFO = function(container) {
            var random_idx = Math.floor(Math.random() * this.frame.length);
            var ufo_obj = this.frame[random_idx];
            if (!ufo_obj) {
                ufo_obj = new cc.Sprite('#lvl1_map' + (random_idx + 1) + '.png');
                ufo_obj.setPosition(cc.p(-ufo_obj.getContentSize().width, -ufo_obj.getContentSize().height));
                this.frame[random_idx] = ufo_obj;
                container.addChild(ufo_obj, 1);
            }

            var size = cc.director.getVisibleSize();
            var random_width = size.width * (0.15 + Math.random()*0.7);
            ufo_obj.runAction(cc.sequence(
                cc.callFunc(() => ufo_obj.setPosition(cc.p(random_width, size.height + ufo_obj.getContentSize().height))),
                cc.MoveTo(7, cc.p(random_width, - ufo_obj.getContentSize().height))
            ));
        }
    };

    return {
        getInstance: function() {
            if (!singleton) singleton = new constructor();
            return singleton;
        }
    }
})();

var Plane = function (container, name = '#ship03.png') {
    var size = cc.director.getVisibleSize();
    cc.spriteFrameCache.addSpriteFrames(res.base.plist.hit);
    // Attr
    this.container = container;
    this.plane = new cc.Sprite(name);
    this.plane.setPosition(cc.p(size.width / 2, -this.plane.getContentSize().height));
    // Add and begin effect
    container.addChild(this.plane, 10);
    this.plane.runAction(cc.MoveTo(1, cc.p(size.width/2, size.height * 0.1)));
};

Plane.prototype = {
    enableMove: function() {
        var plane_parent = this;

        this.mouse_listener = cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove: function(event) {
                var pos = event.getLocation(), target = event.getCurrentTarget();
                target.setPosition(cc.p(pos.x, pos.y));
            },
            onMouseDown: function (event) {
                if (event.getButton() == cc.EventMouse.BUTTON_LEFT) {
                    plane_parent.stopFire = false;

                   if (!plane_parent.haveFireAnimation) {
                       var animation = new cc.Animation();
                       animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('ship02.png'));
                       animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('ship01.png'));
                       animation.setDelayPerUnit(1 / 14);
                       animation.setRestoreOriginalFrame(true);

                       cc.animationCache.addAnimation(animation, 'fire');
                       plane_parent.haveFireAnimation = true;
                   }
                    var action = cc.animate(cc.animationCache.getAnimation('fire'));
                    var sequence_action = cc.sequence(
                        action,
                        cc.callFunc(plane_parent.createBullet.bind(plane_parent)),
                        action.reverse(),
                        cc.callFunc(() => plane_parent.stopFire && plane_parent.plane.stopActionByTag(999))
                    ).repeatForever();
                    sequence_action.setTag(999);
                    plane_parent.plane.runAction(sequence_action);
                }
            },
            onMouseUp: function () {
                plane_parent.stopFire = true;
            }
        }, this.plane);
    },
    createBullet: function() {
        var size = cc.director.getVisibleSize();
        var bullet = new cc.Sprite('#W1.png'), bullet_2 = new cc.Sprite('#W1.png');

        var bulletPositionX = this.plane.getPositionX(), bulletPositionY = this.plane.getPositionY();
        var planeSize = this.plane.getContentSize();

        bullet.setPosition(cc.p(bulletPositionX - planeSize.width / 4, bulletPositionY));
        bullet_2.setPosition(cc.p(bulletPositionX  + planeSize.width / 4, bulletPositionY));
        this.container.addChild(bullet, 2);
        this.container.addChild(bullet_2, 1);

        bullet.runAction(cc.sequence(
            cc.MoveTo(0.7, cc.p(bulletPositionX - planeSize.width / 4, size.height + bullet.getContentSize().height)),
            cc.callFunc(() => bullet.removeFromParent())
        ));

        bullet_2.runAction(cc.sequence(
            cc.MoveTo(0.7, cc.p(bulletPositionX + planeSize.width / 4, size.height + bullet_2.getContentSize().height)),
            cc.callFunc(() => bullet_2.removeFromParent())
        ));
    }
};

// Abstract class Enemy ------------------------------------------
var Enemy = function (container) {
    this.enemy = new cc.Sprite(this.name || '#E0.png');
    this.container = container;

    var size = cc.director.getVisibleSize();
    this.enemy.setPosition(cc.p(size.width / 2, size.height / 2));

    container.addChild(this.enemy, 10);
    this.initPlane();
};

Enemy.prototype = {
    initPlane: function() { cc.log('Abstract method, need implementation.') },
};

// Declare Implement Class Of Enemy
var EnemyType0 = function (container) {
    this.name = '#E0.png';
    EnemyType0.superClass.constructor.call(this, container);
};

// Enemy Manager
var EnemyManager = {
    subClass: [],
    createEnemy: function(container) {
        var random_id = Math.floor(Math.random() * this.subClass.length);
        return new this.subClass[random_id](container);
    }
};
// Extend Class From Enemy
([EnemyType0])
    .forEach(subClass => {
        extend(subClass, Enemy);
        EnemyManager.subClass.push(subClass);
    });

// Implement detail of type 0 enemy
EnemyType0.prototype.initPlane = function () {
    cc.log('Heeeeeeeeeeee');
};




var ScreenDragonbones = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,
    score: 0,
    lives: 3,

    ctor:function() {
        this._super();
        this.plane = new Plane(this);
        this.ufo = UFO.getInstance();
        this.createBackground();
        this.setupPlane();

        EnemyManager.createEnemy(this);
    },
    createBackground: function() {
        var size = cc.director.getVisibleSize();

        var background = new cc.Sprite('#bg01.png');
        var background_size = background.getContentSize();
        background.setPosition(cc.p(size.width / 2, size.height * 0.5));
        background.setScale(size.width / background_size.width, size.height / background_size.height);
        this.addChild(background, 0);

        var background_2 = new cc.Sprite('#bg01.png');
        background_2.setPosition(cc.p(size.width / 2,  size.height * 1.5 ));
        background_2.setScale(size.width / background_size.width, (size.height +10) / background_size.height);
        this.addChild(background_2, 0);

        background.runAction(cc.sequence(
            cc.MoveTo(8, cc.p(size.width / 2, size.height * -0.5 )),
            cc.callFunc(() => background.setPosition(cc.p(size.width / 2, size.height * 1.5 ))),
            cc.MoveTo(8, cc.p(size.width / 2, size.height * 0.5 ))
        ).repeatForever());

        background_2.runAction(cc.sequence(
            cc.MoveTo(16, cc.p(size.width / 2, size.height * -0.5)),
            cc.callFunc(() => background_2.setPosition(cc.p(size.width / 2, size.height * 1.5 )))
        ).repeatForever());

        setInterval(() => this.ufo.createUFO(this), 10000);
    },
    setupPlane: function() {
        setTimeout(this.plane.enableMove.bind(this.plane), 1000);
    }
});