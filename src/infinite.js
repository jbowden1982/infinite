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

                call_handler: function () {this._handler();},

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
                    return !!this.bound.innerHeight ? this.bound.innerHeight : this.bound.offsetHeight;
                },

                bind: function(binding) {

                    this.bound = !!binding ? binding : $window;

                    this.bound.addEventListener("scroll", this._handler.bind(this));
                },

                _ready: function() {
                    this.busy = false;

                    return (this.done || this.pause || !this.bound) ? false : !function() {
                        return (this._offset() < this._offsetDocumentEnd(this._documentHeight())) ? this.fire(this.handler) : false;
                    }.bind(this)();
                },

                _done: function () {
                    this.done = true;
                },

                fire: function (cb) {
                    this.busy = true;

                    return !!cb ? !function () {
                        cb(this._ready, this._done)
                        return true;
                    }.bind(this)() : false;
                },

                _handler: function () {
                    return (this.busy || this.done || this.paused) ? false : !!function () {

                        return (this._offset() > this._offsetDocumentEnd(this._documentHeight())) ? this.fire(this.handler) : true;
                    }.bind(this)()
                }
            };

            function get(id, instance_binding, instance_handler) {
                var results = instances.filter(function(obj) {
                    return obj.id == id;
                });
                return ((results.length && !!id) || (!!id && !!instance_binding && !!instance_handler) ? function() {
                    if (!results.length) {
                        var instance = new Infinite();

                        instance.id = !!id ? id : DEFAULT_ID + total_defaults;

                        instance.bind(instance_binding);
                        instance.handler = instance_handler;
                        total_defaults++;

                        instances.push(instance);

                        return instance;
                    } else {
                        return results[0];
                    }
                }() : !function (args) {
                    throw new InsufficientParameterException({"method": "infinite.get", "params": args});
                }(arguments))
            }

            function InsufficientParameterException(value) {
                this.value = value;
                this.message = "Do not conform to the required parameters.";
                this.toString = function() {
                    return this.value + this.message;
                };
            }

            function destroy(id) {
                for (var i = 0; i < instances.length; i++) {
                    var destroyedInstance = instances[i].id === id ? instances.splice(i, 1)[0] : null;
                    !!destroyedInstance ? destroyedInstance.bound.removeEventListener("scroll", this.handler) : null;
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
