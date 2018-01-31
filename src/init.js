/**
 * @author yellow
 */
const pegjsParse = require('./core/parser').parse;
const traversal = require('./core/tree');
const subnodes = require('./core/subnodes');

const build = function (node) {
	traversal(node, {
		subnodesAccessor: function (node) {
			var list = subnodes(node);
			if (!list)
				return [];
			for (var i = 0; i < list.length; i++)
				list[i].parent = node;
			return list;
		}
	});
	return node;
}
/**
 * parse nodes
 */
const parse = function (str) {
	const nodes = pegjsParse(str);
	return build(nodes);
}
/**
 * search node by depth
 */
const getUniformsAndAttributes = function (ast) {
	const uniforms = [], attributes = [];
	const next = function (nodes) {
		//顺序遍历
		nodes.forEach(node => {
			if (node.type === 'preprocessor') {
				if(node.guarded_statements){
					next(node.guarded_statements);
				}
				if(node.elseBody){
					next([node.elseBody]);
				}
			}
			else if(node.type === 'preprocessor' && node.elseBody){

			}
			else if (node.type === 'declarator') {
				next(node.declarators);
			} 
			else if (node.type === 'declarator_item') {
				const typeAttribute = node.parent.typeAttribute;
				if(typeAttribute.qualifier === 'uniform'){
					uniforms.push(node);
				}else if(typeAttribute.qualifier === 'attribute'){
					attributes.push(node);
				}
			}
		});
	}
	next(ast.statements);
	return [uniforms,attributes];
}

module.exports = {
	parse: parse,
	getUniformsAndAttributes: getUniformsAndAttributes
}