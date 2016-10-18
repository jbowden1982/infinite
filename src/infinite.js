!!function ($window, angular, $document) {
    angular.module("infinite", []).factory("infinite", [
        function () {

            var instances = [];
            var DEFAULT_ID = "DEFAULT_INFINITE_";

            var total_defaults = 0;

            function Infinite() {}

            Infinite.prototype = {
                id: null,

                busy: false,

                done: false,

                paused: false,

                bound: null,

                handler: null,

                _offsetDocumentEnd: function(documentHeight) {
                    if (this.bound) {
                        return documentHeight - this.bound.offsetHeight - this.bound.scrollTop;
                    }
                },

                _documentHeight: function () {
                    return (this.bound && this.bound.scrollHeight) ? this.bound.scrollHeight :
                        Math.max(
                            $document[0].body.scrollHeight,
                            $document[0].body.offsetHeight,
                            $document[0].body.clientHeight,
                            $document[0].body.scrollHeight,
                            $document[0].body.offsetHeight
                        );

                },

                _offset: function () {
                    return this.bound.innerHeight;
                },

                bind: function(binding) {
                    this.unbind();

                    this.bound = !!binding ? binding : $window;

                    this.bound.addEventListener("scroll", this._handler);
                },

                _ready: function() {
                    this.busy = false;

                    return (this.done || this.pause || !this.bound) ? false : !function() {
                        return (this._offset() > this._offsetDocumentEnd(this._documentHeight())) ? this.fire(this.handler) : false;
                    }.bind(this)();
                },

                _done: function () {
                    this.done = true;
                },

                fire: function (cb) {
                    this.busy = true;

                    return !!cb ? !!cb.apply(this, [this._ready, this._done]) : false;
                },

                _handler: function () {
                    return (_this.busy || _this.done || _this.paused) ? false : !!function () {
                        return (this._offset() > this._offsetDocumentEnd(this._documentHeight())) ? this.fire(this.handler) : true;
                    }.bind(this)()
                }
            };

            function get(id, instance_binding, instance_handler) {
                return (!!id && !!instance.binding && !!instance_handler) ? function() {
                    var results = instances.filter(function(obj) {
                        return obj.id == id;
                    });

                    if (!results.length) {

                        var instance = new Infinite();

                        instance.id = !!id ? id : DEFAULT_ID + total_defaults;

                        total_defaults++;

                        instances.push(instance);

                        return instance;
                    } else {
                        return results[id];
                    }
                }() : function () {
                    throw new InsufficientParameterException("infinite.get");
                }();
            }

            function InsufficientParameterException(value) {
                this.value = value;
                this.message = "does not conform to the expected format for a zip code";
                this.toString = function() {
                    return this.value + this.message;
                };
            }

            function destroy(id) {
                for (var i = 0; i < instances.length; i++) {
                    instances[i].id === id ? instances.splice(i, 1).bound.removeEventListener("scroll", this.handler) : null;
                }
            }

            // the public widget API
            return {
                get: get,

                destroy: destroy
            };
        }
    ]);
}(window.angular.element(window), window.angular, window.angular.element(document));
