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
	const func = {};
	const active = {};
	const define = {};
	const expression = [];
	const uniforms = [], attributes = [];
	const _uniforms = [], _attributes = [];

	const next = function (nodes, identify = 'none') {
		//顺序遍历
		nodes.forEach(node => {
			//处理宏定义
			if (node.type === 'preprocessor') {
				//1.首先寻找define
				if (node.directive === '#define') {
					define[node.identifier] = node.token_string;
				}
				if ((node.directive === '#ifdef' && define[node.value]) || (node.directive === '#ifndef' && !define[node.value])) {
					if (node.guarded_statements) {
						next(node.guarded_statements, identify);
					}
				}
				if (node.directive === '#if') {
					for (const key in define) {
						const reg = new RegExp(`\\b${key}\\b`, 'gi');
						if (node.value.match(reg)) {
							next(node.guarded_statements, identify);
						}
					}
				}
				if (node.elseBody) {
					next([node.elseBody], identify);
				}
			}
			else if (node.type === 'function_declaration') {
				if (node.name === 'main') {
					next(node.body.statements, 'main');
				}
			}
			else if(node.type === 'postfix'){
				if(identify === 'main'){
					next([node.expression],identify);
				}
			}
			else if (node.type === 'expression') {
				next([node.expression], identify);
			}
			else if (node.type === 'binary') {
				//左边是等式
				if(node.left.type === 'identifier'){
					active[node.left.name] = 1;
				}else{
					next([node.left], identify);
				}
				if (node.right.type === 'identifier') {
					active[node.right.name] = 1;
				} else {
					next([node.right], identify);
				}
			}
			else if (node.type === 'function_call') {
				if(identify === 'main'){
					node.parameters.forEach(parameter => {
						next([parameter], identify);
					});
				}
			}
			else if (node.type === 'identifier') {
				if (identify === 'main')
					active[node.name] = 1;
			}
			else if (node.type === 'declarator') {
				if (node.typeAttribute) {
					next(node.declarators, node.typeAttribute.qualifier||identify);
				} else {
					next(node.declarators, identify);
				}
			}
			else if (node.type === 'declarator_item') {
				if (identify === 'uniform') {
					_uniforms.push({
						name: node.name.name,
						type: node.parent.typeAttribute.name
					});
				} else if (identify === 'attribute') {
					_attributes.push({
						name: node.name.name,
						type: node.parent.typeAttribute.name
					});
				} else if (identify === 'varying') {
					const s = "";
				} else if(identify === 'main') {
					next([node.initializer],identify);
				}
			}
		});
	}
	next(ast.statements);
	//过滤non-actived的变量或者对象
	_uniforms.forEach(uniform => {
		if (active[uniform.name])
			uniforms.push(uniform);
	});
	_attributes.forEach(attribute => {
		if (active[attribute.name])
			attributes.push(attribute);
	});
	return [uniforms, attributes];
}

module.exports = {
	parse: parse,
	getUniformsAndAttributes: getUniformsAndAttributes
}