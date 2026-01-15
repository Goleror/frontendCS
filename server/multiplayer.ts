import type { Express } from "express";
import { storage } from "./storage";
import { nanoid } from "nanoid";

export function registerMultiplayerRoutes(app: Express) {
  // Create game room
  app.post("/api/multiplayer/rooms", async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const roomCode = nanoid(6).toUpperCase();
      const { maxPlayers = 4 } = req.body;

      const room = {
        roomCode,
        creatorId: userId,
        maxPlayers,
        isActive: true,
        createdAt: new Date(),
      };

      // Save to storage
      const rooms = (req as any).app.locals.gameRooms || [];
      rooms.push(room);
      (req as any).app.locals.gameRooms = rooms;

      // Automatically add creator as first player
      const roomPlayers = (req as any).app.locals.roomPlayers || [];
      roomPlayers.push({
        roomId: roomCode,
        playerId: userId,
        team: "red",
        score: 0,
        isReady: false,
        joinedAt: new Date(),
      });
      (req as any).app.locals.roomPlayers = roomPlayers;

      res.json({ roomCode, ...room, creatorJoined: true });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // Join room
  app.post("/api/multiplayer/rooms/:roomCode/join", async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { roomCode } = req.params;
      const rooms = (req as any).app.locals.gameRooms || [];
      const room = rooms.find((r: any) => r.roomCode === roomCode);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      if (!room.isActive) {
        res.status(400).json({ error: "Room is not active" });
        return;
      }

      const roomPlayers = (req as any).app.locals.roomPlayers || [];
      const playerCount = roomPlayers.filter((p: any) => p.roomId === room.roomCode).length;

      if (playerCount >= room.maxPlayers) {
        res.status(400).json({ error: "Room is full" });
        return;
      }

      // Assign to team with fewer players
      const redTeamCount = roomPlayers.filter((p: any) => p.roomId === roomCode && p.team === "red").length;
      const blueTeamCount = roomPlayers.filter((p: any) => p.roomId === roomCode && p.team === "blue").length;
      const team = redTeamCount <= blueTeamCount ? "red" : "blue";

      const player = {
        roomId: roomCode,
        playerId: userId,
        team,
        score: 0,
        isReady: false,
        joinedAt: new Date(),
      };

      roomPlayers.push(player);
      (req as any).app.locals.roomPlayers = roomPlayers;

      res.json({ success: true, roomCode, playerId: userId, team });
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  // Get room info
  app.get("/api/multiplayer/rooms/:roomCode", async (req, res) => {
    try {
      const { roomCode } = req.params;
      const rooms = (req as any).app.locals.gameRooms || [];
      const room = rooms.find((r: any) => r.roomCode === roomCode);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const roomPlayers = (req as any).app.locals.roomPlayers || [];
      const players = roomPlayers.filter((p: any) => p.roomId === roomCode);
      
      const teamStats = (req as any).app.locals.teamStats || [];
      const redStats = teamStats.find((s: any) => s.roomId === roomCode && s.team === "red") || { team: "red", totalScore: 0 };
      const blueStats = teamStats.find((s: any) => s.roomId === roomCode && s.team === "blue") || { team: "blue", totalScore: 0 };

      res.json({
        ...room,
        players: players.map((p: any) => ({ 
          playerId: p.playerId,
          team: p.team,
          score: p.score,
          isReady: p.isReady,
        })),
        playerCount: players.length,
        redTeam: {
          players: players.filter((p: any) => p.team === "red"),
          score: redStats.totalScore,
        },
        blueTeam: {
          players: players.filter((p: any) => p.team === "blue"),
          score: blueStats.totalScore,
        },
      });
    } catch (error) {
      console.error("Error getting room:", error);
      res.status(500).json({ error: "Failed to get room" });
    }
  });

  // Send game event (command, error, achievement)
  app.post("/api/multiplayer/events", async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { roomCode, eventType, eventData } = req.body;

      const event = {
        roomId: roomCode,
        playerId: userId,
        eventType,
        eventData: JSON.stringify(eventData),
        createdAt: new Date(),
      };

      const events = (req as any).app.locals.gameEvents || [];
      events.push(event);
      (req as any).app.locals.gameEvents = events;

      // Broadcast to other players in room via WebSocket later
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending event:", error);
      res.status(500).json({ error: "Failed to send event" });
    }
  });

  // Get room events
  app.get("/api/multiplayer/rooms/:roomCode/events", async (req, res) => {
    try {
      const { roomCode } = req.params;
      const events = (req as any).app.locals.gameEvents || [];
      const roomEvents = events.filter((e: any) => e.roomId === roomCode);

      res.json({ events: roomEvents });
    } catch (error) {
      console.error("Error getting events:", error);
      res.status(500).json({ error: "Failed to get events" });
    }
  });

  // Mark player as ready
  app.post("/api/multiplayer/rooms/:roomCode/ready", async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { roomCode } = req.params;
      const roomPlayers = (req as any).app.locals.roomPlayers || [];
      const player = roomPlayers.find((p: any) => p.roomId === roomCode && p.playerId === userId);

      if (player) {
        player.isReady = true;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking ready:", error);
      res.status(500).json({ error: "Failed to mark ready" });
    }
  });

  // Close room
  app.post("/api/multiplayer/rooms/:roomCode/close", async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { roomCode } = req.params;
      const rooms = (req as any).app.locals.gameRooms || [];
      const room = rooms.find((r: any) => r.roomCode === roomCode);

      if (!room || room.creatorId !== userId) {
        res.status(403).json({ error: "Not authorized to close room" });
        return;
      }

      room.isActive = false;
      res.json({ success: true });
    } catch (error) {
      console.error("Error closing room:", error);
      res.status(500).json({ error: "Failed to close room" });
    }
  });

  // Update team score (for competitive mode)
  app.post("/api/multiplayer/rooms/:roomCode/teams/:team/score", async (req, res) => {
    try {
      const { roomCode, team } = req.params;
      const { points } = req.body;

      if (!["red", "blue"].includes(team)) {
        res.status(400).json({ error: "Invalid team" });
        return;
      }

      const teamStats = (req as any).app.locals.teamStats || [];
      let teamStat = teamStats.find((s: any) => s.roomId === roomCode && s.team === team);

      if (!teamStat) {
        teamStat = {
          roomId: roomCode,
          team,
          totalScore: 0,
          commandsExecuted: 0,
          errorsCount: 0,
          achievementsUnlocked: 0,
          createdAt: new Date(),
        };
        teamStats.push(teamStat);
      }

      teamStat.totalScore = (teamStat.totalScore || 0) + (points || 0);
      (req as any).app.locals.teamStats = teamStats;

      res.json({ success: true, totalScore: teamStat.totalScore });
    } catch (error) {
      console.error("Error updating team score:", error);
      res.status(500).json({ error: "Failed to update team score" });
    }
  });
}
