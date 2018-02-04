const glsl = require('./../src/init');

const text = `#define DIRECTIONAL_LIGHT_COUNT 1
#define SHADER_NAME standard
uniform mat4 worldViewProjection ;

uniform mat4 worldInverseTranspose ;

uniform mat4 world ;

uniform vec2 uvRepeat ;

uniform vec2 uvOffset ;

attribute vec3 position;

attribute vec2 texcoord;

#if defined(AOMAP_ENABLED)
attribute vec2 texcoord2;

#endif
attribute vec3 normal;

attribute vec4 tangent;

#ifdef VERTEX_COLOR
attribute vec4 a_Color;

varying vec4 v_Color;
#endif
attribute vec3 barycentric;

#ifdef SKINNING
attribute vec3 weight;

attribute vec4 joint;

uniform mat4 skinMatrix [JOINT_COUNT];

mat4 getSkinMatrix(float idx) {
    return skinMatrix[int(idx)];
}
#endif

varying vec2 v_Texcoord;
varying vec3 v_Normal;
varying vec3 v_WorldPosition;
varying vec3 v_Barycentric;
#if defined(PARALLAXOCCLUSIONMAP_ENABLED) || defined(NORMALMAP_ENABLED)
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
#endif
#if defined(AOMAP_ENABLED)
varying vec2 v_Texcoord2;
#endif
void main()
{
    vec3 skinnedPosition = position;
    vec3 skinnedNormal = normal;
    vec3 skinnedTangent = tangent.xyz;
#ifdef SKINNING
    mat4 skinMatrixWS = getSkinMatrix(joint.x) * weight.x;
if (weight.y > 1e-4)
{
    skinMatrixWS += getSkinMatrix(joint.y) * weight.y;
}
if (weight.z > 1e-4)
{
    skinMatrixWS += getSkinMatrix(joint.z) * weight.z;
}
float weightW = 1.0-weight.x-weight.y-weight.z;
if (weightW > 1e-4)
{
    skinMatrixWS += getSkinMatrix(joint.w) * weightW;
}

    skinnedPosition = (skinMatrixWS * vec4(position, 1.0)).xyz;
    skinnedNormal = (skinMatrixWS * vec4(normal, 0.0)).xyz;
    skinnedTangent = (skinMatrixWS * vec4(tangent.xyz, 0.0)).xyz;
#endif
    gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0);
    v_Texcoord = texcoord * uvRepeat + uvOffset;
    v_WorldPosition = (world * vec4(skinnedPosition, 1.0)).xyz;
    v_Barycentric = barycentric;
    v_Normal = normalize((worldInverseTranspose * vec4(skinnedNormal, 0.0)).xyz);
#if defined(PARALLAXOCCLUSIONMAP_ENABLED) || defined(NORMALMAP_ENABLED)
    v_Tangent = normalize((worldInverseTranspose * vec4(skinnedTangent, 0.0)).xyz);
    v_Bitangent = normalize(cross(v_Normal, v_Tangent) * tangent.w);
#endif
#ifdef VERTEX_COLOR
    v_Color = a_Color;
#endif
#if defined(AOMAP_ENABLED)
    v_Texcoord2 = texcoord2;
#endif
}`;

const ast = glsl.parse(text);
const [a,b] = glsl.getUniformsAndAttributes(ast);

const text2 = `precision highp float;
precision highp int;
#define SHADER_NAME MeshNormalMaterial
#define GAMMA_FACTOR 2
#define MAX_BONES 0
#define NUM_CLIPPING_PLANES 0
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
#ifdef USE_COLOR
	attribute vec3 color;
#endif
#ifdef USE_MORPHTARGETS
	attribute vec3 morphTarget0;
	attribute vec3 morphTarget1;
	attribute vec3 morphTarget2;
	attribute vec3 morphTarget3;
	#ifdef USE_MORPHNORMALS
		attribute vec3 morphNormal0;
		attribute vec3 morphNormal1;
		attribute vec3 morphNormal2;
		attribute vec3 morphNormal3;
	#else
		attribute vec3 morphTarget4;
		attribute vec3 morphTarget5;
		attribute vec3 morphTarget6;
		attribute vec3 morphTarget7;
	#endif
#endif
#ifdef USE_SKINNING
	attribute vec4 skinIndex;
	attribute vec4 skinWeight;
#endif
#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif
#ifdef USE_MORPHTARGETS
	#ifndef USE_MORPHNORMALS
	uniform float morphTargetInfluences[ 8 ];
	#else
	uniform float morphTargetInfluences[ 4 ];
	#endif
#endif
#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	#ifdef BONE_TEXTURE
		uniform sampler2D boneTexture;
		uniform int boneTextureSize;
		mat4 getBoneMatrix( const in float i ) {
			float j = i * 4.0;
			float x = mod( j, float( boneTextureSize ) );
			float y = floor( j / float( boneTextureSize ) );
			float dx = 1.0 / float( boneTextureSize );
			float dy = 1.0 / float( boneTextureSize );
			y = dy * ( y + 0.5 );
			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
			mat4 bone = mat4( v1, v2, v3, v4 );
			return bone;
		}
	#else
		uniform mat4 boneMatrices[ MAX_BONES ];
		mat4 getBoneMatrix( const in float i ) {
			mat4 bone = boneMatrices[ int(i) ];
			return bone;
		}
	#endif
#endif
#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
	#endif
	uniform float logDepthBufFC;
#endif
void main() {
#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif
vec3 objectNormal = vec3( normal );
#ifdef USE_MORPHNORMALS
	objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
	objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
	objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
	objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
#endif
#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif
#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
#endif
vec3 transformedNormal = normalMatrix * objectNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
vec3 transformed = vec3( position );
#ifdef USE_MORPHTARGETS
	transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
	transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
	transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
	transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
	#ifndef USE_MORPHNORMALS
	transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
	transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
	transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
	transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
	#endif
#endif
#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif
#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );
#endif
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
gl_Position = projectionMatrix * mvPosition;
#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
	#else
		gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
		gl_Position.z *= gl_Position.w;
	#endif
#endif
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`;

const ast2 = glsl.parse(text2);
const [a2,b2] = glsl.getUniformsAndAttributes(ast2);
const css="";