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
    this.rect = [cc.rect(0, 23, 100, 22), cc.rect(40, 0, 18, 70)];
    this.container = container;
    this.plane = new cc.Sprite(name);
    this.stopFire = true;
    this.explode = new cc.Sprite('#hit.png');
    // Add and begin effect
    this.explode.setVisible(false);
    this.plane.setPosition(cc.p(size.width / 2, -this.plane.getContentSize().height));
    this.plane.runAction(cc.MoveTo(1, cc.p(size.width/2, size.height * 0.1)));
    // Add child
    container.addChild(this.plane, 10);
    container.addChild(this.explode, 10);
};

Plane.prototype = {
    enableMove: function() {
        var plane_parent = this;
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove: function(event) {
                var pos = event.getLocation(), target = event.getCurrentTarget();
                target.setPosition(cc.p(pos.x, pos.y));
            },
            onMouseDown: function (event) {
                event.getButton() == cc.EventMouse.BUTTON_LEFT && (plane_parent.stopFire = false);
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

        var bulletPositionX = this.plane.getPositionX(), bulletPositionY = this.plane.getPositionY();
        var planeSize = this.plane.getContentSize();

        bullet.setPosition(cc.p(bulletPositionX - planeSize.width / 4, bulletPositionY));
        bullet_2.setPosition(cc.p(bulletPositionX  + planeSize.width / 4, bulletPositionY));
        new_1 && this.container.addChild(bullet, 2);
        new_2 && this.container.addChild(bullet_2, 2);

        //var size = cc.director.getVisibleSize();
        //bullet.runAction(cc.sequence(
        //    cc.MoveTo(0.7, cc.p(bulletPositionX - planeSize.width / 4, size.height + bullet.getContentSize().height)),
        //    cc.callFunc(() => {
        //        bullet.setVisible(false);
        //        bullet.setPosition(cc.p(-1000, -1000));
        //    })
        //));
        //
        //bullet_2.runAction(cc.sequence(
        //    cc.MoveTo(0.7, cc.p(bulletPositionX + planeSize.width / 4, size.height + bullet_2.getContentSize().height)),
        //    cc.callFunc(() => {
        //        bullet_2.setVisible(false);
        //        bullet_2.setPosition(cc.p(-1000, -1000));
        //    })
        //));
    },
    fire: function () {
        if (!this.stopFire) {
            if (!this.haveFireAnimation) {
                var animation = new cc.Animation();
                animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('ship02.png'));
                animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('ship01.png'));
                animation.setDelayPerUnit(1 / 50);
                animation.setRestoreOriginalFrame(true);

                cc.animationCache.addAnimation(animation, 'fire');
                this.haveFireAnimation = true;
            }

            var action = cc.animate(cc.animationCache.getAnimation('fire'));
            var sequence_action = cc.sequence(
                action,
                cc.callFunc(this.createBullet.bind(this)),
                action.reverse()
            );
            this.plane.runAction(sequence_action);
        }
    },
    getBoundingBox: function () {
        var plane_x = this.plane.getPositionX(), plane_y = this.plane.getPositionY();
        var plane_size = this.plane.getContentSize();
       return cc.rect(plane_x - plane_size.width * 0.425, plane_y - plane_size.height * 0.425, plane_size.width * 0.85, plane_size.height * 0.85);
    },
    pause: function() {
        cc.eventManager.pauseTarget(this.plane);
    },
    reset: function() {
        var size = cc.director.getVisibleSize();
        this.plane.setPosition(cc.p(size.width / 2, -this.plane.getContentSize().height));
        this.plane.runAction(cc.MoveTo(1, cc.p(size.width/2, size.height * 0.1)));
        this.plane.setVisible(true);
        setTimeout(() => cc.eventManager.resumeTarget(this.plane), 1000);
    },
    destroy: function() {
        var animation = new cc.Animation();
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode1.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode2.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode3.png'));

        animation.setDelayPerUnit(1 / 14);
        animation.setRestoreOriginalFrame(true);
        animation.setLoops(4);

        this.plane.setVisible(false);
        this.explode.setPosition(this.plane.getPosition());
        this.explode.setVisible(true);

        this.explode.runAction(cc.sequence(
            cc.animate(animation).reverse(),
            cc.animate(animation),
            cc.callFunc(() => this.explode.setVisible(false))
        ));
    },
   intersectWith: function(rect) {
       for (var index =0; index < this.rect.length; index++) {
            var myRect = this.rect[index];
            myRect.x = this.plane.getPositionX() - this.plane.getContentSize().width / 2 + myRect.x;
            myRect.y = this.plane.getPositionY() - this.plane.getContentSize().height / 2 + myRect.y;

           if (cc.rectIntersectsRect(myRect, rect)) {
               return true;
           }
       };
       return false;
   }
};

