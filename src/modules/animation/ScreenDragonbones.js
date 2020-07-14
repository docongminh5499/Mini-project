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


        //var ship = new Ship();
        //ship.abc();
    }
})();

//var BossShip = Ship.extend({
//    abc: function(){
//        this._super(x, y);
//    }
//});
//
//var Ship = cc.Class.extend({
//    ctor: function(){
//      //khoi tao o day
//    },
//
//    abc: function(x, y){
//
//    },
//});

var Plane = function (container, name = '#ship03.png') {
    cc.spriteFrameCache.addSpriteFrames(res.base.plist.hit);
    var size = cc.director.getVisibleSize();
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
        var bullet = null, bullet_2 = null, new_1 = false, new_2 = false;
        for (var index = 0; index < this.container.bullets.length; index++) {
            var bullet_obj = this.container.bullets[index];
            if (!bullet_obj.isVisible() && !bullet) { bullet = bullet_obj; continue }
            if (!bullet_obj.isVisible() && bullet && !bullet_2) bullet_2 = bullet_obj;
            if (bullet_2) break;
        }
        if (!bullet) {
            bullet = new cc.Sprite('#W1.png');
            bullet_2 = new cc.Sprite("#W1.png");
            new_1 = new_2 = true;
            this.container.bullets.push(bullet);
            this.container.bullets.push(bullet_2);
        } else if (!bullet_2) {
            new_2 = true;
            bullet.setVisible(true);
            bullet_2 = new cc.Sprite("#W1.png");
            this.container.bullets.push(bullet_2);
        } else {
            bullet.setVisible(true);
            bullet_2.setVisible(true);
        }

        var size = cc.director.getVisibleSize();
        var bulletPositionX = this.plane.getPositionX(), bulletPositionY = this.plane.getPositionY();
        var planeSize = this.plane.getContentSize();

        bullet.setPosition(cc.p(bulletPositionX - planeSize.width / 4, bulletPositionY));
        bullet_2.setPosition(cc.p(bulletPositionX  + planeSize.width / 4, bulletPositionY));
        new_1 && this.container.addChild(bullet, 2);
        new_2 && this.container.addChild(bullet_2, 1);

        bullet.runAction(cc.sequence(
            cc.MoveTo(0.7, cc.p(bulletPositionX - planeSize.width / 4, size.height + bullet.getContentSize().height)),
            cc.callFunc(() => {
                bullet.setVisible(false);
                bullet.setPosition(cc.p(-1000, -1000));
            })
        ));

        bullet_2.runAction(cc.sequence(
            cc.MoveTo(0.7, cc.p(bulletPositionX + planeSize.width / 4, size.height + bullet_2.getContentSize().height)),
            cc.callFunc(() => {
                bullet_2.setVisible(false);
                bullet_2.setPosition(cc.p(-1000, -1000));
            })
        ));
    }
};

// Abstract class Enemy ------------------------------------------
var Enemy = function (container) {
    this.enemy = new cc.Sprite(this.name || '#E0.png');
    this.container = container;

    this.initPlane();
    this.fly();

    container.addChild(this.enemy, 10);
};

Enemy.prototype = {
    initPlane: function() { cc.log('Abstract method, need implementation.') },
    destroy: function() {
        //this.enemy.removeFromParent();
        var animation = new cc.Animation();
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('hit.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode1.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode2.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode3.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.name.replace('#', '') || 'E0.png'));
        animation.setDelayPerUnit(1 / 14);
        animation.setRestoreOriginalFrame(true);

        this.enemy.runAction(cc.sequence(
            cc.animate(animation),
            cc.callFunc(() => {
                this.enemy.setVisible(false);
                this.enemy.setPosition(cc.p(-1000, 1000));
            })
        ));

    },
    fly: function() {
        var size = cc.director.getVisibleSize();
        var random_width = size.width * Math.random() * 0.8 + 0.1;

        this.enemy.setPosition(cc.p(random_width, size.height + 200));
        this.enemy.runAction(cc.sequence(
            cc.MoveTo(5, cc.p(random_width, -this.enemy.getContentSize().height)),
            cc.callFunc(() => {
                this.enemy.setVisible(false);
                this.enemy.setPosition(cc.p(-1000, 1000));
            })
        ));
    }
};

// Declare Implement Class Of Enemy
var EnemyType0 = function (container) {
    this.name = '#E0.png';
    this.type = 0;
    EnemyType0.superClass.constructor.call(this, container);
};

var EnemyType1 = function (container) {
    this.name = '#E1.png';
    this.type = 1;
    EnemyType0.superClass.constructor.call(this, container);
};

// Extend Class From Enemy
([EnemyType0, EnemyType1]).forEach(subClass => extend(subClass, Enemy));

// Implement detail of type 0 enemy
EnemyType0.prototype.initPlane = function () {
    this.enemy.setRotationX(180);
};

EnemyType1.prototype.initPlane = function () {
    this.enemy.setRotationX(180);
};



var ScreenDragonbones = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor:function() {
        this._super();
        this.plane = new Plane(this);
        this.ufo = UFO.getInstance();
        this.score = 0;
        this.lives = 3;
        this.enemies = [];
        this.bullets = [];

        this.createBackground();
        this.setupPlane();
        this.schedule(() => {
            var type = [EnemyType0, EnemyType1];
            var random_type = Math.floor(Math.random() * type.length);
            var enemy_plane = null;
            for (var index = 0; index < this.enemies.length; index++)
                if (!this.enemies[index].enemy.isVisible() && this.enemies[index].type == random_type) { enemy_plane = this.enemies[index]; break; }
            if (!enemy_plane) {
                enemy_plane = new type[random_type](this);
                this.enemies.push(enemy_plane);
            } else {
                enemy_plane.enemy.setVisible(true);
                enemy_plane.fly();
            }
        }, 1);

        var layer = this;
        this.schedule(function() {
            layer.enemies.forEach(function(enemy) {
                layer.bullets.forEach(function (bullet) {
                    var enemyBox = enemy.enemy.getBoundingBox();
                    var bulletBox = bullet.getBoundingBox();
                        if (cc.rectIntersectsRect(enemyBox, bulletBox)) {
                            enemy.destroy();
                            bullet.setVisible(false);
                            bullet.setPosition(cc.p(-1000, -1000));
                        }
                });
            });
        }, 1 /60);
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

        this.schedule(() => this.ufo.createUFO(this), 10);

    },
    setupPlane: function() {
        this.scheduleOnce(this.plane.enableMove.bind(this.plane), 1);
    },
});