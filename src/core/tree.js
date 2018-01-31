/**
 * @author yellow
 */
const extend = require('./../utils/extend');

const traverseDepthFirstSync = function (rootNode, options) {
    options = extend({
        subnodesAccessor: function (node) { return node.subnodes; },
        userdataAccessor: function (node, userdata) { return userdata; },
        onNode: function (node, userdata) { },
        userdata: null
    }, options);

    var stack = [];
    stack.push([rootNode, options.userdata]);
    while (stack.length > 0) {
        var top = stack.pop();
        var node = top[0];
        var data = top[1];
        options.onNode(node, data);
        var subnodeData = options.userdataAccessor(node, data);
        var subnodes = options.subnodesAccessor(node);
        for (var i = 0; i < subnodes.length; i++)
            stack.push([subnodes[i], subnodeData]);
    }
    return rootNode;
}

module.exports = traverseDepthFirstSync;