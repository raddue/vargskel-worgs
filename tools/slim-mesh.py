"""Decimate a generated mesh for the holomap: keep the largest parts, cut to ~TARGET faces,
centre it, scale its longest side to 1, and write a GLB with no texture.
Run: python slim-mesh.py IN.glb OUT.glb [target_faces]   (needs pymeshlab + trimesh)
"""
import sys
import pymeshlab
import trimesh

src, dst = sys.argv[1], sys.argv[2]
TARGET = int(sys.argv[3]) if len(sys.argv) > 3 else 12000

m = trimesh.load(src, force="mesh")
ms = pymeshlab.MeshSet()
ms.add_mesh(pymeshlab.Mesh(m.vertices, m.faces))
ms.meshing_remove_connected_component_by_diameter(mincomponentdiag=pymeshlab.PercentageValue(2))
ms.meshing_remove_duplicate_vertices()
ms.meshing_decimation_quadric_edge_collapse(targetfacenum=TARGET, preservenormal=True, preservetopology=False, qualitythr=0.4)
o = ms.current_mesh()
out = trimesh.Trimesh(o.vertex_matrix(), o.face_matrix(), process=True)
out.apply_translation(-out.bounds.mean(axis=0))
out.apply_scale(1.0 / out.extents.max())
out.export(dst)
print(f"{dst}: {len(m.faces)} -> {len(out.faces)} faces")
