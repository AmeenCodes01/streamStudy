import { ConvexError, v } from "convex/values";
import { query, mutation, MutationCtx } from "./_generated/server";
import {
  getAll,
  getManyFrom,
  getOneFrom,
} from "convex-helpers/server/relationships";
import { Id } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./users";

export const get = query({
  handler: async (ctx) => {
    //get all public rooms, rooms user is in, default room.
    const user = await getCurrentUserOrThrow(ctx);
    const publicRooms = await getManyFrom(ctx.db, "rooms", "type", "public");
    const groups = user.roomIds ? await getAll(ctx.db, user.roomIds) : [];

    return { public: publicRooms, groups: groups };
  },
});

export const add = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user) {
      await ctx.db.patch(user._id, { roomIds: [...(user?.roomIds ?? []), id] });
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),

    password: v.optional(v.string()),
    type: v.union(
      v.literal("private"), //default room
      v.literal("public"), //streamer's room
      v.literal("group") // friends created room.
    ),
  },
  handler: async (ctx, { name, type, password }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const existingRoom = await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("name"), name))
      .unique();

    if (existingRoom) {
      throw new ConvexError({ message: "Room with this name already exists" });
    }

    await createRoom(ctx, name, user._id, type, password);
  },
});

export const getOne = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const room = await getOneFrom(ctx.db, "rooms", "name", name);
    return room;
  },
});

export const createSesh = mutation({
  args: {
    roomId: v.id("rooms"),
    duration: v.number(), // Duration in minutes
  },
  handler: async (ctx, args) => {
    const { roomId, duration } = args;
    const user = await getCurrentUserOrThrow(ctx);
    const room = await ctx.db.get(roomId);
    // don't start if one already started.
    if (room && user) {
      await ctx.db.patch(roomId, {
        timerStatus: "not started",
        duration,
        participants: [...(room.participants ?? []), user._id],
      });
    }
  },
});

export const cancelSesh = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const { roomId } = args;
    const room = await ctx.db.get(roomId);
    // don't start if one already started.
    if (room) {
      await ctx.db.patch(roomId, {
        timerStatus: undefined,
        participants: undefined,
        duration: undefined,
        startTime:undefined,
        endTime:undefined
      });
    }
  },
})


export const startSesh = mutation({
  args: {
    roomId: v.id("rooms"),
    // Duration in minutes
  },
  handler: async (ctx, args) => {
    const { roomId } = args;
    const room = await ctx.db.get(roomId);
    console.log(room,"room")
    if (room) {
      const startTime = Date.now();
      const endTime = startTime + (room?.duration as number) * 60000; // Convert minutes to milliseconds
console.log("inside room if")
      await ctx.db.patch(roomId, {
        timerStatus: "running",
        startTime,
        endTime,
      });
    }
  },
});

export const participate = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    // Duration in minutes
  },
  handler: async (ctx, args) => {
    const { roomId, userId } = args;
    const room = await ctx.db.get(roomId);
    if (room && room.timerStatus === "not started") {
      await ctx.db.patch(roomId, {
        participants: [...(room.participants ?? []), userId],
      });
    }
  },
});

export async function createRoom(
  ctx: MutationCtx,
  name: string,
  id: Id<"users">,
  type: "private" | "public" | "group",
  password?: string
) {
  return await ctx.db.insert("rooms", {
    name,
    owner_id: id,
    type: type,
    password: password,
  });
}
