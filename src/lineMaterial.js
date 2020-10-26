import React, { useState } from "react";
import {
  Color,
  MeshStandardMaterial,
  Vector2,
} from "three";

class SketchLineMaterial extends MeshStandardMaterial {
  _scale
  _inkColor
  _resolution
  _paperTexture
  _noTexture

  constructor(options = {}) {
    super(options);
    this.setValues(options);
    this._scale = { value: 50 }
    this._inkColor = { value: new Color(0xff0000) }
    this._resolution = { value: new Vector2() }
    this._paperTexture = { value: null }
    this._noTexture = { value: false }
  }

  onBeforeCompile = (shader) => {
    shader.uniforms.scale = this._scale;
    shader.uniforms.inkColor = this._inkColor;
    shader.uniforms.resolution = this._resolution;
    shader.uniforms.paperTexture = this._paperTexture;
    shader.uniforms.noTexture = this._noTexture;

    shader.vertexShader = shader.vertexShader.replace(
      `#include <common>`,
      `#include <common>
      out vec2 vCoords;
      out vec4 vWorldPosition;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      `#include <uv_vertex>`,
      `#include <uv_vertex>
      vCoords = uv;
      vWorldPosition = modelMatrix * vec4(position, 1.);`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <common>`,
      `#include <common>
      uniform vec2 resolution;
      uniform sampler2D paperTexture;
      uniform vec3 inkColor;
      uniform float scale;
      uniform bool noTexture;
      in vec2 vCoords;
      in vec4 vWorldPosition;
      #define TAU 6.28318530718
      
      // procedural noise from IQ
      vec2 hash( vec2 p )
      {
        p = vec2( dot(p,vec2(127.1,311.7)),
            dot(p,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
      }

      float noise( in vec2 p )
      {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
        
        vec2 i = floor( p + (p.x+p.y)*K1 );
        
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;
        
        vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
        
        vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
        
        return dot( n, vec3(70.0) );
      }

      /////////

      float aastep(float threshold, float value) {
        #ifdef GL_OES_standard_derivatives
          float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
          return smoothstep(threshold-afwidth, threshold+afwidth, value);
        #else
          return step(threshold, value);
        #endif  
      }

      float hetched(vec2 p, vec2 q)
      { 
        return (1.45*abs(p.y) + .3 * noise(q));
      }

      vec3 texcube(in vec3 p, in vec3 n, in vec3 q) {
        vec3 v = vec3(hetched(p.yz,q.xy), hetched(p.zx,q.xy), hetched(p.xy,q.xy));
        return v;
      }

      float luma(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }
      float luma(vec4 color) {
        return dot(color.rgb, vec3(0.299, 0.587, 0.114));
      }
      float blendColorBurn(float base, float blend) {
        return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
      }
      
      vec3 blendColorBurn(vec3 base, vec3 blend) {
        return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
      }
      
      vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
        return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
      }
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
      float l = 1.-luma(gl_FragColor.rgb);
      ivec2 size = textureSize(paperTexture, 0);
      vec4 paper = texture(paperTexture, gl_FragCoord.xy / vec2(float(size.x), float(size.y)));
      vec3 coords = scale * vCoords.xyy;
      vec3 qr = coords.xyz;
      vec3 line = texcube(2.0*fract(qr) - 1.0, vec3(1.), 1. * coords)*(1.-l);
      float r = aastep(.5*l, line.x);
      if (noTexture) {
        gl_FragColor.rgb = blendColorBurn(vec3(1.0), inkColor, 1.-r);
        if (gl_FragColor.r == 1.0 && gl_FragColor.b == 1.0 && gl_FragColor.g == 1.0) {
          gl_FragColor.a = 0.0;
        }
      } else {
        gl_FragColor.rgb = blendColorBurn(paper.rgb, inkColor, 1.-r);
      }
      `
    );
  };

  get scale() {
    return this._scale.value;
  }

  set scale(v) {
    this._scale.value = v;
  }
  
  get inkColor() {
    return this._inkColor.value;
  }

  set inkColor(v) {
    this._inkColor.value = v;
  }

  get resolution() {
    return this._resolution.value;
  }

  set resolution(v) {
    this._resolution.value = v;
  }

  get paperTexture() {
    return this._paperTexture.value;
  }

  set paperTexture(v) {
    this._paperTexture.value = v;
  }

  get noTexture() {
    return this._noTexture.value;
  }

  set noTexture(v) {
    this._noTexture.value = v;
  }
}


export const LineMaterial = React.forwardRef(
  (props, ref) => {
    const [material] = useState(() => new SketchLineMaterial(), []);
    return (
      <primitive object={material} ref={ref} attach="material" {...props} />
    );
  }
);
