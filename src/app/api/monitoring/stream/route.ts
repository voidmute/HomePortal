import { NextResponse } from "next/server";
import si from "systeminformation";
import { requireAdmin } from "@/lib/auth";
import { apiErrorStatus, msg, toUserError } from "@/lib/messages";

export async function GET() {
  try {
    await requireAdmin();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let active = true;

        const send = async () => {
          if (!active) return;
          try {
            const [load, mem, fsSize, time] = await Promise.all([
              si.currentLoad(),
              si.mem(),
              si.fsSize(),
              si.time(),
            ]);

            const primaryDisk = fsSize[0] || { size: 0, used: 0, available: 0, use: 0 };

            const data = {
              cpu: Math.round(load.currentLoad),
              memory: {
                used: mem.used,
                total: mem.total,
                percent: Math.round((mem.used / mem.total) * 100),
              },
              disk: {
                used: primaryDisk.used,
                total: primaryDisk.size,
                percent: Math.round(primaryDisk.use),
              },
              uptime: time.uptime,
              timestamp: Date.now(),
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (err) {
            console.error("[monitoring] metrics collection failed:", err);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg.metricsUnavailable })}\n\n`));
          }
        };

        await send();
        const interval = setInterval(send, 2000);

        return () => {
          active = false;
          clearInterval(interval);
        };
      },
      cancel() {},
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = toUserError(err);
    // No user input on this route — non-auth failures are server/infra issues, not 400s.
    const status = apiErrorStatus(message) === 400 ? 500 : apiErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
