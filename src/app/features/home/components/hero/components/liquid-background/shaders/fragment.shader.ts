export const LIQUID_FRAGMENT_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;
  uniform float u_pointerStrength;

  uniform vec4 u_ripples[8];

  varying vec2 v_uv;

  const float PI = 3.14159265359;

  vec2 aspectCorrect(vec2 position) {
    float aspect = u_resolution.x / u_resolution.y;

    return vec2(
      position.x * aspect,
      position.y
    );
  }

  float ambientWaves(vec2 position) {
    float wave = 0.0;

    wave += sin(
      position.x * 7.0 +
      position.y * 4.0 +
      u_time * 0.35
    ) * 0.024;

    wave += sin(
      position.x * -5.0 +
      position.y * 9.0 -
      u_time * 0.28
    ) * 0.018;

    wave += sin(
      position.x * 12.0 +
      position.y * 7.0 +
      u_time * 0.2
    ) * 0.009;

    return wave;
  }

  float rippleWave(
    vec2 position,
    vec2 origin,
    float startTime,
    float strength
  ) {
    float age = u_time - startTime;

    if (age < 0.0 || age > 3.0 || strength <= 0.0) {
      return 0.0;
    }

    float distanceToOrigin = length(
      position - aspectCorrect(origin)
    );

    float radius = age * 0.42;
    float waveDistance = distanceToOrigin - radius;

    float envelope = exp(
      -waveDistance * waveDistance * 110.0
    );

    float decay = exp(-age * 1.5);

    float oscillation = sin(
      waveDistance * 42.0
    );

    return oscillation *
      envelope *
      decay *
      strength *
      0.065;
  }

  float surfaceHeight(vec2 uv) {
    vec2 position = aspectCorrect(uv);

    float height = ambientWaves(position);

    for (int i = 0; i < 8; i++) {
      vec4 ripple = u_ripples[i];

      height += rippleWave(
        position,
        ripple.xy,
        ripple.z,
        ripple.w
      );
    }

    float pointerDistance = length(
      position - aspectCorrect(u_pointer)
    );

    height += exp(
      -pointerDistance * pointerDistance * 28.0
    ) * u_pointerStrength * 0.035;

    return height;
  }

  vec3 surfaceNormal(vec2 uv) {
    float epsilon = 0.002;

    float center = surfaceHeight(uv);

    float heightX = surfaceHeight(
      uv + vec2(epsilon, 0.0)
    );

    float heightY = surfaceHeight(
      uv + vec2(0.0, epsilon)
    );

    float derivativeX = (heightX - center) / epsilon;
    float derivativeY = (heightY - center) / epsilon;

    return normalize(
      vec3(
        -derivativeX * 0.45,
        -derivativeY * 0.45,
        1.0
      )
    );
  }

  void main() {
    vec2 uv = v_uv;

    vec3 normal = surfaceNormal(uv);

    vec3 viewDirection = vec3(0.0, 0.0, 1.0);

    vec3 lightDirection = normalize(
      vec3(-0.45, 0.65, 0.65)
    );

    vec3 secondaryLight = normalize(
      vec3(0.7, -0.3, 0.5)
    );

    float diffuse = max(
      dot(normal, lightDirection),
      0.0
    );

    vec3 reflectedLight = reflect(
      -lightDirection,
      normal
    );

    float specular = pow(
      max(dot(reflectedLight, viewDirection), 0.0),
      42.0
    );

    float secondarySpecular = pow(
      max(
        dot(
          reflect(-secondaryLight, normal),
          viewDirection
        ),
        0.0
      ),
      28.0
    );

    float fresnel = pow(
      1.0 - max(dot(normal, viewDirection), 0.0),
      3.0
    );

    vec3 baseColor = vec3(0.025, 0.025, 0.030);

    vec3 silver = vec3(0.68, 0.70, 0.74);

    vec3 color = baseColor;

    color += silver * diffuse * 0.018;
    color += silver * specular * 0.24;
    color += silver * secondarySpecular * 0.09;
    color += silver * fresnel * 0.08;

    vec2 centered = uv - 0.5;

    float vignette = 1.0 - smoothstep(
      0.2,
      0.75,
      length(centered)
    );

    color *= mix(0.3, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;
