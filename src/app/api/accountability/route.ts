import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { AccountabilityPartnersService } from "@/lib/accountability-partners-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const sendRequestSchema = z.object({
    recipientEmail: z.string().email("Invalid email address"),
    message: z.string().max(500, "Message too long").optional()
});

const updatePartnershipSchema = z.object({
    checkInFrequency: z.enum(['Daily', 'Weekly', 'Bi-weekly']).optional(),
    status: z.enum(['Active', 'Paused', 'Ended']).optional(),
    sharedGoals: z.array(z.string()).optional(),
    partnershipId: z.string()
});

const respondRequestSchema = z.object({
    requestId: z.string(),
    accept: z.boolean()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'partnerships';
        const partnerId = searchParams.get('partnerId');
        
        if (type === 'partnerships') {
            // Get user's partnerships
            const partnerships = await AccountabilityPartnersService.getUserPartnerships(user.id);
            return NextResponse.json({
                success: true,
                partnerships
            });
        } else if (type === 'requests') {
            // Get user's requests
            const requests = await AccountabilityPartnersService.getUserRequests(user.id);
            return NextResponse.json({
                success: true,
                requests
            });
        } else if (type === 'analytics') {
            // Get partnership analytics
            const analytics = await AccountabilityPartnersService.getPartnershipAnalytics(user.id);
            return NextResponse.json({
                success: true,
                analytics
            });
        } else if (type === 'partnerProgress' && partnerId) {
            // Get partner's progress
            const progress = await AccountabilityPartnersService.getPartnerProgress(partnerId, user.id);
            return NextResponse.json({
                success: true,
                progress
            });
        } else if (type === 'potentialPartners') {
            // Find potential partners
            const potentialPartners = await AccountabilityPartnersService.findPotentialPartners(user.id);
            return NextResponse.json({
                success: true,
                potentialPartners
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request type" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Accountability partners GET error:", error);
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch accountability data" }, 
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { action } = body;
        
        if (action === 'sendRequest') {
            // Send partnership request
            const { recipientEmail, message } = sendRequestSchema.parse(body);
            
            const request = await AccountabilityPartnersService.sendPartnershipRequest(
                user.id, 
                recipientEmail, 
                message
            );
            
            return NextResponse.json({
                success: true,
                request,
                message: "Partnership request sent successfully"
            });
        } else if (action === 'respondRequest') {
            // Respond to partnership request
            const { requestId, accept } = respondRequestSchema.parse(body);
            
            const request = await AccountabilityPartnersService.respondToRequest(
                requestId, 
                user.id, 
                accept
            );
            
            return NextResponse.json({
                success: true,
                request,
                message: `Partnership request ${accept ? 'accepted' : 'rejected'} successfully`
            });
        } else if (action === 'updatePartnership') {
            // Update partnership settings
            const { partnershipId, ...updateData } = updatePartnershipSchema.parse(body);
            
            if (!partnershipId) {
                return NextResponse.json(
                    { error: "Partnership ID is required" }, 
                    { status: 400 }
                );
            }
            
            const partnership = await AccountabilityPartnersService.updatePartnership(
                partnershipId, 
                user.id, 
                updateData
            );
            
            return NextResponse.json({
                success: true,
                partnership,
                message: "Partnership updated successfully"
            });
        } else if (action === 'recordCheckIn') {
            // Record check-in
            const { partnershipId, notes } = body;
            
            if (!partnershipId) {
                return NextResponse.json(
                    { error: "Partnership ID is required" }, 
                    { status: 400 }
                );
            }
            
            const partnership = await AccountabilityPartnersService.recordCheckIn(
                partnershipId, 
                user.id
            );
            
            return NextResponse.json({
                success: true,
                partnership,
                message: "Check-in recorded successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Accountability partners POST error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}` },
                { status: 400 }
            );
        }
        if (error.message?.includes('Validation')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 400 }
            );
        }
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to process accountability request" }, 
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const partnershipId = searchParams.get('partnershipId');
        
        if (partnershipId) {
            // Remove accountability partner
            await AccountabilityPartnersService.removePartner(partnershipId, user.id);
            
            return NextResponse.json({
                success: true,
                message: "Accountability partner removed successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Partnership ID is required" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Accountability partners DELETE error:", error);
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: "Failed to remove accountability partner" }, 
            { status: 500 }
        );
    }
}