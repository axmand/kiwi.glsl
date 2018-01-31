/**
 * @author yellow
 */
const pegjsParse = require('./core/parser').parse;
const traversal = require('./core/tree');
const subnodes = require('./core/subnodes');

const build = function(node){
    traversal(node, {
		subnodesAccessor: function(node) {
			var list = subnodes(node);
			if (!list)
				return [];
			for (var i=0; i<list.length; i++)
				list[i].parent = node;
			return list;
		}
	});
	return node;
}

const parse = function(str){
    const nodes = pegjsParse(str);
    return build(nodes);
}

const getUniformsAndAttributes = function(ast){
	const uniforms=[];
	const attributes=[];
	// declarator
	ast.statements.forEach(element => {
		if(element.type === 'declarator'){
			if(element.typeAttribute.qualifier === 'attribute'){
				attributes.push(element);
			}else if(element.typeAttribute.qualifier === 'uniform'){
				uniforms.push(element);
			}
		}
	});
	return [uniforms,attributes];
}

module.exports = {
	parse:parse,
	getUniformsAndAttributes:getUniformsAndAttributes
}