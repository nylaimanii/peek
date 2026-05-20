"use client";

import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePlayground } from "@/store/playground";
import { NeuronNode, type NeuronData } from "./NeuronNode";
import { buildNodes, buildEdges } from "@/lib/network/graph";

// defined at module scope so it's not recreated each render (react flow #002)
const nodeTypes: NodeTypes = { neuron: NeuronNode };

function GraphInner() {
  const config = usePlayground((s) => s.config);
  const { fitView } = useReactFlow();

  const nodes: Node<NeuronData>[] = useMemo(
    () => buildNodes(config),
    [config]
  );
  const edges: Edge[] = useMemo(() => buildEdges(config), [config]);

  // re-fit whenever the structure changes (layers/neurons sliders)
  useEffect(() => {
    // small delay so nodes are committed before fitting
    const id = requestAnimationFrame(() => {
      fitView({ padding: 0.25, duration: 200 });
    });
    return () => cancelAnimationFrame(id);
  }, [config.hiddenLayers, config.neuronsPerLayer, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
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
  );
}

export function NetworkGraph() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <GraphInner />
      </ReactFlowProvider>
    </div>
  );
}
