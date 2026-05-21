"use client";

import { useEffect } from "react";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePlayground } from "@/store/playground";
import { NeuronNode } from "./NeuronNode";
import { buildNodes, buildEdges } from "@/lib/network/graph";
import { activeFeatureLabels } from "@/lib/network/features";

// both pinned at module scope. react flow v11 checks BOTH nodeTypes and
// edgeTypes; leaving edgeTypes as the default object is what trips #002
// under strict-mode double mount, even when nodeTypes is already pinned.
const nodeTypes: NodeTypes = { neuron: NeuronNode };
const edgeTypes: EdgeTypes = {};

function GraphInner() {
  const config = usePlayground((s) => s.config);
  const activations = usePlayground((s) => s.activations);
  const activeFeatures = usePlayground((s) => s.activeFeatures);
  const weights = usePlayground((s) => s.weights);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // rebuild nodes/edges through react flow's own state setters whenever
  // the structure changes. driving via useNodesState (instead of passing
  // a useMemo array straight to <ReactFlow>) keeps react flow's internal
  // store in sync so fitView measures the NEW geometry.
  useEffect(() => {
    const inputLabels = activeFeatureLabels(activeFeatures);
    const nextNodes = buildNodes(config, inputLabels, activations);
    const nextEdges = buildEdges(config, inputLabels.length, weights);
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [config, activations, activeFeatures, weights, setNodes, setEdges]);

  // fit AFTER nodes are committed to the store. keying on nodes.length +
  // the config dims ensures this runs once the new nodes actually exist.
  useEffect(() => {
    if (nodes.length === 0) return;
    // double-rAF: first frame commits DOM, second frame measures it
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        fitView({ padding: 0.25, duration: 200 });
      });
      // store inner id so we can cancel both
      (window as unknown as { __peekFit?: number }).__peekFit = r2;
    });
    return () => {
      cancelAnimationFrame(r1);
      const inner = (window as unknown as { __peekFit?: number }).__peekFit;
      if (inner) cancelAnimationFrame(inner);
    };
  }, [nodes.length, config.neuronCounts, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.1}
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
