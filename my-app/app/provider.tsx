"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { ReactFlowProvider, type Edge, type Node } from "@xyflow/react";

import { api } from "@/convex/_generated/api";
import { UserDetailContext } from "./context/UserDetailContext";
import { WorkflowContext } from "./context/WorkflowContext";

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);
  const createUser = useMutation(api.user.default);

  const [addedNodes, setAddedNodes] = useState<Node[]>([
    {
      id: "Start",
      type: "StartNode",
      data: { label: "Start" },
      position: { x: 0, y: 0 },
    },
  ]);
  const [nodeEdges, setNodeEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (isLoaded && user) CreateAndGetUser();
  }, [user?.id, isLoaded]);

  const CreateAndGetUser = async () => {
    if (!user) return;

    try {
      const result = await createUser({
        name: user.firstName ?? user.username ?? "Anonymous",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl || "",
        clerkUserId: user.id,
      });
      setUserDetail(result);
    } catch (error) {
      console.error("Error syncing user to Convex:", error);
    }
  };

  return (
    <UserDetailContext.Provider
      value={{
        _id: userDetail?._id,
        name: user?.firstName ?? user?.username ?? "Anonymous",
        email: user?.emailAddresses[0]?.emailAddress || "",
        imageUrl: user?.imageUrl || "",
        token: userDetail?.token ?? 0,
      }}
    >
      <ReactFlowProvider>
        <WorkflowContext.Provider
          value={{
            addedNodes,
            setAddedNodes,
            nodeEdges,
            setNodeEdges,
            selectedNode,
            setSelectedNode,
          }}
        >
          <div>{children}</div>
        </WorkflowContext.Provider>
      </ReactFlowProvider>
    </UserDetailContext.Provider>
  );
}

export default Provider;