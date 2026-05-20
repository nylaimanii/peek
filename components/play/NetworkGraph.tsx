"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  type NodeTypes,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePlayground } from "@/store/playground";
import { NeuronNode, type NeuronData } from "./NeuronNode";
import { buildNodes, buildEdges } from "@/lib/network/graph";

const nodeTypes: NodeTypes = { neuron: NeuronNode };

export function NetworkGraph() {
  const config = usePlayground((s) => s.config);

  const nodes: Node<NeuronData>[] = useMemo(
    () => buildNodes(config),
    [config]
  );
  const edges: Edge[] = useMemo(() => buildEdges(config), [config]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background color="var(--color-ink-300)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
