'use strict';

var page = require('page');
var utils = require('./utils');

module.exports = function(Vue) {
    var component = Vue.directive('component');
    var router = require('./router')(Vue, page, utils);
    var go = require('./go')(Vue, utils);
    var _ = Vue.util;
    var parsers = Vue.parsers;

    _.extend(router, component);
    _.extend(router, {
        bind: function(argument) {
            this._isDynamicLiteral = true;

            component.bind.call(this);

            this.init();
        },

        /*
            copied/pasted from https://github.com/yyx990803/vue/blob/master/src/directives/component.js
            pass data properties to the view
            TODO: what the best way to pass data?
        */
        build: function() {
            if (this.keepAlive) {
                var cached = this.cache[this.ctorId];

                if (cached) {
                    return cached;
                }
            }

            var vm = this.vm;
            var el = parsers.template.clone(this.el);
            var location = this._location;
            var router = {
                params: location.params,
                queryParams: location.queryParams
            };

            if (this._states) {
                router.state = location.state;
                router.isState = function(stateName) {
                    return router.state === stateName;
                }
            }

            var data = _.extend(this._routerData.data || {}, {
                $router: router
            });

            if (this.Ctor) {
                var child = vm.$addChild({
                    el: el,
                    _asComponent: true,
                    data: function() {
                        return data;
                    }
                }, this.Ctor);

                if (this.keepAlive) {
                    this.cache[this.ctorId] = child;
                }

                return child;
            }
        }
    });

    Vue.directive('view', router);
    Vue.directive('go', go);
};
