# three.js r187

Pinned npm package: `three@0.187.0`. MIT license in `LICENSE`.

`three.module.min.js` bundles the official `build/three.module.js` and its
`three.core.js` dependency. r187 no longer publishes minified builds. Generated
once for this static site, with no runtime CDN or site build step:

```sh
npm pack three@0.187.0
tar xzf three-0.187.0.tgz
npx -y esbuild@0.25.10 package/build/three.module.js --bundle --minify --format=esm --target=es2020 --legal-comments=inline --outfile=three.module.min.js
```

A version header was prepended. The four addons are unchanged upstream source,
with matching version headers: OrbitControls, GLTFLoader, and GLTFLoader's
BufferGeometryUtils and SkeletonUtils dependencies. No other addons ship.

Build plus addons: 960,787 bytes raw, 238,486 bytes gzip (level 9).
Unminified r187 build/core alone: 2,133,699 bytes raw, about 419 KB gzip.
The bundled build saves offline storage and transfer without downgrading three.js.

Official references consulted:
- https://threejs.org/manual/pages/installation.html
- https://threejs.org/manual/pages/rendering-on-demand.html
- https://threejs.org/manual/pages/how-to-dispose-of-objects.html
- https://threejs.org/docs/pages/OrbitControls.html
- https://threejs.org/docs/pages/WebGLRenderer.html