// Abstract class Enemy ------------------------------------------
var Enemy = function (container) {
    this.enemy = new cc.Sprite(this.name || '#E0.png');
    this.container = container;

    this.explode = new cc.Sprite('#hit.png');
    this.explode.setVisible(false);

    this.initPlane();
    this.fly();

    container.addChild(this.enemy, 10);
    container.addChild(this.explode, 10);

    this.interval = setInterval(() => this.enemy.isVisible() && this.fire(), 1000);
};

Enemy.prototype = {
    initPlane: function() { cc.log('Abstract method, need implementation.') },
    destroy: function() {
        //this.enemy.removeFromParent();
        var animation = new cc.Animation();
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode1.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode2.png'));
        animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame('explode3.png'));

        animation.setDelayPerUnit(1 / 28);
        animation.setRestoreOriginalFrame(true);


        this.enemy.setVisible(false);

        this.explode.setPosition(this.enemy.getPosition());
        this.explode.setVisible(true);

        this.explode.runAction(cc.sequence(
            cc.animate(animation),
            cc.callFunc(() => {
                this.explode.setVisible(false);
                this.explode.setPosition(cc.p(-1000, 1000));
                this.enemy.setPosition(cc.p(-1000, 1000));
            })
        ));

    },
    fly: function() {
        var size = cc.director.getVisibleSize();
        var random_width = size.width * Math.random() * 0.8 + 0.1;
        this.enemy.setPosition(cc.p(random_width, size.height + this.enemy.getContentSize().height));
        //this.enemy.runAction(cc.MoveTo(5, cc.p(random_width, -this.enemy.getContentSize().height)));
    },
    fire: function () {
        var bullet = null, new_bullet = false;
        for (var index = 0; index < this.container.enemyBullets.length; index++) {
            if (!this.container.enemyBullets[index].isVisible()) {
                bullet = this.container.enemyBullets[index];
                break;
            }
        }
        if (!bullet) {
            bullet = new cc.Sprite('#W2.png');
            this.container.enemyBullets.push(bullet);
            new_bullet = true;
        } else bullet.setVisible(true);

        bullet.setPosition(this.enemy.getPosition());
        new_bullet && this.container.addChild(bullet, 8);
    },
    clearInterval: function () {
        clearInterval(this.interval);
    },
    intersectWith: function(rect) {
        return this.rect.all(myRect => cc.rectIntersectsRect(myRect, rect));
    }
};

// Declare Implement Class Of Enemy
var EnemyType0 = function (container) {
    this.rect = [cc.rect(0, 0, 74, 39)];
    this.name = '#E0.png';
    this.type = 0;
    EnemyType0.superClass.constructor.call(this, container);
};

