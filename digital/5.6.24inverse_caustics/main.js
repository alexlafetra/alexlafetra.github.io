/*

resources: evan wallace's webGL demo write up on caustics
https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c

snell's law wiki page:
https://en.wikipedia.org/wiki/Snell%27s_law

The long-term goal: be able to draw/create an input image and 
produce geometry that can create that image through diffraction.

Instead of deforming a mesh by refracting it through water, we start with
a DEFORMED mesh and find the surface we would need to turn it into an evenly-
spaced grid of vertices

start by:
turning target image into a mesh with a set number of points
- lighter areas mean larger triangles, darker areas mean smaller triangles

WAIT NO
start by:
start w a grid mesh, deform it to fit the target image using the dark/light
small/big triangle method and KEEP TRACK of how each vertice is deformed
each "deformation vector" represents how that vertex should be refracted through
a surface

just taking the X component of the diffraction vector:

*/