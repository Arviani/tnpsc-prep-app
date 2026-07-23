import { NextResponse } from "next/server";
import { ModelManager } from "@/lib/ai/ModelManager";

export async function GET() {
    try {
        const modelManager = ModelManager.getInstance();
        const models = await modelManager.getModels();
        return NextResponse.json({ models });
    } catch (error) {
        console.error("AI Models Route Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!body.models || !Array.isArray(body.models)) {
            return NextResponse.json({ error: "Invalid models payload" }, { status: 400 });
        }
        
        const modelManager = ModelManager.getInstance();
        await modelManager.saveModels(body.models);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("AI Models Save Error:", error);
        return NextResponse.json(
            { error: "Failed to save models" },
            { status: 500 }
        );
    }
}
