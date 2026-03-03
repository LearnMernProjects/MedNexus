import {Id} from "@/convex/_generated/dataModel";
export type Agent = {
    _id: Id<"AgentTable">,
    agentId: string;
    name: string;
    config?: any;
    published: boolean;
    userId?: Id<"userTable">;
    _creationTime: number;
    nodes?: any;
    edges?: any;
    agentToolConfig?: any;
}