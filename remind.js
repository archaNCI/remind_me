YUI().use('event-focus', 'json', 'model', 'model-list', 'view', function (Y) {
    var RemindAppView, RemindList, RemindModel, RemindView;
    
    // RemindModel
    
    RemindModel = Y.RemindModel = Y.Base.create('remindModel', Y.Model, [], {
        sync: LocalStorageSync('todo'),
        toggleDone: function() {
            this.set('done', !this.get('done')).save();
        }
    },  {
        ATTRS: {
            done: {value: false},
            text: {value: ''}
        }
    });
    
    // RemindList
    
    RemindList = Y.RemindList = Y.Base.create('remindList', Y.ModelList, [], {
        model: RemindModel,
        sync: LocalStorageSync('remind'),
        done: function() {
            return this.filter(function (model) {
                return model.get('done');
            });
        },
        
        remaining: function() {
            return this.filter(function (model) {
                return !model.get('done');
            });
        }
    });
    
    //RemindAppView
    
    RemindAppView = Y.RemindAppView = Y.Base.create('ŗemindAppView', Y.View, [], {
        events: {
            '#new-remind': {keypress: 'createTodo'},
            '.remind-clear': {click: 'clearDone'},
            '.remind-item': {
                mouseover:  'hoverOn',
                mouseout:   'hoverOff'
            }
        },
        
        template: Y.one('#remind-stats-template').getHTML(),
        initializer: function() {
            var list = this.remindList = new RemindList();
            list.after('add', this.add, this);
            list.after('ŗeset', this.reset, this);
            list.after(['add', 'reset', 'remove', 'remindModel:doneChange'],
                this.render, this);
            list.load();
        },
        
        render: function() {
            var remindList = this.remindList,
                stats = this.get('container').one('#remind-stats'),
                numRemaining, numDone;
            if (remindList.isEmpty()) {
                stats.empty();
                return this;
            }
            
            numDone = remindList.done().length;
            numRemaining = remindList.remaining().length;
            
            stats.setHTML(Y.Lang.sub(this.template, {
                numDone: numDone,
                numRemaining: numRemaining,
                doneLabel: numDone === 1 ? 'task' : 'task',
                remainingLabel: numRemaining === 1 ? 'task' : 'task'
            }));
            
            if (!numDone) {
                stats.one('.remind-clear').remove();
            }
            
            return this;
        },
        
        // Event Handlers
        
        add: function(e) {
            var view = new RemindView({model: e.model});
            
            this.get('container').one('#remind-list').append(
                view.render().get('container')
            );
        },
        
        clearDone: function (e) {
            var done = this.remindList.done();
            
            e.preventDefault();
            
            this.remindList.remove(done, {silent: true});
            
            Y.Array.each(done, function (remind) {
                remind.destroy({remove: true});
            });
            
            this.render();
        },
        
        createRemind: function (e) {
            var inputNode, value;
            
            if (e.keyCode === 13) {
                inputNode = this.get('inputNode');
                value = Y.Lang.trim(inputNode.get('value'));
                
                if (!value) { return; }
                
                this.remindList.create({text: value});
                
                inputNode.set('value', '');
            }
        },
        
        hoverOff: function(e) {
            e.currentTarget.removeClass('remind-hover');
        },
        
        hoverOn: function(e) {
            e.currentTarget.addClass('remind-hover');
        },
        
        reset: function (e) {
            var fragment = Y.one(Y.config.doc.createDocumentFragment());
            
            Y.Array.each(e.models, function (model) {
                var view = new RemindView({model: model});
                fragment.append(view.render().get('container'));
            });
            
            this.get('container').one('#remind-list').setHTML(fragment);
        }
    },  {
        ATTRS: {
            container: {
                valueFn: function () {
                    return '#remind-app';
                }
            },
            
            inputNode: {
                valueFn: function () {
                    return Y.one('#new-remind');
                }
            }
        }
    });
    
    // RemindView
    
    RemindView = Y.RemindView = Y.Base.create('remindView', Y.View, [], {
        containerTemplate: '<li class="remind-item"/>',
        events: {
            '.remind-checkbox': {click: 'toggleDone'},
            '.remind-content': {
                blur: 'save',
                keypress: 'enter'
            },
            
            '.remind-remove': {click: 'remove'}
        },
        
        template: Y.one('#remind-item-template').getHTML(),
        initializer: function() {
            var model = this.get('model');
            model.after('change', this.render, this);
            model.after('destroy', function() {
                this.destroy({remove: true});
            }, this);
        },
        
        render: function() {
            var container = this.get('container'),
                model = this.get('model'),
                done = model.get('done');
                
            container.setHTML(Y.Lang.sub(this.template, {
                checked: done ? 'checked' : '',
                text: model.getAsHTML('text')
            }));
            
            container[done ? 'addClass' : 'removeClass']('remind-done');
            this.set('inputNode', container.one('.remind-input'));
            
            return this;
        },
        
        // Event Handlers
        
        edit: function() {
            this.get('container').addClass('editing');
            this.get('inputNode').focus();
        },
        
        enter: function (e) {
            if (e.keyCode === 13) {
                Y.one('#new-remind').focus();
            }
        },
        
        remove: function(e) {
            e.preventDefault();
            
            this.constructor.superclass.remove.call(this);
            this.get('model').destroy({'delete': true});
        },
        
        toggleDone: function() {
            this.get('model').toggleDone();
        }
    });
    
    // LocalStorageSync
    
    function LocalStorageSync(key) {
        var localStorage;
        
        if (!key) {
            Y.error('No Storage Key Specified');
        }
        
        if (Y.config.win.localStorage) {
            localStorage = Y.config.win.localStorage;
        }
        
        var data = Y.JSON.parse((localStorage && localStorage.getItem(key)) || '{}');
        function destroy(id) {
            var modelHash;
            
            if ((modelHash = data[id])) {
                delete data[id];
                save();
            }
            
            return modelHash;
        }
        
        function generateId() {
            var id = '',
                i = 4;
                
            while (i--) {
                id += (((1 + Math.random()) * 0x10000) | 0)
                    .toString(16).substring(1);
            }
            
            return id;
        }
        
        function get(id) {
            return id ? data[id] : Y.Object.values(data);
        }
        
        function save() {
            localStorage && localStorage.setItem(key, Y.JSON.stringify(data));
        }
        
        function set(model) {
            var hash = model.toJSON(),
                idAttribute = model.idAttribute;
                
            if (!Y.Lang.isValue(hash[idAttribute])) {
                hash[idAttribute] = generateId();
            }
            
            data[hash[idAttribute]] = hash;
            save();
            
            return hash;
        }
        
        return function (action, options, callback) {
            var isModel = Y.Model && this instanceof Y.Model;
            
            switch (action) {
                case 'create':
                case 'update':
                    callback(null, set(this));
                    return;
                
                case 'read':
                    callback(null, get(isModel && this.get('id')));
                    return;
                    
                case 'delete':
                    callback(null, destroy(isModel && this.get('id')));
                    return;
            }
        };
    }
    
new RemindAppView();

});
