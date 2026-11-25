export const DARK_VEIL_FRAGMENT_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform vec2 u_pointer;

  uniform float u_time;
  uniform float u_intensity;
  uniform float u_distortion;
  uniform float u_revealRadius;
  uniform float u_revealIntensity;
  uniform float u_pointerStrength;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(c, -s, s, c);
  }

  float hash(vec2 p) {
    return fract(
      sin(dot(p, vec2(127.1, 311.7))) *
      43758.5453123
    );
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        hash(i),
        hash(i + vec2(1.0, 0.0)),
        u.x
      ),
      mix(
        hash(i + vec2(0.0, 1.0)),
        hash(i + vec2(1.0, 1.0)),
        u.x
      ),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);

      p = rotate(0.45) * p * 2.03;

      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = v_uv;

    float aspect =
      u_resolution.x / max(u_resolution.y, 1.0);

    vec2 p = uv - 0.5;
    p.x *= aspect;

    vec2 mouse = u_pointer - 0.5;
    mouse.x *= aspect;

    float time = u_time;

    float mouseDistance = length(p - mouse);

    float reveal = exp(
      -mouseDistance * mouseDistance /
      max(
        u_revealRadius * u_revealRadius,
        0.001
      )
    ) * u_pointerStrength;

    vec2 warped = p * 2.2;

    warped += vec2(
      sin(p.y * 3.5 + time * 0.8),
      cos(p.x * 2.4 - time * 0.6)
    ) * 0.22 * u_distortion;

    warped +=
      (p - mouse) *
      reveal *
      0.32 *
      u_distortion;

    vec2 flow = vec2(
      fbm(warped + vec2(time * 0.13, 0.0)),
      fbm(warped + vec2(4.7, -time * 0.11))
    );

    float field = fbm(
      warped +
      flow * 2.5 +
      vec2(time * 0.08, -time * 0.06)
    );

    float veil = sin(
      warped.x * 2.2 +
      warped.y * 1.7 +
      field * 7.0 -
      time * 0.45
    );

    veil = veil * 0.5 + 0.5;

    float folds = pow(veil, 5.0);

    float softLight = smoothstep(
      0.25,
      0.85,
      field
    );

    float silverLight =
      folds * 0.24 +
      softLight * 0.12;

    float revealedLight =
      reveal *
      (0.10 + folds * 0.35) *
      u_revealIntensity;

    float edgeGlow = smoothstep(
      0.05,
      0.50,
      abs(uv.x - 0.5)
    );

    vec2 centerPosition = p * vec2(0.85, 1.5);

    float centerMask = 1.0 - exp(
      -dot(centerPosition, centerPosition) * 2.4
    );

    float brightness =
      (silverLight + revealedLight) *
      u_intensity;

    brightness *= mix(
      0.42,
      1.0,
      centerMask
    );

    brightness += edgeGlow * folds * 0.045;

    float verticalFade =
      smoothstep(0.0, 0.18, uv.y) *
      (1.0 - smoothstep(0.82, 1.0, uv.y));

    brightness *= verticalFade;

    vec3 baseColor = vec3(
      0.035,
      0.035,
      0.043
    );

    vec3 silver = vec3(
      0.86,
      0.86,
      0.88
    );

    vec3 color = baseColor + silver * brightness;

    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;
