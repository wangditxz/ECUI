/*
@example
<select ui="type:combox" name="age">
    <option value="20">20</option>
    <option value="21" selected="selected">21</option>
    <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
    <!-- 这里可以放input元素，如果没有自动生成 -->
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function refresh(combox) {
        var text = ui.Select.prototype.getValue.call(combox).toUpperCase();

        combox.getItems().forEach(function (item) {
            if (item.getContent().toUpperCase().indexOf(text) < 0) {
                dom.addClass(item.getMain(), 'ui-hide');
            } else {
                dom.removeClass(item.getMain(), 'ui-hide');
            }
        });
        combox.alterItems();
    }

    /**
     * 组合框控件。
     * 组合框可以在下拉选项中选择，也可以输入内容。
     * @control
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            util.setDefault(options, 'readOnly', false);
            ui.Select.call(this, el, options);
            this._bFilter = options.filter === true;
        },
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Select.prototype.Item,
                'ui-combox-item'
            ),

            /**
             * @override
             */
            $blur: function (event) {
                ui.Select.prototype.$blur.call(this, event);
                if (this._bFilter && !this.getSelected()) {
                    this.$setValue('');
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                if (this._bFilter) {
                    var options = this.$getSection('Options');
                    if (this.getInput().value) {
                        if (!options.isShow()) {
                            ui.Select.prototype.$click.call(this, event);
                        }
                    } else {
                        options.hide();
                    }
                } else if (!this.$getSection('Options').isShow()) {
                    ui.Select.prototype.$click.call(this, event);
                    this.getItems().forEach(function (item) {
                        dom.removeClass(item.getMain(), 'ui-hide');
                    });
                    this.alterItems();
                }
            },

            /**
             * @override
             */
            $disable: function () {
                ui.Select.prototype.$disable.call(this);
                this.getInput().style.display = 'none';
            },

            /**
             * @override
             */
            $enable: function () {
                ui.Select.prototype.$enable.call(this);
                this.getInput().style.display = '';
            },

            /**
             * @override
             */
            $input: function (event) {
                ui.Select.prototype.$input.call(this, event);

                this._sHref = dom.getAttribute(this.getMain(), 'href');
                if (this._sHref) {
                    if (!this._oHandle) {
                        this.removeAll(true);
                        this._oHandle = util.timer(
                            function () {
                                var args = [this._sHref, this.getInput().value];
                                delete this._sHref;
                                core.request(util.stringFormat.apply(null, args), function (data) {
                                    delete this._oHandle;
                                    this.add(data);
                                    if (this._sHref !== undefined) {
                                        core.dispatchEvent(this, 'input');
                                    }
                                }.bind(this));
                            },
                            1000,
                            this
                        );
                    }
                }

                this.$click(event);

                var text = ui.Select.prototype.getValue.call(this),
                    selected;

                this.getItems().forEach(function (item) {
                    if (item.getContent() === text) {
                        selected = item;
                    }
                });
                if (selected) {
                    this.setSelected(selected);
                } else {
                    this.$setSelected();
                    refresh(this);
                }
                this.alterStatus(text ? '-placeholder' : '+placeholder');
            },

            /**
             * @override
             */
            getValue: function () {
                var item = this.getSelected();
                return item ? item.getValue() : '';
            },

            /**
             * @override
             */
            setSelected: function (item) {
                ui.Select.prototype.setSelected.call(this, item);

                item = this.getSelected();
                if (item) {
                    this.$setValue(item.getContent());
                }

                refresh(this);
            },

            /**
             * @override
             */
            setValue: function (value) {
                this.$setValue(value);
                ui.Select.prototype.setValue.call(this, value);
            }
        }
    );
}());
