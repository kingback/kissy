/**
 * @ignore
 * delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/delegate-children", function (S, Node) {

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function DelegateChildren() {
        var self = this;
        self.__childrenIdMap = {};
        self.__childClsTag = S.guid('ks-component-child');
        self.on('afterRenderChild', self._processRenderChildForDelegate, self)
            .on('afterRemoveChild', self._processRemoveChildForDelegate, self);
    }

    S.augment(DelegateChildren, {

        handleChildrenEvents: function (e) {
            if (!this.get("disabled")) {
                var control = this.getOwnerControl(e);
                if (control && !control.get("disabled")) {
                    // Child control identified; forward the event.
                    switch (e.type) {
                        case Gesture.start:
                            control.handleMouseDown(e);
                            break;
                        case Gesture.end:
                            control.handleMouseUp(e);
                            break;
                        case Gesture.tap:
                            control.performActionInternal(e);
                            break;
                        case "mouseenter":
                            control.handleMouseEnter(e);
                            break;
                        case "mouseleave":
                            control.handleMouseLeave(e);
                            break;
                        case "contextmenu":
                            control.handleContextMenu(e);
                            break;
                        case "dblclick":
                            control.handleDblClick(e);
                            break;
                        default:
                            S.error(e.type + " unhandled!");
                    }
                }
            }
        },

        _processRenderChildForDelegate: function (e) {
            if (e.target == this) {
                var child = e.component,
                    el = child.get('el');
                el.addClass(this.__childClsTag);
                this.__childrenIdMap[child.get('id')] = child;
            }
        },

        _processRemoveChildForDelegate: function (e) {
            if (e.target == this) {
                delete this.__childrenIdMap[e.component.get('id')];
            }
        },

        __bindUI: function () {

            var self = this,
                events = Gesture.start +
                    " " + Gesture.end +
                    " " + Gesture.tap;

            if (Gesture.cancel) {
                events += ' ' + Gesture.cancel;
            }

            if (!isTouchEventSupported) {
                events += " mouseenter mouseleave contextmenu " +
                    (ie && ie < 9 ? "dblclick " : "");
            }

            self.get("el").delegate(events, '.' + self.__childClsTag, self.handleChildrenEvents, self);
        },

        /**
         * Get child component which contains current event target node.
         * @protected
         * @param {KISSY.Event.DOMEventObject} e event
         * @return {KISSY.Component.Controller}
         */
        getOwnerControl: function (e) {
            return this.__childrenIdMap[e.currentTarget.id];
        }
    });

    return DelegateChildren;
}, {
    requires: ['node']
});