var EnemyType1 = function (container) {
    this.rect = [cc.rect(0, 15 ,96, 14), cc.rect(35, 0, 26, 68)];
    this.name = '#E1.png';
    this.type = 1;
    EnemyType1.superClass.constructor.call(this, container);
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

var MyLayer = cc.LayerColor.extend({
    ctor: function() {
        var size = cc.director.getVisibleSize();
        this._super(cc.color(0, 0, 0, 0), size.width, size.height);
        this.opacityMax = 200;
        this.step = 10;
    },
    fadeIn: function() {
        this.setOpacity(this.getOpacity() + this.step);
        this.getOpacity() < this.opacityMax && setTimeout(() => this.fadeIn(), 50);
    },
    fadeOut: function() {
        this.setOpacity(this.getOpacity() - this.step);
        this.getOpacity() > 0 && setTimeout(() => this.fadeOut(), 10);
    }
});

var ScreenDragonbones = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor:function() {
        this._super();
        this.plane = new Plane(this);
        this.ufo = UFO.getInstance();
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.layer = new MyLayer();

        this.addChild(this.layer, 20);
        this.createBackground();
        this.setupPlane();
        this.addScore();

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
        }, 1.5);

        this.schedule(() => this.plane.fire(), 0.1);

        this.schedule(() => {
            this.bullets.forEach(function (bullet) {
                bullet.isVisible() && bullet.setPosition(cc.p(bullet.getPositionX(), bullet.getPositionY() + 12));
                if (bullet.getPositionY() > cc.director.getVisibleSize().height) {
                    bullet.setVisible(false);
                    bullet.setPosition(cc.p(-1000, -1000));
                }
            });

            this.enemyBullets.forEach(bullet => {
                bullet.isVisible() && bullet.setPosition(cc.p(bullet.getPositionX(), bullet.getPositionY() - 10));
                if (bullet.getPositionY() < 0) {
                    bullet.setVisible(false);
                    bullet.setPosition(cc.p(-1000, -1000));
                }

                if (bullet.isVisible() && this.plane.plane.isVisible() && this.plane.intersectWith(bullet.getBoundingBox())) {
                    bullet.setVisible(false);
                    bullet.setPosition(cc.p(-1000, -1000));
                    this.gameOver();
                }
            });

            this.enemies.forEach(enemy => {
                enemy.enemy.isVisible() && enemy.enemy.setPosition(cc.p(enemy.enemy.getPositionX(), enemy.enemy.getPositionY() - 5));
                if (enemy.enemy.getPositionY() < 0) {
                    enemy.enemy.setVisible(false);
                    enemy.enemy.setPosition(cc.p(-1000, 1000));
                }

                if (enemy.enemy.isVisible() && this.plane.plane.isVisible() && cc.rectIntersectsRect(enemy.enemy.getBoundingBox(), this.plane.getBoundingBox())) {
                   this.gameOver();
                }
            });

            this.enemies.forEach(enemy => {
                this.bullets.forEach(bullet => {

                    var enemyBox = enemy.enemy.getBoundingBox();
                    var bulletBox = bullet.getBoundingBox();
                        if (enemy.enemy.isVisible() && bullet.isVisible() && cc.rectIntersectsRect(enemyBox, bulletBox)) {
                            enemy.destroy();
                            bullet.setVisible(false);
                            bullet.setPosition(cc.p(-1000, -1000));

                            this.score += 1;
                            this.scoreText.setString(this.score);
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
    addScore: function() {
        var size = cc.director.getVisibleSize();
        this.scoreText = new gv.commonText(this.score, size.width * 0.1, size.height * 0.95);
        this.scoreText.setColor(cc.color(0, 0, 0, 255));
        this.addChild(this.scoreText, 100);
    },
    resetGame: function() {
        this.layer.fadeOut();
        this.endGameImage.setVisible(false);
        this.playAgainButton.setVisible(false);
        this.back.setVisible(false);
        this.finalScore.setVisible(false);
        this.bestScore.setVisible(false);

        this.score = 0;
        this.scoreText.setString(this.score);

        this.enemies.forEach(enemy => {
            if (enemy.enemy.isVisible()) {
                enemy.enemy.stopAllActions();
                enemy.enemy.setVisible(false);
                enemy.enemy.setPosition(cc.p(-1000, 1000));
            }
        });

        this.bullets.forEach(bullet => {
            if (bullet.isVisible()) {
                bullet.setVisible(false);
                bullet.setPosition(cc.p(-1000, -1000));
            }
        });

        this.enemyBullets.forEach(bullet => {
            if (bullet.isVisible()) {
                bullet.setVisible(false);
                bullet.setPosition(cc.p(-1000, -1000));
            }
        });

        cc.director.resume();
        this.plane.reset();
    },
    gameOver: function () {
        var best_score = cc.sys.localStorage.getItem('Best_score') || 0;
        if (best_score < this.score) cc.sys.localStorage.setItem('Best_score', this.score);

        this.plane.destroy();
        this.layer.fadeIn();

        this.scheduleOnce(() => {
            if (!this.endGameImage) {
                var size = cc.director.getVisibleSize();
                this.endGameImage = new cc.Sprite(res.base.game.gameOver);
                this.endGameImage.setPosition(cc.p(size.width / 2, size.height * 0.8));
                this.endGameImage.setVisible(false);
                this.addChild(this.endGameImage, 100);
            }

            if (!this.playAgainButton) {
                this.playAgainButton = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.3, "Play Again");
                this.addChild(this.playAgainButton, 100);
                this.playAgainButton.addClickEventListener(this.resetGame.bind(this));
            }

            if (!this.back) {
                this.back = gv.commonButton(200, 64, cc.winSize.width/2, size.height * 0.3 - 75, "Back");
                this.addChild(this.back, 100);
                this.back.addClickEventListener(() => {
                    this.enemies.forEach(enemy => enemy.clearInterval());
                    fr.view(ScreenMenu);
                });
            }

            if (!this.finalScore) {
                this.finalScore = gv.commonText('SCORE: ' + this.score, size.width / 2, size.height * 0.6);
                this.addChild(this.finalScore, 100);
            }

            if (!this.bestScore) {
                this.bestScore = gv.commonText('BEST: ' + (cc.sys.localStorage.getItem('Best_score') || 0), size.width / 2, size.height * 0.5);
                this.addChild(this.bestScore, 100);
            }

            this.finalScore.setString('SCORE: ' + this.score);
            this.bestScore.setString('BEST: ' + (cc.sys.localStorage.getItem('Best_score') || 0));

            this.endGameImage.setScale(0.5);
            this.playAgainButton.setScale(0.5);
            this.back.setScale(0.5);
            this.finalScore.setScale(0.5);
            this.bestScore.setScale(0.5);

            this.endGameImage.runAction(cc.ScaleTo(1, 1));
            this.playAgainButton.runAction(cc.ScaleTo(1, 1));
            this.back.runAction(cc.ScaleTo(1, 1));
            this.finalScore.runAction(cc.ScaleTo(1, 1));
            this.bestScore.runAction(cc.ScaleTo(1, 1));

            this.endGameImage.setVisible(true);
            this.playAgainButton.setVisible(true);
            this.back.setVisible(true);
            this.finalScore.setVisible(true);
            this.bestScore.setVisible(true);

            this.plane.pause();
        }, 0.5);
    }
});